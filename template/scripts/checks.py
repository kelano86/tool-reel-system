"""Static checks over the edit: shot stats, ground variety, tail margins.

Run: python scripts/checks.py

The tail margin is the one worth having automated. A beat whose last word runs
into its own cut clips a consonant, and it is inaudible in Studio because the
next beat starts immediately - you only hear it as the delivery sounding
clipped, which is easy to blame on the take.
"""
import io, json, os, subprocess, sys, wave
import numpy as np

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDIT = json.load(open(os.path.join(ROOT, 'src', 'data', 'edit.json'), encoding='utf-8'))
WAV = os.path.join(ROOT, 'scripts', '.footage.wav')
fps, speed = EDIT['fps'], EDIT['speed']

if not os.path.exists(WAV):
    subprocess.run(['ffmpeg', '-y', '-i', os.path.join(ROOT, 'public', 'footage.mov'),
                    '-ac', '1', '-ar', '16000', '-vn', WAV], check=True, capture_output=True)
w = wave.open(WAV, 'rb')
sr = w.getframerate()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
w.close()

HOP, WIN = 0.005, int(0.03 * sr)
hop = int(HOP * sr)

shots, faces, grounds, kinds = [], 0, {}, {}
print('beat     frames   shots  mean shot   tail margin')
total = 0
for i, b in enumerate(EDIT['beats']):
    n = round((b['srcTo'] - b['srcFrom']) / speed * fps)
    total += n
    prev = 0
    for s in b['shots']:
        shots.append(s['to'] - prev)
        prev = s['to']
        faces += 1 if s['face'] else 0
        grounds[s['ground']] = grounds.get(s['ground'], 0) + 1
        kinds[s['kind']] = kinds.get(s['kind'], 0) + 1
    assert prev == n, f"{b['key']}: last shot ends {prev}, beat is {n}"

    # Last sustained speech in the beat's source window, against its out point.
    seg = pcm[int(b['srcFrom'] * sr):int(b['srcTo'] * sr)]
    m = (len(seg) - WIN) // hop
    db = 20 * np.log10(np.array(
        [np.sqrt(np.mean(seg[i * hop:i * hop + WIN] ** 2) + 1e-12) for i in range(m)]))
    loud = np.nonzero(db > -35.0)[0]
    tail = (m - loud.max()) * HOP if len(loud) else 0.0
    """
    A beat whose source runs straight into the next beat's cannot clip.

    Splitting one long take at an internal sentence boundary gives two beats
    with srcTo == the next srcFrom, and the audio plays on across the cut - a
    word overhanging the out point is simply heard as the head of the next
    beat. Flagging those wastes a pass hunting for a clip that cannot exist,
    which is what this build did to `value`.
    """
    nxt = EDIT['beats'][i + 1] if i + 1 < len(EDIT['beats']) else None
    joined = nxt is not None and abs(nxt['srcFrom'] - b['srcTo']) < 1e-6
    flag = ('   (butt cut, audio continues)' if joined
            else '' if tail >= 0.15 else '   <-- UNDER 0.15s')
    print(f"{b['key']:7} {n:6}  {len(b['shots']):5}   {n / len(b['shots']) / fps:6.2f}s"
          f"     {tail:5.2f}s{flag}")

print(f"\ntotal            {total} frames   {total / fps:.2f}s")
print(f"shots            {len(shots)}   mean {np.mean(shots) / fps:.2f}s   "
      f"range {min(shots) / fps:.2f}s - {max(shots) / fps:.2f}s")
print(f"face on screen   {faces}/{len(shots)}  ({faces / len(shots) * 100:.0f}%)")
print(f"grounds          {grounds}")
print(f"shot kinds       {kinds}")

# Every segment start must be on the one light title ground, no exceptions.
bad = [b['key'] for b in EDIT['beats']
       if b['key'].startswith('item') and b['shots'][0]['ground'] != '#F9F9F9']
print(f"title cards off #F9F9F9: {bad or 'none'}")
