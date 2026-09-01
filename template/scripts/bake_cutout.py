"""Bake a transparent cut-out of the speaker, for the pop-out face shot.

The pop-out layout draws the subject twice: once inside the card (background
and all) and once on top with the background removed, so whatever sits above
the card's top edge reads against the page ground instead of against the room.

Remotion cannot segment at render time, so the second copy is baked here into a
VP9 WebM with an alpha channel - the one web video format Chrome will composite
transparently.

Bake at SOURCE resolution and SOURCE timing. PopoutFaceShot scales and trims
the cut-out with exactly the same maths it applies to the camera original, so
the two layers only stay in register if they share a timebase.

    python scripts/bake_cutout.py                    # whole source
    python scripts/bake_cutout.py --from 16 --to 21  # a range, for a test
    python scripts/bake_cutout.py --engine rvm       # the heavier matting model

Two engines. **rembg is the default, by house decision** - it was judged the
better-looking edge on this footage, and it is the faster of the two.

  rembg  u2net_human_seg, plus a 3-tap temporal blend on the matte. Per-frame
         and independent, so in principle the edge crawls; measured on this
         footage it is the MORE stable of the two, because the blend is a
         temporal low-pass. ~0.19s per 1080p frame.

  rvm    RobustVideoMatting. A recurrent video matting model. The reason to
         reach for it is edge detail, not stability: it resolves individual
         hair strands where rembg gives a smooth hard cut, and its `fgr` output
         is spill-suppressed. It is ~2.2x slower and measured slightly worse on
         frame-to-frame flicker here. Needs torch; see RVM_ROOT below.

`auto` picks rvm when it can import, and falls back to rembg. Not the default -
ask for it explicitly.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public' / 'footage.mov'
OUT = ROOT / 'public' / 'cutout.webm'

# RVM ships as a repo plus a weights file rather than a pip package:
#   git clone --depth 1 https://github.com/PeterL1n/RobustVideoMatting \
#     ~/.rvm/RobustVideoMatting
#   curl -L -o ~/.rvm/rvm_mobilenetv3.pth https://github.com/PeterL1n/\
#     RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3.pth
RVM_ROOT = Path(os.environ.get('RVM_ROOT', Path.home() / '.rvm'))

# What the model authors recommend at 1080p. Higher is slower for no gain;
# lower and fine hair goes soft.
RVM_DOWNSAMPLE = 0.25

# rembg only. A 3-tap blend on the matte: per-frame segmentation is
# independent, so the hair edge crawls, and this damps it without the ghosting
# a wider window causes.
TAPS = (0.25, 0.5, 0.25)


def probe_fps(path: Path) -> float:
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
         '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', str(path)],
        capture_output=True, text=True, check=True).stdout.strip()
    num, den = out.split('/')
    return float(num) / float(den)


def write_rgba(rgb: np.ndarray, alpha: np.ndarray, path: Path) -> None:
    arr = np.dstack([rgb.astype(np.uint8), alpha.clip(0, 255).astype(np.uint8)])
    Image.fromarray(arr, 'RGBA').save(path)


def rvm_available() -> bool:
    try:
        import torch  # noqa: F401
    except ImportError:
        return False
    return (RVM_ROOT / 'RobustVideoMatting' / 'model').is_dir() and any(
        (RVM_ROOT / n).exists()
        for n in ('rvm_mobilenetv3.pth', 'rvm_resnet50.pth'))


def bake_rvm(files: list[Path], out_dir: Path, variant: str) -> None:
    import torch
    sys.path.insert(0, str(RVM_ROOT / 'RobustVideoMatting'))
    from model import MattingNetwork  # type: ignore

    net = MattingNetwork(variant).eval()
    net.load_state_dict(
        torch.load(RVM_ROOT / f'rvm_{variant}.pth', map_location='cpu'))

    # The recurrent state, threaded frame to frame. This is the entire reason
    # the edge is stable - reset it and you are back to per-frame segmentation.
    rec: list = [None] * 4
    with torch.no_grad():
        for i, f in enumerate(files):
            src = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32) / 255.0
            t = torch.from_numpy(src).permute(2, 0, 1).unsqueeze(0)
            fgr, pha, *rec = net(t, *rec, downsample_ratio=RVM_DOWNSAMPLE)
            # fgr is the spill-suppressed foreground, not the raw frame: it is
            # what stops room colour showing through semi-transparent hair.
            rgb = (fgr[0].permute(1, 2, 0).numpy() * 255).clip(0, 255)
            write_rgba(rgb, pha[0, 0].numpy() * 255, out_dir / f'{i:05d}.png')
            if i % 120 == 0:
                print(f'  {i}/{len(files)}', flush=True)


def bake_rembg(files: list[Path], out_dir: Path) -> None:
    from rembg import new_session, remove

    sess = new_session('u2net_human_seg')
    rgbs: list[Image.Image] = []
    mattes: list[np.ndarray] = []

    def emit(rgb: Image.Image, matte: np.ndarray, i: int) -> None:
        write_rgba(np.array(rgb), matte, out_dir / f'{i:05d}.png')

    for i, f in enumerate(files):
        rgb = Image.open(f).convert('RGB')
        rgbs.append(rgb)
        mattes.append(np.array(remove(rgb, session=sess))[:, :, 3].astype(np.float32))
        if i == 0:
            emit(rgbs[0], mattes[0], 0)                      # no history yet
        if len(mattes) == 3:
            emit(rgbs[1], sum(t * m for t, m in zip(TAPS, mattes)), i - 1)
            rgbs.pop(0)
            mattes.pop(0)
        if i % 120 == 0:
            print(f'  {i}/{len(files)}', flush=True)
    if len(files) > 1:
        emit(rgbs[-1], mattes[-1], len(files) - 1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', type=Path, default=SOURCE)
    ap.add_argument('--out', type=Path, default=OUT)
    ap.add_argument('--from', dest='start', type=float, default=None)
    ap.add_argument('--to', dest='end', type=float, default=None)
    ap.add_argument('--engine', choices=['auto', 'rvm', 'rembg'], default='rembg')
    ap.add_argument('--variant', choices=['mobilenetv3', 'resnet50'],
                    default='mobilenetv3',
                    help='rvm only; resnet50 is slower and slightly sharper')
    a = ap.parse_args()

    if not a.source.exists():
        print(f'no source at {a.source}', file=sys.stderr)
        return 1
    if shutil.which('ffmpeg') is None:
        print('ffmpeg not on PATH', file=sys.stderr)
        return 1

    engine = a.engine
    if engine == 'auto':
        engine = 'rvm' if rvm_available() else 'rembg'
    if engine == 'rvm' and not rvm_available():
        print('rvm unavailable: needs torch, plus the repo and weights under '
              f'{RVM_ROOT}', file=sys.stderr)
        return 1

    fps = probe_fps(a.source)
    tmp = Path(tempfile.mkdtemp(prefix='cutout-'))
    frames, rgba = tmp / 'in', tmp / 'out'
    frames.mkdir()
    rgba.mkdir()

    trim = []
    if a.start is not None:
        trim += ['-ss', str(a.start)]
    if a.end is not None:
        trim += ['-t', str(a.end - (a.start or 0))]
    subprocess.run(['ffmpeg', '-v', 'error', *trim, '-i', str(a.source),
                    '-r', str(fps), str(frames / '%05d.png')], check=True)

    files = sorted(frames.glob('*.png'))
    print(f'{len(files)} frames at {fps:g}fps, engine={engine}', flush=True)

    if engine == 'rvm':
        bake_rvm(files, rgba, a.variant)
    else:
        bake_rembg(files, rgba)

    a.out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-framerate', str(fps),
         '-i', str(rgba / '%05d.png'),
         # yuva420p is what carries the alpha; -auto-alt-ref 0 is required or
         # libvpx silently drops it.
         '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0',
         '-crf', '28', '-b:v', '0', '-an', str(a.out), '-y'], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f'wrote {a.out} ({a.out.stat().st_size / 1e6:.1f} MB)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
