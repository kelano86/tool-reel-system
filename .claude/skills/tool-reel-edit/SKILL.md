---
name: tool-reel-edit
description: Tool Reel Edit — cut a shot talking-head reel into a finished vertical video in Remotion, using an edit format reverse-engineered frame by frame from top-performing reels. Covers take selection, pace correction, word-synced captions, the title-card template, shot taxonomy, asset harvesting from GitHub, and the technical traps. Use when footage exists for a tool reel and it needs editing. For writing the script before the shoot, use tool-reel.
---

# Tool Reel Edit

Turns a raw talking-head recording into a finished 1080x1920 reel.

Companion to `tool-reel`, which writes the script. This one starts where that
ends: footage exists, and it needs cutting.

Evidence base: 16 reference reels transcribed for the writing teardown, plus
a frame-by-frame teardown of the 2.5m-view Google video for the edit. Both live in
`research/` at the repo root as `formula-teardown.md` and
`edit-teardown.md`. Read the edit one before starting.

---

## Rule Zero

> **Many short varied shots, not a few long ones.**

His mean shot is **2.0 seconds** with a range of 0.26s to 3.43s. A beat of
spoken script is not one shot, it is three to five. Every time the edit feels
flat, the answer is almost always another cut with a different composition.

---

## Who does what

> **Open the Studio first, and never run the full render. The creator clicks
> Render.**

**Start the Studio as the first thing after the project is set up** — before
harvesting assets, before writing a single shot list — and give the creator
the URL. They watch the edit take shape there, and every note they have comes
from looking at it. A session where the Studio appears at the end is one where
they see the work for the first time when it is finished, which is the wrong
moment to find out the layout is off.

```
npm --prefix <name>-edit run dev
```

Leave it running for the whole session. It hot-reloads, so it keeps up.

**The full render is theirs.** They click Render in the Studio when they are
happy. Never produce the finished file on your own initiative, and never as a
way of showing them something.

**What you may render:** short diagnostic ranges (`--frames=A-B`), a few
seconds at most, and only when a still genuinely cannot answer the question — a
camera move, a transition, an audio artifact. Say what it is for when you send
it. Everything else is verified with `remotion still` and measured.

**If the Studio has stopped**, restart it before doing anything else. The
creator will usually notice before you do.

---

## The pipeline

Seven stages. Each produces a file the next one reads, so any stage can be
re-run alone. These are stages, not section numbers.

```
footage.mov
  1  beat detection      -> which takes to keep        -> edit.json
  2  pace correction     -> speed only, no pitch knob  -> edit.json
  2b voice mastering     -> denoised, EQ'd narration    -> public/voice.wav
  3  caption timing      -> word-synced chunks         -> captions.json
  4  asset harvest       -> logos + screenshots        -> assets.json, stars.json
  5  shot lists          -> the actual cut             -> edit.json
  6  components          -> anything not a screenshot
  7  render              -> out/*.mp4
```

---

## 1. Beat detection

The recording is mostly dead air and fluffed takes. A 46-second script came
from 167 seconds of source with 23 speech regions across 7 beats, several beats
shot four times.

**Do not use ffmpeg `silencedetect`.** It latches onto a single mouth click and
treats it as speech onset, which put half a second of room tone at the start of
a beat. Use a **sustained-RMS scan** instead: speech starts at the first point
where level holds above -35dB for ~0.19s, which a transient cannot trigger.
Pre-roll 0.05s, tail 0.18s past the last sustained frame so consonants decay.

Then transcribe each region separately and read them to pick takes. Prefer **one
complete continuous take** over splicing fragments — several of his beats trail
off mid-sentence and restart, and the complete one is always cleaner.

> `silencedetect` and `volumedetect` print at ffmpeg's **info** level. Running
> them with `-v error` returns nothing and looks like "no silence found". This
> wastes ten minutes every single time.

## 2. Pace correction

Measure the delivered pace. Ours came in at **178 wpm** against the
reference median of **228**. That is not a stylistic gap, it makes the video feel slack.

Fix it with `speed` alone. 1.25 took 59.2s down to 47.4s at 232 wpm, which read
as rushed on playback; **1.15 landed at 51.9s and 213 wpm**, which is at the
bottom of the band and is the one that sounded right. Pick by ear at the top of
the band, not by hitting the median.

> **Do not add a pitch knob.** `playbackRate` already preserves pitch on its
> own — see the `toneFrequency` trap, which is the most expensive mistake of
> this build. If a pitch knob exists in the project, delete it rather than
> defaulting it off, or someone will turn it back on.

Always report the resulting wpm, not just the runtime.

## 2b. Voice mastering (always, this preset)

The camera track is never used raw. Master it once into `public/voice.wav` and
point the beat audio at that file; the video stays on `footage.mp4`, muted.
Preset locked after A/B rounds on real footage — use it as-is for every reel
unless the creator asks for a change on a specific video:

```
ffmpeg -y -i public\footage.mp4 -vn -af "highpass=f=75,afftdn=nr=12:nf=-32:tn=1,deesser,equalizer=f=260:t=q:w=1.2:g=-3,lowshelf=f=110:g=4,equalizer=f=4200:t=q:w=0.8:g=3,aexciter=amount=1.5:drive=8:freq=5500,highshelf=f=10000:g=-2,acompressor=threshold=-20dB:ratio=3:attack=6:release=150:makeup=3,alimiter=limit=-1.2dB:level=false" -ar 48000 public\voice.wav
```

What it is, in order: rumble high-pass, FFT denoiser with noise tracking,
de-esser, -3dB mud cut at 260Hz, +4dB low shelf at 110Hz (body/depth), +3dB
presence at 4.2kHz, harmonic exciter (the actual "crisp"), **-2dB cut above
10kHz** (a darker top; brighten to taste), 3:1 compression, -1.2dB limiter.

Hard-won ordering rule: **denoise before any EQ boost or compression.** The v1
chain boosted the air shelf and compressed first, which pumped the room hiss up
with the voice — it was immediately audible and read as "not crisp". The
exciter adds highs by synthesizing harmonics from the mids, so it sharpens the
voice without lifting the noise floor the way a shelf boost does.

Wiring: every filter in the chain is time-invariant, so `voice.wav` shares
`footage.mp4`'s timeline sample-for-sample — the per-beat `srcFrom` trims need
no adjustment. In the beat audio component, change the fallback source from the
camera file to the master (`staticFile(beat.audio ?? 'voice.wav')`); spliced
beats keep their own pre-spliced files (re-splice those from voice.wav if the
beat was cut from the camera track). Verify the wav's duration matches the
source audio before wiring it. Save the exact command as
`scripts/master_voice.ps1` in the project so it re-runs after any footage swap.

The chain raises integrated loudness by roughly +3.5 LUFS; if a music bed is
mixed relative to the voice, scale its volume up by the same ratio (~x1.4) to
keep the approved balance.

## 3. Caption timing

Word-synced, **1 to 2 words at a time, changing every ~0.42s**. Measured off his
frames. Three words held for a second reads visibly slower than his.

**Decode each beat as its own clip.** Whisper drifts about a second across a 7s
span when given the whole file, which is useless for sync. Per-beat decoding
cannot accumulate error across a cut because each beat starts its own clock.

**Seed each clip with the line actually spoken.** Without a prompt, whisper
returns "Count Fair Computer", "10 cent DB", "authentic" and "Earth" for
Cloudflare, TencentDB, authentik and Auth0.

**Rejoin split tokens.** Whisper splits large numbers ("87" + ",000") and
hyphenated names ("book" + "-to" + "-skill"). Without joining, a caption reads
"book -to -skill".

**Hold each chunk until the next begins**, so a caption is always on screen
rather than flickering off in the gaps.

## 4. Asset harvest

Three tiers, in order of preference. `scripts/fetch_assets.py` does all of it.

1. **README screenshots.** The best B-roll available: real product UI, already
   chosen by the maintainer. Some repos ship a dozen at full resolution.
   Filter out badges by host (shields.io, trendshift, codecov...), by minimum
   width (480px), and by extreme aspect ratio.
2. **Project artwork / OG card.** `opengraph.githubassets.com/1/<owner>/<repo>`
   always exists and is consistent. Some repos ship real character art in
   their docs folders, which makes a far better title card than an avatar.
3. **Nothing.** Some repos have zero images in their README. Those have to be
   carried entirely by custom animation.

**Having screenshots does not mean using only screenshots.** Mix them with
animation. A screenshot shows what the thing looks like; an animation shows what
it *does*. A sequence built only from stills is static, one built only from
animation feels like a cartoon rather than a product.

**Harvest facts, not just images.** `scripts/fetch_assets.py` also pulls
structured claims out of the README, and these are often better B-roll than a
second view of the same product shot:

| Fact | Pattern | Example found |
|---|---|---|
| `commands` | `` `/word` `` | a CLI repo's list of 8 slash commands |
| `steps` | numbered list items | a 3-step "how it works" sequence |
| `features` | bold labels on bullets | a feature list with bold lead-ins |

**When a line names a count, show the things.** "It's eight commands that cover
your whole dev cycle" is a claim about a specific list, and the list exists in
the README. Animating the eight commands arriving beats repeating the product
screenshot, because it *is* the evidence for the sentence.

Two rules on this:

- **Never hand-type the facts.** Read them from `assets.json` at render time.
  Typed lists go stale silently when a repo changes, and this format runs on
  claims a viewer can check.
- **Sanity-check the extraction.** The command regex also matched
  `/spec-driven-development`, a doc reference rather than a command, so the
  extractor drops entries far longer than the median. Confirm the count against
  what the line actually says before building the shot.

Also fetch live star counts and cache them (`stars.json`). They move — one repo
went from 21,648 to 21,933 inside a single day — and a stale number on screen is
the kind of thing that gets corrected in the comments.

## 5. Shot lists

A beat carries a `shots` array. Each shot names where it ends, what fills it,
its ground colour, and whether the face is on screen.

```json
{"to": 109, "kind": "title", "ground": "#F9F9F9", "face": false,
 "name": "Example Tool", "art": "example-art.png", "rank": "#2", "starsLabel": "21.9k"}
```

**Cut on caption boundaries.** Pull the chunk timings and land each cut between
phrases, never mid-word.

**Shot kinds built so far:**

| Kind | What it is |
|---|---|
| `title` | the locked segment-start card |
| `card` | a screenshot, held still |
| `sweep` | a camera move over a screenshot — see 9 |
| `terminal` | a command typing itself |
| `structure` | light text on a dark ground, for a file or a shape |
| `facefull` | the face filling the frame |
| named animations | one bespoke component per line that needs one (a file transforming, a machine booting, a command list arriving) — built for that video, deleted after |

**Ground colour is set by shot type, not chosen per shot.** Two of the three
cases are fixed; see 14. A single flat ground across the whole video is the
clearest tell that it is not his format, but the variation is systematic rather
than decorative.

**The face is absent in roughly half his shots.** If the face is in every frame,
there are not enough shots.

## 6. Finding the image: the five-point method

The hardest part of a repo with no screenshots is deciding what to draw. This is
the method, and it matters most exactly where it is easiest to skip.

**1. Extract the claim, not the noun.**
The line names things; the claim is what it asserts. "It gives your agent an
actual Linux computer" contains the noun *computer*, which pulls you toward a
terminal. The claim is *your agent is no longer just a chat box, it has a
machine*. Draw the claim.

**2. Ask what would make someone believe it.**
Not what the product looks like. What is the evidence image? For persistence,
the evidence is work surviving something that should have destroyed it.

**3. Show the mechanism, not the interface.**
The strongest shot in one of our builds showed file cards holding perfectly
still while the sandbox died around them, because in that product the storage
genuinely outlives the execution environment. That is not decoration, it is
the architecture drawn accurately. When the animation and the engineering are
the same picture, it lands.

**4. Distrust the first image that arrives.**
Terminal for a CLI. Dashboard for analytics. Chat bubble for AI. Folder for
storage. If an image appears instantly it is almost certainly the generic one,
and it will look identical to the previous segment. Two segments in a row
opening on a typing terminal is the failure this rule exists to catch.

**5. Contrast beats description.**
Something vanishing while something else stays is legible in two seconds; a
labelled diagram is not. Before/after, ephemeral/durable, empty/populated. Reach
for a change of state before reaching for an explanation.

**Applied, as worked examples:**

| Line | First (generic) image | What was built |
|---|---|---|
| "turns any book into a skill" | a PDF icon | file flies into Claude, structured skill unfolds |
| "an actual Linux computer" | a terminal | a machine boots with the agent's mark **on its screen**, capabilities dock underneath |
| "never loses your work when a session ends" | a save icon | the sandbox dies, the files do not move, a durable slab is revealed beneath them |

**Where screenshots exist, mix rather than replace.** A screenshot shows what
the thing looks like; an animation shows what it does. All stills is static, all
animation looks like a cartoon rather than a product. When a repo ships several
real screenshots, the question is what to build *around* them.

## 7. How every video opens (fixed)

The hook is two shots, in this order. Do not invert it and do not skip either.

**Shot 1 — split screen, from 0 to ~2.2s**

```
title slot     900 x 200 at (90, 240)   the video title
imagery slot   900 x 430 at (90, 460)   what the video is about
H/2   (960)                             caption, on the centre line
0.555H (1066) down                      you, in the rounded box
```

Both slots are fixed boxes in frame pixels, specified in 8. Do not re-derive
them from fractions of anything.

The viewer gets the claim, the subject and the presenter in one frame. Nothing
is withheld and nothing has to be waited for.

**Shot 2 — full frame, from ~2.2s to the first title card**

Cut to the face filling the frame and stay there until the first item begins.
After the setup has been delivered, the rest of the hook is a person talking,
and giving it the whole frame is what makes the first title card land as a
change of gear.

**Land the cut on a caption boundary, not on 2.2s exactly.** On this build the
nearest phrase start was frame 127 (2.12s), two frames early, which is right.
A cut inside a word is worse than a cut two frames off the mark.

**The visual has to be sized for the split screen, not borrowed from a
full-frame layout.** The imagery slot is 900x430, and B-roll designed to fill
the whole zone will clip or collapse in it. A stack of
2:1 product cards does not survive it: five of them squeezed into that band
leaves only the bottom one readable. A **row of square logos** does survive it,
says "five things" at a glance, and pre-introduces the marks that reappear on
each title card. Choose B-roll that fits the band rather than shrinking B-roll
that does not.

## 8. The intro layout (locked)

**The opening frame must state what the video is.** Without it the first shot is
product artwork with no claim attached, and the viewer has to wait for the
spoken hook to find out whether this is for them.

Two fixed slots, in **frame pixels**:

```
title slot     900 x 200  at (90, 240)
imagery slot   900 x 430  at (90, 460)

caption        y 960, the usual centre line
face box       y 1066 down
```

Content is centred in its slot. Both slots are horizontally centred on the frame
(90 + 450 = 540), so anything centred in the frame is centred in its slot.

> **Absolute boxes, never fractions.** Every earlier version of this frame
> positioned its two elements with separate percentages. Two consequences, both
> of which shipped: percentages resolve against the *containing block*, which on
> this shot is the 883px B-roll zone rather than the frame, so `top: 33.3%` put
> the title at **y=294 while every comment and rule in the build said 640**; and
> two independent fractions drift apart whenever either moves, which is how a
> **381px hole** opened between the title and the artwork. Neither looked broken.
> Both survived three rounds of layout review. Fixed boxes cannot do either.

### The title

**Black serif italic** (`var(--ink)`). Coral is the *product name* colour on
title cards; sharing it made the opening frame read as one more item card rather
than as the video's own statement.

**More than three words breaks to two lines.** Not "wrap if it does not fit" —
always. One long line has to shrink to fit the width, and that is the wrong
trade: the title is the only claim on the opening frame and it should be the
biggest thing on it. Two lines halve the width each line has to fit, so the type
roughly doubles. "5 trending GitHub repos" went from 68 to **94** on the break.

**Break at whichever word boundary makes the two lines closest in length.**
Splitting down the middle by word count gives "5 trending GitHub / repos", which
is both lopsided and a bad phrase break.

**Size is the largest the slot allows**, from two limits, whichever binds first:

```
lines   = words > 3 ? 2 : 1
advance = title is ALL CAPS ? 0.698 : 0.559
size    = min(116, boxH / (lines * 1.06), (SAFE_CENTRED_W - 24) / (longestLine * advance))
```

Note it is the longest **line** that drives the width, not the length of the
whole title. This replaced a ladder of length buckets tuned by eye, which were
not safe at the top of their range: at 84 a 20-character title measures 939px
and at 70 a 28-character one measures 1096, against a centred budget of 880. The
title in the build came out at 900 and sat 8px inside the action rail.

**Two advances, because caps are far wider than mixed case in this italic.**
A single figure cannot cover both, and the mixed-case one is the dangerous
direction: "GIVE YOUR AGENT A COMPUTER" sized on 0.559 put its first line at
**x 56-1035**, 55px under the action rail, and the frame looked completely
normal. Measured on rendered frames: "5 trending GitHub repos" runs 0.559,
"GIVE YOUR AGENT" set at 94 measured 980px across 15 characters, which is 0.695.
The caps figure agrees with the serif caption advance, which is the same face
doing the same job.

**And subtract a slant allowance from the budget.** An italic block does not sit
centred inside its own advance width — the lean pushes it right — so a line
measured at exactly `SAFE_CENTRED_W` still lands a few pixels past the rail. At
the full 880 the corrected title measured 875 wide and *still* ran to x=982. The
title card already budgets 24 for this; the video title has to as well.

Re-measure every one of these if the face ever changes.

### The imagery

Fitted to the imagery slot and centred in it. The slot is deliberately larger
than any one visual needs, because it also has to hold a screenshot or a card on
videos whose opening is not five square marks.

**A short visual will not fill it, and that is fine** — a row of logos is capped
by the slot's width long before its height. But cap the row against
`SAFE_CENTRED_W` too: the slot is 900 wide and runs to x=990, which is 10px into
the action rail. Five 158px marks with 22px gaps come to 878 and land at
x 101..979.

Set the title once in `edit.json`:

```json
{ "title": "5 trending GitHub repos" }
```

## 9. Moving on a screenshot (the sweep)

**A dense screenshot held static is texture, not evidence.** The typical case
is a screenshot that is a wall of 30-odd app tiles. At the size a card allows,
every logo is about 40px: you can tell it is a grid of something, but not of
what. If the line claims the product connects to the tools you already use,
that claim only lands if the individual logos are recognisable.

So establish wide, zoom into one row, then track along it. Same information, but
each logo gets a moment at a readable size.

**Reach for this whenever the shot's evidence is smaller than ~60px on screen.**
Below that a viewer reads the shape of the thing and not the thing.

```
0.00 - 0.30   zoom from the whole row to ~2 items
0.25 - 1.00   track left to right, easing in and out at both ends
```

- **Overlap the two phases.** Run strictly in sequence, the move stops dead for
  a frame at the handoff and reads as two shots spliced together. Starting the
  pan at 0.82 of the zoom's end makes it one gesture.
- **Specify the framing in SOURCE pixels of the image**, not percentages: two
  edges bracketing the row, a centre line, and how much of the row is visible at
  the closest point. Read them off the file once and they survive any change to
  the layout around them.
- **Include a heading or some page furniture in the close crop.** It reads as
  being inside a real product rather than looking at a cropped picture.
- **Ease in and out**, so it decelerates onto the last item rather than stopping
  dead.

**One move per screenshot.** If a segment has two screenshots, sweep one and
hold the other: a sweep then a static reveal gives the two shots different jobs,
where two sweeps in a row is just restlessness.

## 10. Instagram safe zone (hard constraint)

Instagram's published spec for Reels at 1080x1920:

```
top      220px    app chrome
bottom   450px    caption, username, action rail
left      35px
right    100px    like / comment / share buttons

usable:  x 35-980,  y 220-1470     (945 x 1250)
feed preview crops to 1080x1440
```

Exported as `SAFE` and checked as part of the verification pass.

**No text outside it, ever.** Video and B-roll may bleed past — the face box
deliberately runs to the frame bottom, because a person's chest sitting behind
the caption UI is fine. Anything that has to be *read* stays inside.

**It is not centred.** The right rail takes 100px against 35 on the left, so a
centred element sized to the full safe width still runs into the buttons. A row
centred on x=540 must be **880px wide or less**, not 945. Exported as
`SAFE_CENTRED_W`, and it is what an animation should be handed as its `boxW`,
not the frame width.

**Two lines, not one.** Captions are 1-2 words but a long chunk wraps, so budget
the two-line height (~208px at full size). That puts the lowest safe caption
centre at **y=1366**; the build uses `LOW_CAPTION = 0.71` (y=1363).

**The serif caption needs the same slant allowance as the title**, and a wider
advance than the obvious measurement gives. Measured on a later build,
"production just" set at 82 came out **883px wide** — 0.718 per character, when
0.718's predecessor 0.698 was what sized it to 82 in the first place — and the
lean put it at x 101-983. Both corrections are needed:

```
advance = serif ? 0.718 : 0.482
budget  = SAFE_CENTRED_W - (serif ? 30 : 12)
size    = min(serif ? ladder + 6 : ladder, budget / (chars * advance))
```

The sans side measures 0.43 against the 0.482 assumed, so it is already
conservative and needs nothing. Only the italic bites.

A useful side effect: sizing the serif properly stops the longest chunks
wrapping at all. On one build the longest chunk was breaking onto two lines
purely because the width cap was too generous to shrink it.

**Audit found four violations on a build that looked fine:**

| Element | Was | Problem |
|---|---|---|
| Title-card caption | 0.757H | bottom at 1557, inside the UI band |
| Faceless / full-bleed caption | 0.8H | bottom at 1640, well inside it |
| Logo row | 5x164 + gaps | right edge 994, into the action rail |
| A stepper animation | `boxW = W` | scales to exactly 1080, six labels edge to edge |

All four were invisible in Studio, which draws the full frame with no chrome.
**Run the numbers; do not eyeball it.** Concretely:

```
remotion still --frame=N  ->  PNG
take the median of the frame as the ground level
mask every pixel more than ~18 off it
group the masked rows into bands, one per element
print each band's x and y extents against SAFE
```

That reads the *rendered* geometry rather than the source, which is the point:
every violation above came from a number that looked right in the code. It also
catches the second-order ones — it is how the stepper violation above turned
up, and how the title's 8px overhang did.

Two things to know when reading the output. **Grain defeats a naive threshold**:
on a grained ground, use a threshold well above the grain's spread (~70) or
every band will span the full width. And **drop shadows count as pixels**, so a
card will measure a few px wider than its box. Shadows may sit in the rail;
text may not.

The stepper is the instructive one: it had been outside the zone the whole time
and nobody saw it, because its labels were dark text that had gone invisible on
a dark ground. Fixing the contrast is what surfaced the geometry bug. **When a
component becomes legible for the first time, re-measure it.**

> The rank line on title cards (0.1885H, block 308-416) is inside the safe zone
> and stays. The video title sits in its own slot (see 8), not on this line.

**One number here is not verified: the feed-preview crop.** The figure used
throughout is ~285px off the top of a 1920 canvas for the 4:5 preview, and the
intro title slot starts at y=240, so the top line of a two-line title sits
inside it. In the full-screen player, which is where a reel is actually watched,
it is well clear. Worth confirming against a real post before treating the 285
as gospel in either direction.

Every time a text element moves, the B-roll near it has to be re-fitted, not
just nudged.

## 11. The title card (locked format)

Every list item opens with one. Roughly 1.5s, no face, **white ground**.
Composition is fixed and must not be re-derived per video:

```
 group bottom at y=665, growing upward:
     rank        "#2"            96px  sans bold, ink
     name        "Example Tool"  ladder below, coral serif italic
     stars       "* 21.9k stars" 54px  sans bold, ink
 H/2   (960)     logo, 440px rounded square, dead centre
 0.71H  (1363)   caption  (LOW_CAPTION)
```

Name size ladder, because a 9-character name and a 21-character one share the
slot: `<=10 chars: 140` / `<=14: 112` / `<=18: 92` / `else 78`. Names up to 18
characters are held on one line with `nowrap`.

**The group is anchored by its bottom edge, not its top.** Long names wrap to a
second line, and a top-anchored group would push the star count down into the
logo.

Elements stagger in — rank, name, logo, stars — each with an
**overshoot-and-settle** (land at 1.14x, settle to 1.0 over ~16 frames). He
never fades things up; they arrive.

## 12. Typography

| Treatment | When |
|---|---|
| **Sans bold** | connective narration **while the face is on screen** |
| **Serif italic caps** | **graphics-only shots**, and the accented phrase wherever it falls |
| **Mono** | terminals, star counts, small labels |

Serif italic does two jobs at once. The proof is his CTA, where the keyword is
serif italic over a full-bleed face.

Text colour follows the ground: ink on light, near-white on dark, **coral for
the accented phrase**.

## 13. Palette

```
light title    #F9F9F9     every segment start
light body     #F4F5F1     the usual faceless ground
split dark     #050706     every split screen, plus grain
ink            #16201C
muted          #6E7A73
coral accent   #E7896D     <- sampled off his frames, not amber
card           #FFFFFF
```

Near-black, never `#000`. Pure black reads as a hole punched in the feed and
gives the encoder a flat field to band across. `#050706` still sits in the `ink`
family, just far enough off zero to be a surface.

## 14. Ground by shot type (required)

**The ground says what kind of shot you are looking at.** It is keyed to the
shot, not to the section, and not alternated. Two of the three are fixed:

| Shot | Ground |
|---|---|
| **Segment start** (title card: name, rank, stars, logo) | **Always `#F9F9F9`.** No exceptions. |
| **Split screen** (camera bottom, visual top) | **Always `#050706` + grain.** |
| Anything else (full-frame visuals, faceless shots) | Free. Whatever suits the visual. |

The title card being constant is the whole point of it. It is the frame that
says "new item", and it can only do that job if it looks identical every time.
Vary it and it stops reading as punctuation.

**Intro and outro are exempt from the split-screen rule.** The opening frame is
a split screen and stays light, as does the closing CTA. The opening is the
frame a viewer judges in the feed, and it is already carrying the video title,
the visual and the face at once. Bracketing the video in light also makes the
dark middle read as the body of the thing rather than as a mood.

So a finished video runs: light open, then per-shot for each item, then light
close.

### Grain, on the split screens only

Not decoration. Instagram's encoder bands smooth dark fields badly, and grain
gives it something to hold. A faceless shot that happens to be dark does **not**
get grain: the grain is part of what marks a shot as the split screen.

- **Static, never per-frame.** Animated noise breaks Remotion's determinism and
  is the worst possible input to an inter-frame codec. It survives the local
  render and dissolves the moment Instagram re-encodes, taking the rest of the
  picture with it. Held still it costs one keyframe and nothing after.
- **Coarse, not fine.** Grain size matters more than strength. 1px noise is the
  first thing a codec discards. `baseFrequency 0.55` on a 240px tile.
- **Gamma the noise down hard** before blending, currently exponent 6.0 at 0.55
  opacity.
  `fractalNoise` centres on mid-grey, and screen-blending mid-grey over
  near-black lifts the entire ground instead of speckling it. Ungamma'd it
  measured **44 against a token value of 16**, which reads as charcoal, not
  black. Pushed down it lands at ~21 with the grain *more* visible, because the
  contrast between speck and ground went up as the mean came down.
- Desaturate it. `fractalNoise` is colour noise, and on near-black that shows
  up as stray red and green pixels.

> **Judge the ground off a rendered frame, never off the hex.** Screen blend can
> only lighten, so the rendered ground always measures brighter than its token.
> Measure the mean of a ground region; the hex will lie to you.

### Ground-dependent colour goes in CSS variables, not props

Everything read *against* the ground flips with it. Publish the flipping colours
as variables on the shot wrapper and have components read `var(--ink)`,
`var(--muted)`, `var(--line)`, `var(--track)`, `var(--rim)`.

Variables rather than an `onDark` prop threaded through every animation, card
and label: a component that reads them works on either ground without knowing
which it is on, and anything added later inherits that for free. Derive the flip
from the ground's **luminance**, not from a list of known-dark hexes — that list
was already in the build, already only two entries long, and already silently
wrong for any new colour.

Anything with its own opaque surface (a white card, a terminal panel) keeps its
own palette. The ground never shows through it.

**Two things break the moment a shot goes dark. Check both:**

1. **Low-opacity ink.** Text set in `ink` at 40-60% opacity is the standard way
   to render a second-rank label and it vanishes completely on near-black.
2. **Dark surfaces on a dark ground.** Drop shadows do the separating on light
   and nothing on dark, so a near-black panel dissolves. Give it `--rim`, a
   1.5px light outline, rather than lightening it.

## 15. Geometry

```
canvas      1080 x 1920, 60fps
face box    left 22, top 0.555H, 1036 x 854, radius 46
broll zone  full width, 0 -> 0.46H  (883px tall)
captions    H/2 with face, LOW_CAPTION (0.71H) without and on title cards
```

The face box is a **downscale** (1920x1080 fills 1036x854 at 0.79x) so it stays
sharp. Full-bleed needs a **1.78x upscale** and is visibly softer — use it as a
deliberate accent, not a default. If footage is ever shot vertically or in 4K,
this constraint disappears.

### The top-zone formula (every split screen, no exceptions)

**Centred in the zone on both axes, capped at `SAFE_CENTRED_W`.**

```
wrapper   position absolute, inset 0, flex, align center, justify center
content   width <= 880, box-sizing border-box
```

That is the whole rule, and it is worth stating because it makes the safe zone
automatic. The zone is 883 tall, so a 280px card centred in it starts at y=302
and a 700px one starts at y=92 — anything that fits the zone at all clears the
220px top band once it is centred. Get the centring right and you stop having to
reason about the crop for each new shot.

**A bare element with no wrapper does not centre, it pins.** The CTA card was
written as a plain `width: 86%` div dropped into the zone, so it sat hard
against x=0 with its top edge at y=0, which is inside the strip Instagram
covers. It looked like a styling choice rather than a missing wrapper, which is
why it survived several passes.

**Cap the width in pixels, not as a percentage.** `86%` computes to 929, whose
right edge lands at 1005 and sits under the action rail. Percentages silently
break the safe zone every time the canvas or the padding changes; `SAFE_CENTRED_W`
cannot.

The same formula covers the CTA, the title card, every animation and every
screenshot. If a shot needs to sit somewhere else, that is a deliberate
exception and should say so in a comment.

### The pop-out face shot (optional variant)

Reverse-engineered off another creator's reel. The camera card is a wide letterbox
strip whose top edge cuts through the speaker's head, and the head sits **in
front of** that edge with nothing behind it. It is not a crop. It is two copies
of the same footage at the same transform:

1. the camera original, clipped to a rounded card
2. a background-removed copy on top, clipped to everything **above** the card

Layer 2 is the whole effect: it is why the head reads against the page ground
rather than against the room.

```
card       left 69, top 1406, 942 wide, bleeds past the canvas bottom, r=46
outline    none. House decision - see the dark-set caveat below.
pop        0.30 of head height above the edge
```

**No outline, and know what that costs on a dark set.** Measured A/B on this
footage: the room is near-black and so is the split-screen ground, so with no
outline the card has no visible boundary and the pop stops reading - it looks
like an ordinary face shot with a vignette, because the head has nothing to be
in front of. The reference gets away with an outline because its room is lit
(shelves, neon), and its card edge would read even without one.

So on a dark set, the card has to be separated some other way: a lighter ground
behind it, or a graded lift on the card itself. Not a drop shadow - see section
14, shadows do nothing on a dark ground. `PopoutFaceShot` keeps `borderWidth`
as an escape hatch defaulting to 0.

If an outline ever does go back on, it is `--rim` or a warm accent, never
red: reserve red for negative / "don't" signals only, so a red card edge does
not say the wrong thing on every shot it appears in.

**Clip layer 2 to `y < cardTop`.** Not decoration. The cut-out is a full frame,
so without the clip its shoulders hang outside the card's left and right edges
and the illusion dies in one frame.

**Pop depth and zoom are locked together, and the trade lands on head size.**
The deeper the edge cuts into the head, the less source is left below that line
to fill the card, so the more the footage has to be scaled up. Measured against
a 942-wide card on 1920x1080 footage:

| pop | card height | scale | head, as % of card width |
|-|-|-|-|
| 0.14 | 514 | 0.61x | 22.0 |
| 0.30 | 514 | 0.70x | 25.1 |
| 0.50 | 514 | 0.85x | 30.5 |
| 0.50 | 400 | 0.66x | 23.8 |

The reference sits at 20.7%. So **a deep pop wants a short card** - shorten the
box rather than accepting the zoom, or the head swells and the shot stops
reading as a card at all.

**Four numbers drive all of it, and they belong to the footage.** Crown, eye,
chin and centre in source pixels, measured off one frame. Everything else is
derived. Re-measure on each shoot, the same way `FACE_SHIFT_X` is.

**The cut-out has to be pre-baked.** Remotion cannot segment at render time.
`scripts/bake_cutout.py` runs `rembg` (`u2net_human_seg`) over the source and
writes a **VP9 WebM in `yuva420p`** - the one web video format Chrome will
composite transparently.

- `-auto-alt-ref 0` is required. Without it libvpx silently drops the alpha.
- Bake at source resolution and source fps. The two layers only stay in
  register if they share a timebase.
- Bake only the beats that pop out, not the whole take. It runs at ~0.2s a
  frame on CPU, so 60s of 1080p is about 12 minutes. `PopoutFaceShot` takes
  `cutoutFrom` for exactly this.
- **`ffprobe` will tell you the alpha is gone. It is lying.** ffmpeg's native
  vp9 decoder ignores the alpha layer, so the file reads as `yuv420p` and
  decodes fully opaque. Check `TAG:alpha_mode=1` on the stream, or decode with
  an explicit `-c:v libvpx-vp9`. Chrome reads it correctly either way.

**Two matting engines. rembg is the house default** - judged the better-looking
edge on this footage, and the faster of the two. `--engine rvm` opts into the
other one.

| | rembg + 3-tap | RVM (mobilenetv3) |
|-|-|-|
| per 1080p frame, CPU | 0.19s | 0.42s |
| flicker, edge band | 10.9/255 | 13.7/255 |
| soft-edge area | 27.7k px | 23.6k px |

RVM is a recurrent video model, so the expectation is that it kills temporal
crawl. **Measured on this footage it does not** - it scores slightly worse on
frame-to-frame alpha change than rembg does. That is not a fault: rembg's
number is low because the 3-tap blend is literally a temporal low-pass, and
RVM's is higher because its soft edge is made of individual hair strands that
genuinely move. Note the smaller soft-edge area alongside it - the edge is
tighter, not mushier.

What RVM does buy is **edge detail**: it resolves individual strands where
rembg gives a smooth hard cut, and its `fgr` output is spill-suppressed. On a
side-by-side it lost anyway - the strand detail read as fringe against the
ground rather than as hair, and the smooth cut looked cleaner at reel scale.
Keep it for footage with looser hair, or a lighter background where a hard
edge would show.

Two things to take from this. Reach for the 3-tap before the heavier model - it
is free and it measurably works. And do not assume a bigger model fixes a
problem without measuring it on the actual footage: the whole reason RVM went
in was a stability claim the numbers did not support.

Reference implementation: `PopoutFaceShot.tsx` and `scripts/bake_cutout.py`,
both included in this template.

---

## Technical traps

Each of these cost real time. They will recur.

**Never set `toneFrequency` alongside `playbackRate`.** The most expensive
mistake of the build, and it survived several rounds of "verified clean".

Browsers set `preservesPitch = true` on media elements by default, so
`playbackRate: 1.25` already time-stretches **without** raising the pitch.
Setting `toneFrequency = 1 / speed` to compensate does not undo a pitch rise
that never happened: it applies a real 20% downshift to audio that was already
correct. Measured on this project, source median F0 111.1 Hz against a render at
90.4 Hz, a ratio of 0.814 for the 0.800 being applied.

It also puts a phase vocoder in the signal path for no reason, which is a likely
source of artifacts at transients.

Set the pace with `speed` alone. Do not add a pitch knob; if one exists, delete
it rather than defaulting it off, or someone will turn it back on.

**Level checks do not prove audio is correct.** Related, and the reason the
above went unnoticed for so long. RMS envelope scans, sample-level
discontinuity checks and cross-correlation lag tests all measure *timing and
amplitude*. A pitch shift changes neither, so all three reported clean while
every render was a fifth of an octave flat.

When audio is questioned, measure **frequency** as well:

```
estimate median F0 by autocorrelation over voiced windows
compare render against source
same words spoken -> the ratio must be 1.000
```

Anything other than 1.000 is a pitch shift, and the cents figure says how much.
"No dropout" and "correct audio" are different claims; answer the one being
asked.

**Never unmount the `<Video>`.** One face element per beat, at a fixed position
in the tree, with only its wrapper geometry and opacity changing between shots.
An early `return` for a different layout, or swapping between two components,
remounts it and restarts playback. In a **render** this is inaudible because
Remotion seeks each frame independently. In **Studio** it plays live and you
hear the audio hitch at every cut. Verify by transcribing across the cut: a
remount replays from the beat start rather than continuing.

**`npx --prefix <dir>` does not set the working directory.** Remotion starts in
the parent and reports "No Remotion entrypoint was found". Use
`npm --prefix <dir> run dev` with the entrypoint named in the dev script.

**ffmpeg `-v error` suppresses `silencedetect` and `volumedetect`**, which both
print at info level.

**Landscape source into a vertical canvas** is the constraint that shapes the
whole layout. Work it out before designing, not after.

**Percentages resolve against the containing block, not the frame.** Inside a
shot the containing block is the 883px B-roll zone, so `top: 33.3%` means y=294
and not y=640. Nothing throws, nothing looks obviously broken, and the element
just sits somewhere nobody intended. **Any position that means a line on the
frame must be passed in as frame pixels.** This one shipped and survived three
rounds of layout review.

**A bare element dropped into a zone pins to its top left, it does not centre.**
The wrapper is what centres it. Missing, it looks like a styling choice rather
than an omission.

**This project has no Prettier config.** Running `npx prettier --write` on a
file reformats it to Prettier's defaults, which flips the whole file to double
quotes against the house style. If you must run it, pass
`--single-quote --print-width 100`. Better: do not run it at all.

**Scale animations to the frame they land in.** A three-element diagram laid out
side by side reads fine on a wide canvas and becomes unreadably small at 9:16.
Stage animations so at most two elements are on screen at once, each large.

---

## Starting a new video

### What you are given

Two things, and nothing else should be assumed:

1. **The script page** holding the script and every link the video refers to.
   Either a Notion page (read it via the API with `NOTION_API_KEY` from
   `.env`) or a local markdown file the scripting skill saved.
2. **A footage file**, the raw camera original.

Pull four things out of that page before touching the footage:

- **The spoken script, beat by beat.** It is the ground truth for take
  selection, caption seeding and shot lists. Every shot has to prove the
  sentence under it, so the sentences come first.
- **Every link.** Each one is a repo to harvest from, and the harvest decides
  screenshots versus custom animation, which is the biggest fork in the build.
- **The keyword** for the comment gate, which the CTA card renders.
- **The video title**, which goes in the intro title slot. If the page does not
  name one, ask rather than inventing it: it is the largest text in the video.

If the page has a link whose repo you cannot reach, say so before designing that
segment. A private or renamed repo yields no screenshots and no star count, and
the sequence has to be built differently — not discovered halfway through.

### Bootstrapping the project

**Copy the last project, do not scaffold a fresh one.** Most of what a reel
needs is already built and already correct: the safe zone, the caption engine,
the title card, the grain, the ground variables, the three generator scripts.
Rebuilding any of it means rediscovering the traps in this document one at a
time.

```
cp -r template <name>-edit
```

On the first video, copy `template/` from this repo. From the second video
on, copy your own most recent edit project instead, because it will have
accumulated fixes and components the template does not have.

Then work through what is generic and what belonged to that video.

**Keep as is.** Nothing in here is video-specific:

```
src/edit.ts                 timing model
src/components/ground.tsx   grounds, grain, the CSS variables
src/components/Captions.tsx word-synced captions
src/components/FaceShot.tsx the face box and its cover maths
src/components/shots.tsx    SAFE, SAFE_CENTRED_W, the intro slots,
                            VideoTitle, TitleCard, TerminalCard, ArtCard
src/components/anim/LogoSweep.tsx   generic: takes an image and coordinates
scripts/*.py                captions, assets, splicing
```

**Empty and regenerate:**

```
public/footage.mov          the new recording
public/shots/               harvested per repo, delete the old ones
src/data/edit.json          keep the shape, replace the beats
src/data/captions.json      regenerated by build_captions.py
src/data/assets.json        regenerated by fetch_assets.py
src/data/stars.json         refetch, they move daily
```

**Delete outright.** `src/components/anim/` except `LogoSweep` — every other
component in there was built to prove one specific sentence and means nothing
in a different video. Reading them for technique is useful; keeping them is
not, and a half-relevant animation is worse than a blank frame because it will
get used.

**Four things carry the old video's name and will silently keep it:**

```
src/ToolReel.tsx            rename the file and the component
src/Root.tsx                the Composition `id`
package.json                the `render` and `still` scripts name that id
package.json                `--port 3300`, which the old project is still using
```

Then add a `.claude/launch.json` entry with the new name and port, so both
projects can run at once.

**Also per-video, and easy to miss because they look generic:** `HookStack` in
`Broll.tsx` has the five product filenames hardcoded, and `CtaCard` has the
keyword passed in from the composition. Check both against the new script.

Finally, **delete the shot lists but keep one beat as a worked example** until
the new ones are written. An empty `shots` array falls back to the old
single-stage layout, which still exists for the CTA, and it is not obvious from
the render that a beat quietly took that path.

## Project layout

```
<name>-edit/
  public/footage.mov          the camera original
  public/shots/               harvested assets, per-repo subfolders
  scripts/build_captions.py   regenerates captions.json
  scripts/fetch_assets.py     harvests screenshots, logos, star counts
  scripts/splice.py           builds a beat's audio from more than one take
  src/data/edit.json          beats, shots, the two knobs
  src/data/captions.json      generated
  src/data/assets.json        generated
  src/data/stars.json         generated
  src/components/             shots.tsx, Captions.tsx, FaceShot.tsx, anim/
  src/ToolReel.tsx            the composition
```

**The two knobs** live at the top of `edit.json` and everything recomputes from
them: `speed` (pace) and `beatGap` (hold between beats, 0 is a butt cut). Plus
`splitRatio` for beats still using the simple stage.

---

## Working method

0. **Copy the previous project** and strip it back — see "Starting a new
   video". Never scaffold from scratch.
1. **Read the edit teardown** in `research/edit-teardown.md`.
2. **Probe the footage.** Resolution, fps, duration. Confirm landscape-into-
   vertical before designing anything.
3. **Sustained-RMS scan** for speech regions. Transcribe each, read them, pick
   the complete takes.
4. **Measure wpm.** Set `speed` to land in the 210-270 band, then confirm by
   ear. Do **not** add pitch correction; `playbackRate` preserves pitch already.
5. **Build captions** per beat with seeded prompts.
6. **Harvest assets.** Check what each repo actually has before designing shots
   for it, since that decides screenshots versus animation.
7. **Write shot lists.** Aim for a mean of ~2s. For each shot ask what the line
   is actually saying and what image proves it.
8. **Build any custom animation** the line needs.
9. **Verify with single frames** (`remotion still --frame=N`), not full renders.
   A still takes seconds, a render takes minutes. Measure them, do not just look
   at them.
10. **For anything that moves, render the segment** (`--frames=A-B`). A camera
    move, a transition or an audio question cannot be judged from stills, and a
    5-second range renders in under a minute.
11. **Hand it over, do not render it.** Say what changed, what you measured
    and what is still open, and let the creator click Render. When they share
    the output back, run the verification checklist against that file.

---

## Verification checklist

Run before calling it done. Verify, do not assume.

Everything above the divider is checked on **stills and measurements**, with
the Studio open, before handing over. The render checks below it run on the
file the creator produces, once they share it back.

- [ ] Studio running, and it has been running since the start of the session
- [ ] Resulting wpm inside 210-270
- [ ] Mean shot length near 2.0s
- [ ] Ground colour changes across the video, not one flat fill
- [ ] **Every** segment start on `#F9F9F9`, no exceptions
- [ ] **Every** split screen on `#050706` with grain, except intro and outro
- [ ] Intro and outro both light
- [ ] Grain measured off a rendered frame, ground mean ~21, and identical
      between frames
- [ ] Caption colour derived from ground luminance, not a list of known hexes
- [ ] On each dark shot: no low-opacity ink text, no dark surface without a rim
- [ ] Every top-zone visual centred in its zone on both axes, width capped in
      pixels at `SAFE_CENTRED_W` — measure one frame per shot kind, including
      the CTA, which is the one most likely to have been left on an older layout
- [ ] Face absent from roughly half the shots
- [ ] Opens split screen, then cuts to full frame at ~2.2s on a phrase boundary
- [ ] Video title present, **measured** on a rendered frame inside the title
      slot (900x200 at 90,240), not assumed from the source
- [ ] Title on two lines whenever it runs to more than three words
- [ ] Opening imagery inside its slot (900x430 at 90,460) and within
      `SAFE_CENTRED_W`
- [ ] **Every text element inside the Instagram safe zone**: x 35-980,
      y 220-1470, measured with the two-line caption height
- [ ] Every title card on the locked grid
- [ ] Every beat's last word ends before its cut, with 0.15s+ of margin
- [ ] Star counts refetched the same day
- [ ] Captions 1-2 words, median ~0.45s on screen
- [ ] Serif italic on graphics-only shots, sans bold with the face
- [ ] No `<Video>` remount at any cut — check Studio playback, not just render

**On the creator's rendered file, once they share it back:**

- [ ] Correct duration, 1080x1920, audio stream present
- [ ] Transcribe it — every beat intact, no clipped words
- [ ] **Median F0 matches the source, ratio 1.000**

---

## Field notes

**Assets are the real constraint, not the edit.** Closing the shot-count gap
needs logos, screenshots and animations, not more cutting. Harvest before
designing, because what a repo ships decides what its sequence can be.

**Say what the line says.** Every shot should prove the sentence under it.
One build's line was "point it at any book and it turns the whole thing into
a skill", so the sequence was a command being typed, a file going in, and a
structured skill coming out. Decorative B-roll that does not track the words is
the difference between a good edit and a stock one.

**Never invent a number on screen.** Star counts, model counts, funding. Same
rule as `tool-reel`: verify or leave it out. A number rendered in 168px type is
the most checkable claim in the video.
