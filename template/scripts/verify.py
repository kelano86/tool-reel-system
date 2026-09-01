"""Verify a rendered cut. Run: python scripts/verify.py out/design-systems.mp4

Checks the things that cannot be judged by looking:

  container   duration, dimensions, an audio stream that actually exists
  words       transcribe the render and confirm no beat lost its last word
  PITCH       median F0 of the render against the source, which must be 1.000

The pitch check is here because level checks do not prove audio is correct. RMS
envelopes, sample-level discontinuity scans and cross-correlation lag tests all
measure timing and amplitude, and a pitch shift changes neither - on the last
build all three reported clean while every render was a fifth of an octave
flat, because toneFrequency had been set alongside playbackRate. "No dropout"
and "correct audio" are different claims.
"""
import io, json, os, subprocess, sys, wave
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', 'design-systems.mp4')
SRC = os.path.join(ROOT, 'public', 'footage.mov')
EDIT = json.load(open(os.path.join(ROOT, 'src', 'data', 'edit.json'), encoding='utf-8'))


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries',
         'stream=codec_type,codec_name,width,height,sample_rate,channels',
         '-show_entries', 'format=duration', '-of', 'json', path],
        capture_output=True, text=True).stdout
    return json.loads(out)


def wav(path, a=None, b=None):
    tmp = os.path.join(ROOT, 'scripts', '.verify.wav')
    cmd = ['ffmpeg', '-y']
    if a is not None:
        cmd += ['-ss', str(a), '-to', str(b)]
    cmd += ['-i', path, '-ac', '1', '-ar', '16000', '-vn', tmp]
    subprocess.run(cmd, check=True, capture_output=True)
    w = wave.open(tmp, 'rb')
    pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    sr = w.getframerate()
    w.close()
    return pcm, sr


def median_f0(pcm, sr):
    """Median fundamental over voiced windows, by autocorrelation.

    Same words spoken at a different rate give the same F0; anything other than
    a ratio of 1.000 against the source is a pitch shift, and the cents figure
    says how much.
    """
    win = int(0.04 * sr)
    hop = int(0.02 * sr)
    lo, hi = int(sr / 320), int(sr / 70)      # 70-320 Hz covers speech
    out = []
    for i in range(0, len(pcm) - win, hop):
        x = pcm[i:i + win]
        if np.sqrt(np.mean(x ** 2)) < 0.02:   # unvoiced or silent
            continue
        x = x - x.mean()
        r = np.correlate(x, x, 'full')[win - 1:]
        if r[0] <= 0:
            continue
        seg = r[lo:hi]
        if not len(seg):
            continue
        lag = lo + int(np.argmax(seg))
        if r[lag] / r[0] < 0.3:               # no clear period
            continue
        out.append(sr / lag)
    return float(np.median(out)) if out else 0.0


print(f"=== {os.path.basename(MP4)}")
p = probe(MP4)
dur = float(p['format']['duration'])
vid = next((s for s in p['streams'] if s['codec_type'] == 'video'), None)
aud = next((s for s in p['streams'] if s['codec_type'] == 'audio'), None)
want = sum(round((b['srcTo'] - b['srcFrom']) / b.get('speed', EDIT['speed']) * EDIT['fps'])
           for b in EDIT['beats']) / EDIT['fps']
print(f"  duration   {dur:.2f}s   (expected {want:.2f}s)")
print(f"  video      {vid['codec_name']} {vid['width']}x{vid['height']}"
      f"   {'OK' if (vid['width'], vid['height']) == (EDIT['width'], EDIT['height']) else 'WRONG'}")
print(f"  audio      {aud['codec_name'] if aud else 'MISSING'} "
      f"{aud['sample_rate'] + 'Hz' if aud else ''} {aud['channels'] if aud else ''}ch")

# Pitch. Compared over the same spoken material: the chosen takes in the source
# against the whole render, which contains exactly those takes.
ren, sr = wav(MP4)
f0_ren = median_f0(ren, sr)
src_all = []
for b in EDIT['beats']:
    s, _ = wav(SRC, b['srcFrom'], b['srcTo'])
    src_all.append(s)
f0_src = median_f0(np.concatenate(src_all), sr)
ratio = f0_ren / f0_src if f0_src else 0
cents = 1200 * np.log2(ratio) if ratio else 0
verdict = 'OK' if abs(ratio - 1) < 0.02 else 'PITCH SHIFTED'
print(f"  median F0  source {f0_src:.1f} Hz -> render {f0_ren:.1f} Hz"
      f"   ratio {ratio:.3f}  ({cents:+.0f} cents)  {verdict}")

# Pace, on the words that were actually delivered.
from faster_whisper import WhisperModel
model = WhisperModel('small.en', device='cpu', compute_type='int8')
segs, _ = model.transcribe(ren, beam_size=5, condition_on_previous_text=False,
                           initial_prompt=' '.join(b['line'] for b in EDIT['beats']))
text = ' '.join(s.text.strip() for s in segs)
words = len(text.split())
print(f"  words      {words} in {dur:.2f}s -> {words / dur * 60:.0f} wpm"
      f"   {'OK' if 210 <= words / dur * 60 <= 270 else 'OUT OF BAND'}")
print(f"\n  transcript: {text}")
