"""Measure the RENDERED geometry of a frame against the Instagram safe zone.

Run: python scripts/safezone.py out/stills/*.png

Reads the picture, not the source. Every safe-zone violation on the last build
came from a number that looked right in the code and was wrong on the frame:
a percentage that resolved against the B-roll zone instead of the frame, a
`boxW = W` that scaled a stepper to exactly 1080, a card at `width: 86%` whose
right edge landed under the action rail. None of them looked broken in Studio,
which draws the full frame with no phone around it.

Method: take the frame's median as the ground level, mask everything far from
it, group the masked rows into bands, and print each band's extents.

Two things to know when reading the output. Grain defeats a naive threshold, so
on a grained ground the cut has to sit well above the grain's spread. And drop
shadows count as pixels, so a card measures a few px wider than its box -
shadows may sit in the rail, text may not.
"""
import glob, io, os, sys
import numpy as np
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SAFE = dict(top=220, bottom=1920 - 450, left=35, right=1080 - 100)
THRESH = 70          # above the grain's spread; a naive 18 bands the whole width
MIN_ROWS = 6         # ignore a stray row of antialiasing

paths = []
for a in sys.argv[1:]:
    paths += sorted(glob.glob(a))

for p in paths:
    im = np.asarray(Image.open(p).convert('L')).astype(int)
    ground = np.median(im)
    mask = np.abs(im - ground) > THRESH

    rows = mask.any(axis=1)
    bands, i = [], 0
    while i < len(rows):
        if rows[i]:
            j = i
            while j < len(rows) and rows[j]:
                j += 1
            if j - i >= MIN_ROWS:
                bands.append((i, j))
            i = j
        else:
            i += 1

    print(f"\n=== {os.path.basename(p)}   ground {ground:.0f}   {len(bands)} band(s)")
    if not bands:
        print("    (nothing above threshold - flat frame)")
    for a, b in bands:
        cols = mask[a:b].any(axis=0)
        xs = np.nonzero(cols)[0]
        x0, x1 = int(xs.min()), int(xs.max())
        bad = []
        if a < SAFE['top']:
            bad.append(f"top {a}<{SAFE['top']}")
        if b > SAFE['bottom']:
            bad.append(f"bottom {b}>{SAFE['bottom']}")
        if x0 < SAFE['left']:
            bad.append(f"left {x0}<{SAFE['left']}")
        if x1 > SAFE['right']:
            bad.append(f"right {x1}>{SAFE['right']}")
        flag = '  <-- ' + ', '.join(bad) if bad else ''
        print(f"    y {a:4}-{b:4}  x {x0:4}-{x1:4}  ({x1 - x0 + 1:4} x {b - a:4}){flag}")
