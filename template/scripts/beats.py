"""Sustained-RMS speech-region scan.

NOT ffmpeg silencedetect: that latches onto a single mouth click and calls it
speech onset, which puts half a second of room tone at the head of a beat.
Speech starts at the first point where level holds above the threshold for
HOLD seconds, which a transient cannot trigger.

Run: python scripts/beats.py
"""
import os, subprocess, sys, wave, io
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOV = os.path.join(ROOT, 'public', 'footage.mov')
WAV = os.path.join(ROOT, 'scripts', '.footage.wav')

if not os.path.exists(WAV):
    subprocess.run(['ffmpeg', '-y', '-i', MOV, '-ac', '1', '-ar', '16000', '-vn', WAV],
                   check=True, capture_output=True)

w = wave.open(WAV, 'rb'); sr = w.getframerate()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
w.close()

HOP = 0.01
WIN = int(0.03 * sr)
hop = int(HOP * sr)
n = (len(pcm) - WIN) // hop
rms = np.array([np.sqrt(np.mean(pcm[i * hop:i * hop + WIN] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms)

THRESH = -35.0
HOLD = int(0.19 / HOP)     # frames the level must hold before it counts as onset
GAP = 0.42                 # silence shorter than this does not split a region
PREROLL, TAIL = 0.05, 0.18

print(f"duration {len(pcm)/sr:.2f}s   p10 {np.percentile(db,10):.1f}dB   "
      f"p50 {np.percentile(db,50):.1f}dB   p90 {np.percentile(db,90):.1f}dB")

loud = db > THRESH
sust = np.zeros_like(loud)
for i in range(len(loud) - HOLD):
    if loud[i:i + HOLD].all():
        sust[i] = True

gap_f = int(GAP / HOP)
regions = []
i = 0
while i < len(sust):
    if sust[i]:
        j, last = i, i
        while j < len(loud):
            if loud[j]:
                last = j
            elif j - last > gap_f:
                break
            j += 1
        regions.append((i * HOP, last * HOP))
        i = j
    else:
        i += 1

merged = []
for a, b in regions:
    if merged and a - merged[-1][1] < GAP:
        merged[-1] = (merged[-1][0], b)
    else:
        merged.append((a, b))

print(f"\n{len(merged)} speech regions\n")
for k, (a, b) in enumerate(merged):
    a = max(0.0, a - PREROLL)
    b = b + TAIL
    print(f"{k:2}  {a:7.2f} -> {b:7.2f}   ({b - a:5.2f}s)")
