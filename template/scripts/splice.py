"""Build spliced audio for beats that need more than one take.

Run: python scripts/splice.py

Some lines only exist cleanly across two takes. item3 is the case that forced
this: the complete take (12) carries an OBS recording glitch on the word
"loses", and the glitch could not be located precisely enough to patch, so the
whole phrase containing it is taken from a later take instead.

The join is placed on a phrase boundary and crossfaded over a few milliseconds,
which is inaudible on a butt-cut between two takes of the same sentence in the
same session.

Output: public/<key>.wav, at original speed. `speed` is still applied at
playback, so caption timings and beat length are computed the same way as for
un-spliced beats.
"""
import json, os, subprocess, sys, io, wave
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOV = os.path.join(ROOT, 'public', 'footage.mov')
EDIT = os.path.join(ROOT, 'src', 'data', 'edit.json')
FULL = os.path.join(ROOT, 'scripts', '.footage48.wav')

XFADE = 0.012          # 12ms, long enough to hide the seam, short enough to not smear

if not os.path.exists(FULL):
    subprocess.run(['ffmpeg', '-y', '-i', MOV, '-ac', '2', '-ar', '48000', '-vn', FULL],
                   check=True, capture_output=True)

w = wave.open(FULL, 'rb')
sr, ch = w.getframerate(), w.getnchannels()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch)
w.close()

edit = json.load(open(EDIT, encoding='utf-8'))

for beat in edit['beats']:
    clips = beat.get('clips')
    if not clips:
        continue
    key = beat['key']
    parts = []
    for c in clips:
        a, b = int(c['srcFrom'] * sr), int(c['srcTo'] * sr)
        parts.append(pcm[a:b].astype(np.float32))

    n = int(XFADE * sr)
    out = parts[0]
    for nxt in parts[1:]:
        # Equal-power crossfade so the join does not dip in level.
        t = np.linspace(0, 1, n, dtype=np.float32)[:, None]
        fade_out = np.cos(t * np.pi / 2)
        fade_in = np.sin(t * np.pi / 2)
        head, tail = out[:-n], out[-n:]
        joined = tail * fade_out + nxt[:n] * fade_in
        out = np.concatenate([head, joined, nxt[n:]])

    dest = os.path.join(ROOT, 'public', f'{key}.wav')
    ww = wave.open(dest, 'wb')
    ww.setnchannels(ch)
    ww.setsampwidth(2)
    ww.setframerate(sr)
    ww.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
    ww.close()

    total = sum(c['srcTo'] - c['srcFrom'] for c in clips)
    print(f"{key}: {len(clips)} clips -> {dest}")
    for c in clips:
        print(f"    {c['srcFrom']:7.2f} -> {c['srcTo']:7.2f}  ({c['srcTo']-c['srcFrom']:.2f}s)")
    print(f"    total {total:.2f}s source, {total/edit['speed']:.2f}s at speed "
          f"{edit['speed']} = {round(total/edit['speed']*edit['fps'])} frames")
