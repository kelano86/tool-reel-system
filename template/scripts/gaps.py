"""Print internal dead air inside a chosen region, so a long take can be tightened.

Region 2 came in at 140wpm against 172 for the rest of the shoot, which is the
signature of a pause mid-take rather than slow delivery. This locates it.

Run: python scripts/gaps.py <from> <to>
"""
import os, sys, wave, io
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WAV = os.path.join(ROOT, 'scripts', '.footage.wav')

a, b = float(sys.argv[1]), float(sys.argv[2])

w = wave.open(WAV, 'rb'); sr = w.getframerate()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
w.close()

HOP, WIN = 0.01, int(0.03 * sr)
hop = int(HOP * sr)
seg = pcm[int(a * sr):int(b * sr)]
n = (len(seg) - WIN) // hop
db = 20 * np.log10(np.array(
    [np.sqrt(np.mean(seg[i * hop:i * hop + WIN] ** 2) + 1e-12) for i in range(n)]))

quiet = db <= -35.0
runs, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if (j - i) * HOP >= 0.18:
            runs.append((a + i * HOP, a + j * HOP))
        i = j
    else:
        i += 1

print(f"{a:.2f}->{b:.2f}  ({b-a:.2f}s)   internal quiet runs >=0.18s:")
for s, e in runs:
    print(f"   {s:7.2f} -> {e:7.2f}   ({e-s:5.2f}s)")
print(f"total quiet: {sum(e-s for s,e in runs):.2f}s")
