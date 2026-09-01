"""Transcribe each speech region separately so takes can be read and chosen.

Per-region decoding, not one pass over the file: whisper drifts across long
spans, and here the point is only to read what was said in each take.

Run: python scripts/transcribe_regions.py
"""
import os, subprocess, sys, wave, io
import numpy as np
from faster_whisper import WhisperModel

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOV = os.path.join(ROOT, 'public', 'footage.mov')
WAV = os.path.join(ROOT, 'scripts', '.footage.wav')

REGIONS = [
    (3.61, 8.72), (10.67, 23.67), (24.06, 59.47), (64.89, 65.40),
    (106.36, 115.63), (136.57, 137.05), (144.69, 171.76), (172.76, 173.23),
    (175.58, 176.42), (177.03, 177.62), (184.06, 212.86),
]

SEED = ("public-api-lists, 730 free APIs, 15,000 stars on GitHub, OkSurf, "
        "Google News headlines, QuickChart, chart image, AI Model Watch, "
        "250 AI models, pricing, context windows, IPLocate, VPNs, lead forms, "
        "Pexels, stock photo and video library, 48 categories, comment APIS.")

if not os.path.exists(WAV):
    subprocess.run(['ffmpeg', '-y', '-i', MOV, '-ac', '1', '-ar', '16000', '-vn', WAV],
                   check=True, capture_output=True)

w = wave.open(WAV, 'rb'); sr = w.getframerate()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
w.close()

model = WhisperModel('base.en', device='cpu', compute_type='int8')
for i, (a, b) in enumerate(REGIONS):
    clip = pcm[int(a * sr):int(b * sr)]
    segs, _ = model.transcribe(clip, language='en', initial_prompt=SEED,
                               word_timestamps=True)
    print(f'--- region {i}  {a:.2f} -> {b:.2f}')
    for s in segs:
        for wd in s.words:
            print(f'{a + wd.start:7.2f} {a + wd.end:7.2f}  {wd.word}')
