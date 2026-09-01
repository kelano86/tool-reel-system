---
name: tool-reel
description: Tool Reel — write short-form AI-tool-discovery scripts (Reels/Shorts, 20-55s) using a formula reverse-engineered from 16 top-performing reels with view data. Top-of-funnel awareness plays with a comment-gate CTA. Use when scripting a reel that reviews, lists, or demos an AI tool, plugin, skill, or free resource.
---

# Tool Reel

Turns "this tool is cool" into a shootable 30-second script.

Source: 16 reels from one top AI-content creator (630k followers),
transcribed with view counts attached. Full evidence in
`research/formula-teardown.md` at the repo root. Read it before your
first script.

**This format is not personal-brand content.** It reviews someone else's tool
and borrows all its credibility from that tool. Keep it separate from any
POV/story content you make: the moment a tool reel starts saying "I", it
stops working.

---

## Rule Zero

> **The creator is invisible. The tool is the star. The viewer is the hero.**

Say "I" exactly once per script, in the CTA. No origin story, no opinion, no
"I tested this", no "let me show you". Every word not spent on viewer outcome
is wasted.

---

## What actually drives views

From the 16-video sample. Small n, no control for topic or timing, so treat
these as strong hints rather than laws.

**Listicles beat single-tool videos by roughly 5x.** Median listicle 712k,
median single-tool 128k. The top two videos are both listicles. If the idea
can be a list, make it a list.

**Hook archetypes, ranked by observed median views:**

| Rank | Archetype | Median | Shape |
|---:|---|---:|---|
| 1 | **News peg** | ~285k | `[Big name] just [released/dropped/launched] [thing]` |
| 2 | **Prohibition** | 1.1m (n=1) | `Don't [do X] unless you've [done Y]` |
| 3 | **Audience conditional** | 325k (n=1) | `If you're [doing X], here are [N things] you need` |
| 4 | **Cost indictment** | 157k | `You don't need to pay for [X] anymore` |
| 5 | **Analogy** | 131k (n=1) | `This is basically [famous thing], but for [niche]` |
| 6 | **Incumbent kill** | 128k (n=1) | `Forget [paid tool]. Use [free alternative]` |
| 7 | **Pain conditional** | 94.7k (n=1) | `If you're tired of [pain], there's a free fix` |
| 8 | **Capability unlock** | ~105k | `This tool lets you [outcome]` |

**Capability unlock is the trap.** It's the most natural way to describe a tool
and it produced three of the four worst performers (105k, 51.3k, 30.9k). The
one exception hit 547k by bolting on forbidden access: *"even gated platforms
like LinkedIn... with zero restrictions"*. If the only honest hook is capability
unlock, add a money angle or a forbidden-access angle or pick a different idea.

**The news peg marker is the word "just".** "Google **just** released", "OpenAI
**just** dropped", "Somebody **just** built". It costs one word and it is the
highest-performing pattern in the set.

But note that the news peg is only 5 of the 37 uses of "just" in the corpus.
See **The "just" engine** under Language rules: its main job is shrinking
effort, not signalling recency.

---

## The four beats

```
0s        ~4s                                          ~T-4s        T
|  HOOK   |  NAME + PROOF  |  VALUE BODY  | PAYOFF |      CTA      |
```

### 1. Hook — under 4s, one sentence, zero preamble

First word is already the hook. No greeting, no name, no "in this video".

Every hook carries three things:
- **Who it's for**, stated or implied by the tool
- **The payoff**, in outcome language
- **A barrier removed**: free, zero experience, one command, 30 seconds

The hook **never teases**. It states the prize in full. (The video can withhold
a remainder later, see beat 5, but the hook always pays.)

### 2. Name and proof — borrowed authority only

Name the tool, then stack one credibility chip that belongs to the tool, never
to us:

> 45,000 stars on GitHub · "the former AI engineering director at Google" ·
> "Google's own AI experts" · "an official Anthropic plugin" · "the world's
> largest inference API" · "straight from Wikipedia's own guide"

In listicles this is distributed, one chip per item.

**Verify every number before it goes in a script.** The entire formula rests on
borrowed credibility, and a star count is one click from being checked. A wrong
number is worse than no number.

### 3. Value body — two shapes

**Shape A: Listicle.** The high-performing shape. Rigid parallel template:

```
[Ordinal] is [Name].
[What it does mechanically],
so [the friction it removes for you].
```

Ordinals always spoken. Last item always opens "And finally" or "And the
fifth", which signals the end and holds people to the CTA. Item count flexes
(3 and 5 both appear) but the scaffolding never does. Budget ~8s / ~30 words
per item.

**Shape B: Sequential walkthrough.** The usage flow in time order, with cheap
explicit connectives: First / Afterwards / Then / All you do is / With this.
It should read like instructions, so the viewer feels they could do it tonight.

**The sentence template inside both shapes:**

> feature → mechanism → **"so"** → friction removed

The `so` clause is load-bearing, and it is almost always a **negative outcome
eliminated**, not a positive feature gained. This is the single most copyable
mechanic in his writing:

> "never have to re-explain a single thing" · "never have to code against an
> outdated version again" · "so literally nothing breaks the moment you go
> live" · "without ever having to leave your terminal" · "before you guys even
> see it" · "with zero design experience required" · "with zero restrictions" ·
> "without paying for a single API key"

Write the benefit as something that **stops happening**.

### 4. Re-hook and payoff

**Re-hook** at 60 to 70% through, single-tool scripts only. Adds an unexpected
second layer right where retention dies. Triggers: "It doesn't just stop
there", "Plus", "And the best part is", "or even".

**Payoff line**, one sentence, zooms out to the end state before the CTA.

### 5. CTA — ~4s, ~21 words

```
So if you guys want to try this for yourselves,
just comment [KEYWORD] down below,
and I'll send you the link directly.
```

Three lead-in forms all appear, use whichever scans best:
- Statement: "So if you guys want to try this for yourselves..."
- Question: "Want the link yourselves?" / "So wanna try this for yourselves?"
- Imperative: "So go try it yourself."

Constant across all 16: one uppercase-shoutable keyword, "down below", and the
closing word **"directly"**. "Send" and "DM" are interchangeable. Never asks
for a follow, like, or save. **One action only.**

The caption opens with the same keyword: `Comment "KEYWORD" to get [thing].`

**The withheld remainder.** On his single best performer (2.5m), the video
promises 15 tools, delivers 5, then: *"There are 10 more that I couldn't fit in
here, so if you guys want the full list, just comment Google down below."* The
gate stops being a bonus and becomes the only way to finish the video. Use this
whenever the list is longer than five, but only if the five delivered were
already worth the watch.

---

## The numbers (N=16)

| Metric | Range | Target |
|---|---|---|
| Runtime | 20.8s to 57.3s | 30s single tool, 45-55s listicle |
| Pace | 211 to 268 wpm | **230 wpm (3.8 words/sec)** |
| Word count | 75 to 218 | 110-140 single, 170-220 listicle |
| Hook | 2.2s to 4.5s | under 4s, one sentence, under 19 words |
| CTA block | 3.3s to 5.0s | ~4s (a habit, not a metronome) |
| Sentence length | 18 to 21 words | ~19 words |
| List item | 6s to 9.9s | ~8s / ~30 words |

**Timing check:** words ÷ 3.8 = seconds. A script that reads comfortably out
loud will run 30 to 40% long. Write it tight, then cut again.

---

## Language rules

**Person.** Second person throughout. One "I", in the CTA. Measured: the
you-family (you, your, yourself, you'll, you're) is **6.8% of every word he
says**, against 0.8% for I/my, a 9:1 ratio. If a draft is not roughly one
"you" every 15 words, it has drifted into describing the tool instead of
addressing the viewer.

**"So" is the default sentence opener.** It starts 18 of 111 sentences, 16%,
the most common opener in the corpus. Then "The" (15, the listicle ordinals)
and "It's" (12, the naming formula). Together those three account for 40% of
all sentence starts, which is what makes the scripts feel relentless rather
than varied. Do not fight this by hunting for elegant variation.

**"You guys."** His signature tic, 1 to 4 times per script, usually in the hook
and CTA. It is what keeps 230 wpm feeling friendly instead of salesy. Use it,
but it is his voice, so consider whether it sounds like you or whether you
need your own equivalent.

**Specific odd numbers, everywhere.** 33 signs, 24 skills, 45,000 stars, 200
providers, 1.6 billion tokens, 500 languages, 30,000 prompts, 3 seconds. Never
"lots of" or "tons of". Put one in the first 10 seconds.

**Money framing.** Heavy throughout. "save you thousands of dollars every
single month", "you're literally wasting your money", "without paying for a
single API key". When the tool is free, "free" appears in the first 5 seconds.

**Intensifier set** (small and reused): literally, actually, exactly, entirely,
completely, basically, zero, way fewer, perfectly.

**Rhythm.** One idea per breath, ~19 words, hard stop. No clause stacking. Long
sentences only for rapid attribute lists ("thumbnails, infographics, cinematic
shots, portraits, full video scenes"), which is a deliberate speed effect.

**No demo language.** Never "let me show you", "watch this", "here's what
happened". The screen recording carries the proof. The script never references
the visuals, which is what frees the whole word budget for value.

**The "just" engine.** His single most characteristic word. 37 uses in 2,242
words, roughly one every 60 words, 2.3 per script. Three jobs, in order of
frequency:

| Job | Count | Shape |
|---|---:|---|
| **Shrink the effort** | 23 | "just run this one command", "just comment X below", "you just describe what you're building", "you just give it a few seconds" |
| **Shrink the quantity** | 9 | "with just 3 seconds of audio", "takes just 30 seconds", "from just a website link" |
| **News peg** | 5 | "Google just released", "OpenAI just dropped" |

Two thirds of the time it is making an action sound trivial. Every step the
viewer would have to take gets a "just" in front of it, so the whole thing
reads as something you could do before you put the phone down. Put one in front
of every action you ask for, including the CTA.

**Effort minimisation more broadly.** "All you do is run one command." "All you
have to do is run these two commands." "You just pick a provider." Note that
**"simply" appears zero times.** It is the corporate synonym and he never
reaches for it.

**Triads.** 27 across 16 scripts, about 1.7 per script. Three-item attribute
lists used as a rhythm device, not for completeness: "clean, smooth, and
natural", "your rhythm, your word choices, your habits", "planning, coding,
testing". Deploy one when a beat needs speed. Two items sounds thin, four
sounds like a spec sheet.

**Never ask a question in the body.** Only 2 questions in the entire corpus and
both are CTA lead-ins ("Want the link yourselves?"). The body is pure
declarative.

**Fixed naming formula.** Single tool: "It's called X" (6 uses) or "The tool's
called X" (1). Listicle: "The [ordinal] is X" (13). It never varies, so do not
get creative here.

**Contract everything.** "it'll" 11 vs "it will" 2. Contractions run 3.2% of
all words. An uncontracted verb reads as a written sentence, not a spoken one.

**Alternate who is acting.** The tool acts ("it'll" 11, "automatically" 4,
"completely on its own"), then the viewer receives the power ("you can" 11,
"lets you" 6). Roughly balanced across the corpus. The rhythm is: the tool does
the work, so you get the capability.

**Jargon register.** He does not dumb down, but the jargon is a specific kind.
Counts across the 16 scripts:

> Used freely: API (18), model (9), terminal (7), open source (5), hook (4),
> stars / token / repo / command / server / library (3 each), MCP / CLI /
> scrape (2 each).
>
> Never once: binaries, runtime, filesystem, SDK, endpoint.

The line is **user-world nouns versus implementer-world nouns**. The viewer has
a terminal, wants an API key, counts stars, installs a plugin. They do not have
a runtime and do not care about a filesystem. When a tool's README is written
in implementer language, translate it before it reaches the script. READMEs are
written for contributors, not viewers.

Three rules follow:

1. **Plain English first, technical label second, mechanism never.** One
   script's hook says "attacks your vibe-coded app like a hacker", and only
   then does the naming beat say "AI pen-testing tool". Jargon arrives after
   comprehension.
2. **Jargon is never load-bearing.** Delete the technical word and the sentence
   must still say what you get. "A built-in MCP server that lets it connect
   directly with Claude Code" works even if MCP means nothing to you.
3. **Never define a term.** Say what it does for the viewer instead. One
   script describes a proxy tool as sitting between you and your model and
   passing through only what matters. The words "proxy" and "context
   compression" never appear.

**No em dashes** (house style rule; keep it or swap in your own). Commas,
full stops, or "so".

---

## Visual and delivery layer

Measured from frame extraction, cut detection, and word-level timestamps on
the 2.5m, 547k and 51.3k videos.

Split into what you decide at the keyboard and what you hand to the edit
stage. The `tool-reel-edit` skill covers the second block in full depth; it
is summarised here so the script output can ship a self-contained handoff.
Where the two disagree on a number, the edit skill wins — its measurements
are frame-accurate.

### Decide while writing

**On-screen text is word-synced captions, not a second angle.** The most
important item here, because it is a negative instruction. Many POV scripting
systems run the text hook and the spoken hook as two *different* angles. This
format does not. Its burned-in captions show one to two words at a time,
matching exactly what is being said at that instant. Do not write a separate
written hook. There is no second angle to invent.

**Mark the emphasis word on every line.** Captions switch typeface mid-sentence
to carry emphasis: serif italic caps on the beat's key word (THAT, EDITOR,
BUILT, AI), sans-serif bold on everything else ("and can", "normal", "of
Canva"), with a colour accent on the single most important term. Which word
gets it is a writing decision, so it is decided at writing time — recorded
in the shot-notes table (one emph word per beat), never inline in the script
block, which stays teleprompter-clean.

**Pick a composition per beat.** Three are in rotation, and the face is often
absent entirely:

1. Full-bleed talking head, warm indoor lighting
2. Full-screen product UI, no face at all
3. Two-zone: product asset on top, talking head bottom, rounded top corners

This affects the writing. A beat with no face on screen can carry a longer
sentence, because nothing is competing for attention.

**Budget three to five shots per beat**, roughly one visual change per
sentence and often more. This is a writing-time decision because it tells you
how much B-roll to gather before you shoot, and a beat you cannot illustrate
is a beat to cut.

### Hand to the editor

**Cut every ~2 seconds.** 19 visual changes in 43.8s, 14 in 30.8s, 13 in
30.6s, consistent across all three sampled videos. The edit skill's
frame-accurate figure is a 2.0s mean shot; aim there.

**Continuous music bed, about 10dB under the voice.** Measured in the speech
gaps: music alone sits around -27dB, voice-over-music around -17dB, whole file
-16.9dB mean peaking -0.5dB (heavily limited for platform loudness). Nothing
anywhere drops below -40dB, so the bed never stops.

Quiet enough to go unnoticed while watching, loud enough that the audio never
falls away. This is what makes a cut every 2.3 seconds with the breaths removed
sound smooth instead of jumpy: the bed papers over every join. Mix it too low
and the edit starts to feel choppy.

> Confidence note: the gaps are only 0.2 to 0.3s, which is a short window for
> an RMS reading, and the figure rests on two clean windows. Treat "10dB under"
> as the target, not a precise measurement.

**Almost no pauses.** One gap of 0.30s or longer across 175 words in the 2.5m
video, longest 0.34s. Zero in the 51.3k video. The gaps that exist land only at
item boundaries, and run about a fifth of a second, not a breath.

> Caveat: this measures finished audio, so it cannot separate fast delivery
> from tight editing. The target for the edit is the same either way.

**Background colour tracks the product.** White or light grey for most, black
for a code editor, warm dark for talking-head moments.

**B-roll is composited product screenshots**, floating with a drop shadow,
often several windows at once. Not plain full-screen recordings.

---

## Templates

**Listicle — target 50s / 190 words. Default to this shape.**

```
[HOOK 4s]    [Big name] just released [N] [things] that are completely free
             and can save you [specific money] every single month.
[ITEM 1 8s]  The first is [Name]. It's their [category] that [mechanism]
             from just [minimal input].
[ITEM 2 8s]  The second's called [Name]. It turns [input] into [output].
[ITEM 3 8s]  The third is [Name]. You can use it to [job], just like
             [familiar tool].
[ITEM 4 8s]  The fourth is [Name], their own [category] that works just like
             [familiar tool].
[ITEM 5 8s]  And finally, [Name], which is basically [X] meets [Y], where you
             [action] until you get exactly what you want.
[WITHHOLD]   There are [N-5] more that I couldn't fit in here,
[CTA 4s]     so if you guys want the full list, just comment [WORD] down below
             and I'll send you the links directly.
```

**Single tool — target 30s / 115 words.**

```
[HOOK 4s]     Somebody just built a free AI tool that [striking thing]
              before [the bad thing happens].
[NAME 4s]     It's called [Name], and it's an open-source [category] that's
              already crossed [N] stars on GitHub.
[CONTRAST 4s] Now, instead of [the old annoying way], [Name] will actually
              [the new way].
[VALUE 8s]    It'll [action], [action], and [action], plus even [bonus].
[PAYOFF 4s]   which lets you [end state] before [risk], and it's completely free.
[CTA 4s]      So if you guys want to try this yourselves, just comment [WORD]
              down below and I'll DM you the link directly.
```

---

## Audit checklist

Run before recording. Any ✗ means rewrite, not reshoot.

- [ ] Word count ÷ 3.8 lands within 5s of target runtime
- [ ] Hook is one sentence, under 19 words, states the payoff, does not tease
- [ ] Hook uses a top-tier archetype: news peg, prohibition, or audience conditional
- [ ] If the hook is capability unlock, it has a money or forbidden-access angle bolted on
- [ ] Idea is a list if it could possibly be a list
- [ ] The collective noun in the hook is literally true of every item on the list
- [ ] Every item belongs in the same video for the same viewer
- [ ] A specific odd number lands in the first 10 seconds
- [ ] "Free" appears in the first 5 seconds when true
- [ ] Every borrowed number and tool name has been verified, not assumed
- [ ] Credibility is borrowed from the tool, never claimed by us
- [ ] Every value sentence has a "so [friction removed]" clause
- [ ] Benefits phrased as things that stop happening
- [ ] Every technical noun is user-world, not implementer-world (no binaries,
      runtime, filesystem, SDK, endpoint)
- [ ] Deleting any jargon word still leaves a sentence that says what you get
- [ ] Roughly one "you" every 15 words; no "I" outside the CTA
- [ ] A "just" in front of every action asked of the viewer
- [ ] Zero questions in the body (CTA lead-in is the only place one belongs)
- [ ] Everything contracted: it'll, you'll, it's, that's
- [ ] Naming beat uses "It's called X" or "The [ordinal] is X", unchanged
- [ ] Listicle: spoken ordinals, last item opens "And finally"
- [ ] Listicle over five items: withheld remainder in the CTA
- [ ] Single tool: re-hook at 60 to 70% through
- [ ] Zero references to the visuals
- [ ] CTA is ~4s, one keyword, ends in "directly", asks for one action
- [ ] Caption opens `Comment "KEYWORD" to get...`
- [ ] No em dashes

---

## Working method

1. **Read the raw idea.** If it contains five tools, it is a listicle and that
   is the better video. If it contains one, check whether it could be widened
   into a list before defaulting to single-tool.
2. **Pick the hook archetype** from the ranked table. Try the news peg first.
   If nothing "just" happened, try prohibition or audience conditional.
3. **Find the borrowed proof** and verify it. Star counts, company names, model
   counts, launch dates. If a number cannot be verified, write
   `[VERIFY: star count for X]` and flag it rather than guessing.
4. **Sanity-check the framing.** Step 3 verifies the atoms. This verifies the
   container, and both can pass while the whole is still false. Two tests:

   **Label test.** Take the collective noun from the brief ("5 trending
   skills", "3 free tools") and apply it to each item on its own. Is item 1
   literally a skill? Item 2? Count the passes. If it is not true of every
   item, replace it with the narrowest noun that is.

   **Coherence test.** Separate question. Does each item belong in the same
   video for the same viewer? An item can survive the label test and still be
   wrong: an enterprise SSO server is unambiguously a repo, but it is not what
   someone watching an AI-agent reel came for.

   **Resolution ladder,** cheapest first: widen the noun until it is true,
   bridge the outlier to the audience with a real angle, or drop it.

   Never inherit the brief's label unchecked. It ends up in the hook, the
   on-screen text, and the caption, and it is the one line the edit cannot save.
5. **Draft the body** in the chosen shape, one line per spoken line.
6. **"So" pass.** Every value sentence gets a friction-removed clause. Rewrite
   any positive-feature phrasing as an eliminated negative.
7. **Timing pass.** Count words, divide by 3.8, cut to target.
8. **Strip pass.** Remove every "I", every reference to the visuals, every em
   dash, every "and then".
9. **Pick the keyword** and write the caption's first line.
10. **Run the audit checklist.**
11. Output in the format below.
12. **Save the script where the edit stage will find it.** If the idea came
    from a Notion page and a Notion API key is configured (`NOTION_API_KEY`
    in `.env`), write the script back into that page. Otherwise save it as a
    markdown file next to the project (e.g. `scripts/<video-name>.md`).
    Either way, still print the script in chat as well.

    For Notion, append to the page body via the API:

    `PATCH https://api.notion.com/v1/blocks/{page_id}/children`

    Block structure (the canonical page format the edit skill expects):

    - `heading_2` "Script"
    - one paragraph: `TARGET: ~Ns | N words | Shape | HOOK ARCHETYPE: X | KEYWORD: WORD`
    - one paragraph: `ON-SCREEN TEXT: ...` (the cover-frame text)
    - one `code` block, language `plain text`: **the spoken script only**,
      as clean flowing paragraphs, one blank line between beats. No beat
      labels, no visual notes, no emphasis asterisks — it is read straight
      off a phone as a teleprompter, so anything that isn't spoken aloud
      does not belong in the block.
    - paragraphs below the script block, in this order, keeping only the
      ones that apply: CAPTION, RUNTIME CHECK (include you-density),
      FRAMING NOTE (any honesty/label reframing worth remembering),
      VERIFY BEFORE SHOOTING (numbers to re-check on record day),
      NOTE (anything else the shoot or DM payload depends on)
    - `heading_2` "Editor handoff": cut rate, captions, music, pauses,
      b-roll pointers as short lines
    - `heading_2` "Shot notes": one `code` block, language `plain text`,
      one row per beat, aligned columns:
      `N BEAT  composition | what's on screen | emph: WORD`
      This table is where visuals and emphasis words live — never inline
      in the script block.

    Append, never overwrite. If a script is already on the page, add the new
    one below under a dated heading rather than replacing what is there.

## Output format

The same layout in chat and on the script page (Notion or markdown). The core
rule: **the script is teleprompter-clean, and everything else lives around it,
not inside it.**

```
## Script
TARGET: ~Ns | N words | [Listicle / Single tool] | HOOK ARCHETYPE: [X] | KEYWORD: [WORD]
ON-SCREEN TEXT: [big text for the cover frame]

[script code block — spoken words only, flowing paragraphs, one blank
 line between beats. No beat labels, no asterisks, no visual notes.]

CAPTION: Comment "KEYWORD" to get [thing].
RUNTIME CHECK: N words / 3.8 = Ns. You-density 1 per N words.
FRAMING NOTE: [only if the brief's label was reframed — say what and why]
VERIFY BEFORE SHOOTING: [numbers with their as-of date; re-check on record day]
NOTE: [anything else the shoot or the DM payload depends on]

## Editor handoff
Cut rate: ~2s per shot, about N visual changes across Ns.
Captions: word-synced, 1-2 words at a time. Serif italic caps on the emph
words in the shot notes, sans bold on everything else, colour accent on [KEYWORD].
Music: continuous bed, never drops out. No moment of true silence.
Pauses: none, except about 0.2s at each beat boundary. Cut the breaths.
B-roll: [where the assets live, and what still needs capturing]

## Shot notes
[code block — one row per beat, aligned columns:]
1 HOOK     talking head     | [what's on screen]                | emph: [WORD]
2 ITEM 1   two-zone         | [what's on screen]                | emph: [WORD]
3 ITEM 2   product, no face | [what's on screen]                | emph: [WORD]
...
N CTA      talking head     | comment box, [KEYWORD] typed      | emph: [KEYWORD]
```

Compositions come from the visual layer section: talking head, product
(no face), or two-zone. Every beat gets exactly one emph word or phrase —
that's the caption typeface switch, decided at writing time.

---

## Making it yours

**Where this format fits.** Tool reels are a top-of-funnel awareness play,
not a traffic driver. The comment-gate CTA is the capture: comments are the
signal, the DM is the delivery.

**What you need for the gate to work:** a real free resource to hand over,
and a DM automation (ManyChat or similar) to hand it over with. If either is
missing, do not ship the reel with a comment CTA, because an unanswered gate
burns more trust than it builds.

**Proof discipline.** Never fabricate a borrowed number. Star counts,
funding, model counts, and "official" claims are all one click from being
checked, and the whole formula runs on that credibility. Verify or flag.

**Voice.** This formula is the studied creator's, not yours. Keep the
structure and the mechanics,
but decide per script whether "you guys" and the breathless intensifier
stack sound like you. The parts that are structural (the four beats, the
"so" clause, borrowed authority, the 4s CTA) transfer cleanly. The parts
that are personality do not have to.

**Where this connects to your offer.** Tool reels build reach, not pipeline.
They do not mention your business, and that is the point. Make the pipeline
argument in your POV content, and let the reach from these feed it.
