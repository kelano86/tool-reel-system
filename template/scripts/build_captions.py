"""Generate src/data/captions.json from the footage.

Run: python scripts/build_captions.py

Each beat is decoded as its own short clip, seeded with the line actually
spoken. Two reasons:
  - Whisper drifts over long spans. Per-beat decoding cannot accumulate error
    across a cut, because each beat starts its own clock.
  - The accented names ("Cloudflare", "TencentDB", "authentik", "Auth0") only
    resolve when the decoder is given them up front. Without the prompt they
    come back as "Count Fair", "10 cent DB", "authentic" and "Earth".

Output times are already converted to composition frames, relative to the start
of each beat, with `speed` applied.
"""
import json, os, subprocess, sys, wave, io, re
import numpy as np
from faster_whisper import WhisperModel

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDIT = os.path.join(ROOT, 'src', 'data', 'edit.json')
OUT = os.path.join(ROOT, 'src', 'data', 'captions.json')
MOV = os.path.join(ROOT, 'public', 'footage.mov')
WAV = os.path.join(ROOT, 'scripts', '.footage.wav')

PROMPTS = {
    "hook": "If you want to create a beautiful website with animations, here are two tools that will 10x your results.",
    "jitter1": "The first is Jitter, it's a motion editor that runs in your browser and exports 4K videos and GIFs.",
    "jitter2": "You just drop an animation preset onto a layer, so your toggles, sliders and buttons look like a $10,000 website.",
    "animos1": "And the second one is animos, which is basically a template library for motion designs, built entirely with Claude Code.",
    "animos2": "So you just drop an image, pick from eight categories of presets, and export up to 8K in five aspect ratios, so you're not cutting the same clips for every platform.",
    "payoff": "Both of them run completely in the browser and have great free plans.",
    "cta": "So if you want to try these yourself, just comment ANIMATE down below and I will send you both of the links directly.",
}

MAX_WORDS = 2        # words on screen at once (measured: Saraev runs 1-2)
MAX_CHUNK_SEC = 0.6  # a chunk never lingers longer than this (~0.42s typical)

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())

edit = json.load(open(EDIT, encoding='utf-8'))
fps, speed = edit["fps"], edit["speed"]
# A beat may override the global rate; its caption frames have to use its own.
beat_speed = lambda b: b.get("speed", speed)

if not os.path.exists(WAV):
    subprocess.run(["ffmpeg", "-y", "-i", MOV, "-ac", "1", "-ar", "16000", "-vn", WAV],
                   check=True, capture_output=True)

w = wave.open(WAV, 'rb'); sr = w.getframerate()
pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
w.close()

model = WhisperModel("small.en", device="cpu", compute_type="int8")
result = {}

for b in edit["beats"]:
    key = b["key"]
    if b.get("audio"):
        # Spliced beat: decode the pre-built file, which is already just the
        # chosen takes joined together.
        aw = wave.open(os.path.join(ROOT, 'public', b["audio"]), 'rb')
        ach = aw.getnchannels()
        clip = (np.frombuffer(aw.readframes(aw.getnframes()), dtype=np.int16)
                .reshape(-1, ach).mean(axis=1).astype(np.float32) / 32768.0)
        asr = aw.getframerate(); aw.close()
        if asr != sr:
            clip = np.interp(np.linspace(0, len(clip), int(len(clip) * sr / asr)),
                             np.arange(len(clip)), clip).astype(np.float32)
        span = len(clip) / sr
    else:
        a, z = b["srcFrom"], b["srcTo"]
        span = z - a
        clip = pcm[int(a * sr):int(z * sr)]
    segs, _ = model.transcribe(clip, beam_size=5,
                               word_timestamps=True, initial_prompt=PROMPTS.get(key),
                               condition_on_previous_text=False)
    raw = [{"w": x.word.strip(), "s": x.start, "e": x.end}
           for s in segs for x in s.words if x.word.strip()]

    # Whisper splits large numbers ("87" + ",000"), hyphenated names ("book" +
    # "-to" + "-skill") and file extensions ("DESIGN" + ".md"). Rejoin all
    # three, so the emphasis phrase can match and so a caption never reads
    # "book -to -skill" or "a DESIGN / .md file".
    words = []
    for x in raw:
        prev = words[-1]["w"] if words else ""
        join_number = x["w"].startswith(",") and prev[-1:].isdigit()
        join_hyphen = x["w"].startswith("-") or prev.endswith("-")
        # A dot followed by letters and nothing else is an extension, not the
        # end of a sentence: ".md" joins, "." after "GitHub" does not.
        join_ext = re.match(r"^\.[A-Za-z]{1,4}$", x["w"]) and prev[-1:].isalnum()
        if words and (join_number or join_hyphen or join_ext):
            words[-1]["w"] += x["w"]
            words[-1]["e"] = x["e"]
        else:
            words.append(dict(x))

    # Clamp into the clip so nothing renders past its beat.
    for x in words:
        x["s"] = max(0.0, min(x["s"], span))
        x["e"] = max(x["s"], min(x["e"], span))

    # Locate the emphasis phrase as a contiguous run. Last match wins: in the
    # CTA "repos" appears twice and the keyword is the second one.
    emph = [norm(t) for t in b["emphasis"].split() if norm(t)]
    marked = set()
    if emph:
        n = [norm(x["w"]) for x in words]
        for i in range(len(n) - len(emph) + 1):
            if n[i:i + len(emph)] == emph:
                marked = set(range(i, i + len(emph)))
    # Chunk into runs of <=MAX_WORDS, breaking on sentence punctuation, and
    # never mixing emphasis with non-emphasis inside one chunk.
    chunks, cur = [], []
    def flush():
        if not cur: return
        chunks.append({
            "text": " ".join(words[i]["w"] for i in cur),
            "s": words[cur[0]]["s"],
            "e": words[cur[-1]]["e"],
            "emph": cur[0] in marked,
        })
        cur.clear()

    for i, x in enumerate(words):
        if cur and ((i in marked) != (cur[0] in marked)):
            flush()
        cur.append(i)
        ends_sentence = x["w"].endswith(('.', '!', '?'))
        too_long = words[i]["e"] - words[cur[0]]["s"] >= MAX_CHUNK_SEC
        if len(cur) >= MAX_WORDS or ends_sentence or too_long:
            flush()
    flush()

    # Hold each chunk until the next begins so a caption is always on screen.
    for i, c in enumerate(chunks):
        c["e"] = chunks[i + 1]["s"] if i + 1 < len(chunks) else span

    result[key] = [{
        "text": c["text"],
        "from": int(round((c["s"] / beat_speed(b)) * fps)),
        "to": int(round((c["e"] / beat_speed(b)) * fps)),
        "emph": c["emph"],
    } for c in chunks]

    print(f"{b['label']:7} {len(words):3} words -> {len(chunks):2} chunks"
          f"  (emphasis matched: {'yes' if marked else 'NO'})")

json.dump(result, open(OUT, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(f"\nwrote {OUT}")
