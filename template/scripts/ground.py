"""Measure the rendered ground of a frame, and confirm the grain is static.

Run: python scripts/ground.py out/stills/a.png out/stills/b.png

Judge the ground off a render, never off the hex. The grain is screen-blended,
and screen can only lighten, so the rendered ground always measures brighter
than its token: on the last build it landed at 44 against a token of 16, which
reads as charcoal rather than near-black. Gamma'd down it sits near 21 with the
grain MORE visible, because the contrast between speck and ground goes up as
the mean comes down.

Two frames from the same shot must be identical in the grain region. Animated
noise breaks Remotion's determinism and is the worst possible input to an
inter-frame codec - it survives the local render and dissolves the moment
Instagram re-encodes it, taking the rest of the picture with it.
"""
import io, sys
import numpy as np
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# A patch of bare ground: left margin, above the face box and clear of any card.
PATCH = (10, 60, 90, 200)   # x0, y0, x1, y1

ims = []
for p in sys.argv[1:]:
    a = np.asarray(Image.open(p).convert('RGB')).astype(float)
    patch = a[PATCH[1]:PATCH[3], PATCH[0]:PATCH[2]]
    ims.append((p, a, patch))
    print(f"{p}\n    ground mean {patch.mean():6.2f}   sd {patch.std():5.2f}   "
          f"min {patch.min():3.0f}  max {patch.max():3.0f}")

if len(ims) >= 2:
    d = np.abs(ims[0][2] - ims[1][2])
    same = d.max() < 0.5
    print(f"\ngrain identical between the two frames: {same}   (max delta {d.max():.1f})")
