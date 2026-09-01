"""Per-beat pace, in syllables per second as well as words per minute.

Words per minute is the number the format is specified in, but it misreads this
shoot. Item 1 says "UI UX Pro Max" (four words, eight spoken syllables) and
"116,000" (one word, seven), so it scores as slow on wpm while being delivered
at the same rate as everything else. Syllables/sec is what decides whether a
beat actually needs its own speed override.

Run: python scripts/pace.py
"""
import io, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# The chosen takes, as transcribed by scripts/transcribe_regions.py.
BEATS = [
    ('hook', 3.86, 8.83,
     "Don't build another front-end with Claude until you've installed these "
     "five free repos."),
    ('item1', 32.55, 45.88,
     "The first is U I U X Pro Max, which just crossed over one hundred and "
     "sixteen thousand stars. It gives Claude actual design intelligence, "
     "layout, palette, typography, so your agents stop guessing at what looks "
     "good."),
    ('item2', 64.98, 74.95,
     "The second is Taste Skill. At seventy six thousand stars, it's built for "
     "one job, killing A I slop. So your site finally stops looking like every "
     "other Claude build."),
    ('item3', 82.39, 91.36,
     "The third is Awesome Claude Design. Sixty eight design systems ready to "
     "go. Just drop one into your project so you never start from a blank page "
     "again."),
    ('item4', 100.09, 110.23,
     "The fourth is design m d chrome. Open any site you like, hit the "
     "extension and it will pull the whole design system out for you, so you "
     "never have to describe a style from scratch."),
    ('item5', 118.25, 126.88,
     "And finally, Design Motion Principles. Most A I designs just sit there, "
     "so this one will add real motion, timing and easing into everything you "
     "build."),
    ('cta', 136.19, 141.61,
     "So if you guys want all five, just comment DESIGN down below and I'll "
     "send you the links directly."),
]


def syllables(word: str) -> int:
    """Vowel-group count, with the silent terminal 'e' removed. Rough, but it
    only has to rank beats against each other, not be phonetically right."""
    w = re.sub(r"[^a-z]", '', word.lower())
    if not w:
        return 0
    w = re.sub(r'e$', '', w)
    n = len(re.findall(r'[aeiouy]+', w))
    return max(1, n)


SPEEDS = [1.0, 1.20, 1.25, 1.30]
print('beat     src     words  wpm    syl   syl/s  ' +
      '  '.join(f'wpm@{s:.2f}' for s in SPEEDS[1:]))
tw = ts = td = 0
for key, a, b, text in BEATS:
    d = b - a
    words = len(text.split())
    syl = sum(syllables(x) for x in text.split())
    tw += words; ts += syl; td += d
    cols = '  '.join(f'{words / (d / s) * 60:8.0f}' for s in SPEEDS[1:])
    print(f'{key:7} {d:6.2f}  {words:5}  {words/d*60:5.0f}  {syl:4}  '
          f'{syl/d:5.2f}  {cols}')
print(f'\nTOTAL   {td:6.2f}  {tw:5}  {tw/td*60:5.0f}  {ts:4}  {ts/td:5.2f}')
for s in SPEEDS[1:]:
    print(f'  speed {s:.2f} -> {td/s:5.2f}s   {tw/(td/s)*60:.0f} wpm   '
          f'{ts/(td/s):.2f} syl/s')
