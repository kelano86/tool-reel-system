# Script page template

This is the page format the `tool-reel` skill outputs and the
`tool-reel-edit` skill reads. It works identically as a Notion page or a
local markdown file (one file per video). The core rule: **the script block
is teleprompter-clean**; everything that is not spoken aloud lives around
it, never inside it.

---

## Script

TARGET: ~50s | 190 words | Listicle | HOOK ARCHETYPE: News peg | KEYWORD: TOOLS

ON-SCREEN TEXT: 5 free AI tools

```
Google just released 5 AI tools that are completely free and can save you
hundreds of dollars every single month.

The first is [Name]. It's their [category] that [mechanism] from just
[minimal input].

The second's called [Name]. It turns [input] into [output], so you never
have to [old friction] again.

The third is [Name]. You can use it to [job], just like [familiar tool].

The fourth is [Name], their own [category] that works just like
[familiar tool].

And finally, [Name], which is basically [X] meets [Y], where you [action]
until you get exactly what you want.

There are 3 more that I couldn't fit in here, so if you guys want the full
list, just comment TOOLS down below and I'll send you the links directly.
```

CAPTION: Comment "TOOLS" to get the full list.

RUNTIME CHECK: 190 words / 3.8 = 50s. You-density 1 per 13 words.

VERIFY BEFORE SHOOTING: star counts for item 1 and item 3 (as of the
scripting date; refetch on record day).

NOTE: the DM payload is the link list; make sure the automation has it
before this ships.

## Editor handoff

Cut rate: ~2.3s per shot, about 21 visual changes across 50s.
Captions: word-synced, 1-3 words at a time. Serif italic caps on the emph
words in the shot notes, sans bold on everything else, colour accent on TOOLS.
Music: continuous bed, never drops out. No moment of true silence.
Pauses: none, except about 0.2s at each beat boundary. Cut the breaths.
B-roll: repo links below; harvest with scripts/fetch_assets.py.

- item 1: https://github.com/owner/repo1
- item 2: https://github.com/owner/repo2
- item 3: https://github.com/owner/repo3
- item 4: https://github.com/owner/repo4
- item 5: https://github.com/owner/repo5

## Shot notes

```
1 HOOK    talking head     | logo row of the 5 tools           | emph: FREE
2 ITEM 1  two-zone         | repo1 README screenshot            | emph: [WORD]
3 ITEM 2  product, no face | repo2 product UI                   | emph: [WORD]
4 ITEM 3  two-zone         | repo3 screenshot sweep             | emph: [WORD]
5 ITEM 4  product, no face | repo4 UI                           | emph: [WORD]
6 ITEM 5  two-zone         | repo5 artwork                      | emph: [WORD]
7 CTA     talking head     | comment box, TOOLS typed           | emph: TOOLS
```

## Video title

5 free AI tools
