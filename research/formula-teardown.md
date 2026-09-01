# Nick Saraev Reel Formula — Teardown v2

Corpus: **16 reels**, feed positions 3 to 19, transcribed 2026-08-15.
Transcripts in [nicksaraf-transcripts.md](nicksaraf-transcripts.md) (batch 1)
and [nicksaraf-transcripts-batch2.md](nicksaraf-transcripts-batch2.md) (batch 2).
Account: 630k followers, 388 posts. Niche: AI tooling education.
Format: talking head plus screen-recording B-roll, comment-gated lead magnet.

**v2 changes:** view counts are now attached to every video, three new hook
archetypes appeared, and two claims from v1 are corrected (marked below).

---

## 1. Performance table

| Views | Pos | Video | Hook archetype | Shape |
|---:|---:|---|---|---|
| **2.5m** | 16 | 15 free Google AI tools | News peg | Listicle |
| **1.1m** | 9 | Top 5 Claude Code plugins | Prohibition | Listicle |
| 547k | 15 | Agent Reach (scraping skill) | Capability unlock + forbidden access | Single |
| 441k | 10 | Strix (AI pentesting) | News peg | Single |
| 325k | 7 | 5 vibe-coding plugins | Audience conditional | Listicle |
| 249k | 18 | Free API key GitHub repo | Cost indictment | Single |
| 157k | 13 | 3 free API key sites | Cost indictment | Listicle (3) |
| 138k | 11 | Open-source alternatives site | Cost indictment | Single |
| 131k | 17 | AI prompt library | Analogy | Single |
| 129k | 19 | Codex plugin for Claude Code | News peg | Single |
| 128k | 5 | OmniVoice (voice cloner) | Incumbent kill | Single |
| 122k | 12 | Google AI Boost Bites | News peg | Single |
| 105k | 3 | Agent Skills pack | Capability unlock | Single |
| 94.7k | 6 | Humanizer skill | Pain conditional | Single |
| 51.3k | 14 | herdr (multi-agent terminal) | Capability unlock | Single |
| 30.9k | 4 | Replit Design | Capability unlock | Single |

Caveat before reading anything into this: n=16, no control for topic, recency,
or posting time. Treat these as strong hints, not proven causes.

### What the table says

**Listicles massively outperform.** Four listicles in the set, at 2.5m, 1.1m,
325k and 157k. Median listicle ≈ 712k against median single-tool ≈ 128k, a
gap of roughly 5x. The top two videos are both listicles.

**Capability-unlock hooks are the weakest.** Three of the four worst performers
(105k, 51.3k, 30.9k) open with "this tool lets you do X". The one exception is
Agent Reach at 547k, which adds a forbidden-access angle ("even gated platforms
like LinkedIn", "with zero restrictions") that the others lack.

**News pegs perform well and consistently.** 2.5m, 441k, 129k, 122k. The marker
is the word **"just"**: "Google **just** released", "OpenAI **just** dropped",
"Somebody **just** built", "Google **just** launched".

**Cost indictment is reliable but not explosive.** 249k, 157k, 138k. A tight
band, no flops and no breakouts.

### Two natural experiments in the data

**Google, twice.** Same brand, same news peg, 2.5m vs 122k. The difference is
not the brand. The 2.5m video is a listicle, quantifies money saved ("save you
thousands of dollars every single month"), and withholds part of the payoff.
The 122k video is a single free course with none of those.

**API keys, twice.** Both cost-indictment hooks, 249k vs 157k. The winner is
shorter (27.8s vs 40.0s), has a tighter hook, and points at one resource
instead of three. Weak signal, but it points the same way as everything else:
tighter beats longer.

---

## 2. The hard numbers (N=16)

| Metric | Range | Median | Target |
|---|---|---|---|
| Runtime | 20.8s to 57.3s | 32.6s | 30s single tool, 45 to 55s listicle |
| Pace | 211 to 268 wpm | 228 | **~230 wpm (3.8 words/sec)** |
| Word count | 75 to 218 | 133 | 110 to 140 single, 170 to 220 listicle |
| Hook | 2.2s to 4.5s | ~3.5s | **under 4s, one sentence** |
| CTA block | 3.3s to 5.0s | 3.9s | **~4s** |
| Sentence length | 18 to 21 words avg | ~19 | ~19 words |
| List item | 6s to 9.9s | ~8s | ~8s / ~30 words per item |

> **Correction to v1.** From the first six videos I reported the CTA as a fixed
> block landing within 0.4s every time. Across 16 it runs 3.3s to 5.0s. Roughly
> 4 seconds is still the right target, but it is a habit, not a metronome. Do
> not pad or cut a script to hit it exactly.

> **Correction to v1.** I also reported the pace as ~240 wpm. Across 16 the
> median is 228 and the mean 234. Use **230** when timing a script.

---

## 3. The four-beat structure

Unchanged from v1 and confirmed across all 16: **HOOK → NAME + PROOF → VALUE
BODY → CTA**, with an optional re-hook and payoff line inside the body.

```
0s        ~4s                                          ~T-4s        T
|  HOOK   |  NAME + PROOF  |  VALUE BODY  | PAYOFF |      CTA      |
```

### Beat 1 — Hook (under 4s, one sentence, zero preamble)

No greeting, no name, no "in this video". Seven archetypes now, ordered by how
they performed in this corpus:

| Archetype | Median views | Example |
|---|---:|---|
| **News peg** — `[Big name] just [released/dropped/launched] [thing]` | ~285k | "Google just released 15 AI tools that are completely free and can save you thousands of dollars every single month." |
| **Prohibition** — `Don't [do X] unless you've [done Y]` | 1.1m (n=1) | "Don't use Claude Code unless you've installed these five plugins." |
| **Cost indictment** — `You don't need to pay for X anymore` | 157k | "You don't need to pay for AI API keys anymore." |
| **Audience conditional** — `If you're [doing X], here are [N things]` | 325k (n=1) | "If you're vibe-coding with Claude Code or Codex, then here are five plugins you guys need to have." |
| **Analogy** — `This is basically [famous thing], but for [niche]` | 131k (n=1) | "This website is basically Pinterest, but for AI prompts." |
| **Incumbent kill** — `Forget [paid tool]. Use [free alternative]` | 128k (n=1) | "Forget ElevenLabs. Instead, use this free and open source alternative..." |
| **Pain conditional** — `If you're tired of [pain], there's a free fix` | 94.7k (n=1) | "If you guys are tired of your content sounding like AI, then there's actually a free Claude skill that fixes that." |
| **Capability unlock** — `This tool lets you [outcome]` | ~105k | "This free AI tool lets you run multiple Claude Code and Codex agents side by side." |

Every hook still contains: **who it's for**, **the payoff in outcome language**,
and **a barrier removed** (free, zero experience, one command, 30 seconds).

What no hook does: introduce the creator, reference the video, ask a question,
or tease without paying off. The hook always states the prize.

### Beat 2 — Name and proof

Names the tool, then stacks **borrowed authority**. Never his own credibility,
never "I tested this". Across the corpus: 45,000 stars, 60,000 stars, 80,000
stars, "the former AI engineering director at Google", "Google's own AI
experts", "an official Anthropic plugin", "OpenAI just dropped an official",
"the world's largest inference API", "straight from Wikipedia's own guide".

### Beat 3 — Value body (two shapes)

**Shape A: Listicle.** The high-performing shape. Rigid parallel template:

```
[Ordinal] is [Name].
[What it does mechanically],
so [the friction it removes for you].
```

Ordinals always spoken, last item always "And finally" or "And the fifth",
which signals the end and holds viewers to the CTA. Item count flexes (3, 5,
or 5-shown-of-15) but the scaffolding never does.

**Shape B: Sequential walkthrough.** The usage flow in time order, with cheap
explicit connectives: First / Afterwards / Then / All you do is / With this.
It reads like instructions, which is the point: the viewer should feel they
could do this tonight.

**The sentence template inside both shapes:**

> feature → mechanism → **"so"** → friction removed

The `so` clause is load-bearing and is almost always a **negative outcome
eliminated**, not a positive feature gained:

> "never have to re-explain a single thing" · "never have to code against an
> outdated version again" · "so literally nothing breaks the moment you go
> live" · "without ever having to leave your terminal" · "before you guys even
> see it" · "with zero design experience required" · "with zero restrictions" ·
> "without paying for a single API key" · "without wanting to spend money"

Still the single most copyable mechanic in his writing.

### Beat 3.5 — Re-hook (~60 to 70% through, single-tool videos)

Adds an unexpected second layer right where retention dies. Reusable triggers:
"It doesn't just stop there", "Plus", "And the best part is", "And before it
even...", "or even".

### Beat 3.9 — Payoff line

One sentence zooming out to the end state before the CTA. "This covers the
entire dev cycle so nothing will get skipped and you guys will get a fully
production ready app in one go."

### Beat 4 — CTA (~4s, ~21 words)

```
So if you guys want to try this for yourselves,
just comment [KEYWORD] down below,
and I'll send you the link directly.
```

More variation than v1 suggested. Three lead-in forms appear:

- **Statement:** "So if you guys want to try this for yourselves..."
- **Question:** "Want the link yourselves?" / "So wanna try this for yourselves?"
- **Imperative:** "So go try it yourself."

And "send" and "DM" are interchangeable. Constant across all 16: one
uppercase-shoutable keyword, "down below", and the closing word **"directly"**.
Never asks for a follow, like, or save. One action only.

The same keyword opens the post caption: `Comment "SKILL" to get Agent Skills
and start vibe coding like a senior engineer.` The caption's first two words
are the CTA, repeated.

---

## 4. Three mechanics that only showed up in batch 2

**The withheld remainder.** The 2.5m video promises 15 tools, delivers 5, then:
"There are 10 more that I couldn't fit in here, so if you guys want the full
list, just comment Google down below." The comment gate stops being a bonus and
becomes the only way to finish the video. This is the strongest single
comment-driver in the corpus and it is on the top performer.

> This refines a v1 claim. The **hook** never teases. But the **video** can
> withhold a remainder, as long as what it did deliver was already worth the watch.

**Topic re-runs.** He runs the same topic more than once with a different hook
and a different resource. Free API keys twice (157k, then 249k). Google twice
(122k, then 2.5m). A topic that works is not spent, it gets another angle.

**List items get spun into their own videos.** Strix was item 3 in the 325k
five-plugin listicle. Three weeks later it became its own 441k video, reusing
the same core phrase ("attacks your vibe-coded app like a hacker"). The
listicle doubles as a test harness: whichever item lands becomes a standalone.

---

## 5. Voice and language rules

**Person.** Second person throughout. He says "I" exactly once per video, in
the CTA. No personal story, no opinion, no "I think".

**"You guys."** Signature tic, 1 to 4 times per video, in most of them.
Usually in the hook and the CTA. It is what keeps the fast pace friendly.

**Specific odd numbers, everywhere.** 33 signs, 24 skills, 45,000 / 60,000 /
80,000 stars, 200 providers, 1.6 billion tokens, 500 languages, 100,000 models,
30,000 prompts, 3 seconds, 30 seconds, 10 minutes. Never "lots of" or "tons of".

**Money framing is much heavier than batch 1 suggested.** "save you thousands
of dollars every single month", "you're literally wasting your money", "you
don't need to pay hundreds of dollars", "without paying for a single API key",
"without wanting to spend money", "completely free". Free is a headline in the
first five seconds, never a footnote.

**Intensifier set** (small and reused): literally, actually, exactly, entirely,
completely, basically, zero, way fewer, perfectly.

**Sentence rhythm.** One idea per breath, ~19 words, hard stop. No clause
stacking. Long sentences only for rapid attribute lists ("thumbnails,
infographics, cinematic shots, portraits, full video scenes"), which is a
deliberate speed effect.

**No demo language.** Never "let me show you", "watch this", or "here's what
happened". The screen recording carries the proof, the script never references
the visuals. Worth copying: the entire word budget goes to value.

---

## 6. Fill-in-the-blank templates

**Listicle (target 50s / 190 words) — the high-performing shape:**

```
[HOOK 4s]    [Big name] just released [N] [things] that are completely free
             and can [save/make] you [specific money] every single month.
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

**Single tool (target 30s / 115 words):**

```
[HOOK 4s]    Somebody just built a free AI tool that [does striking thing]
             [before/without the bad thing].
[NAME 4s]    It's called [Name], and it's an open-source [category] that's
             already crossed [N] stars on GitHub.
[CONTRAST 4s] Now, instead of [the old annoying way], [Name] will actually
             [the new way].
[VALUE 8s]   It'll [action], [action], and [action], plus even [bonus].
[PAYOFF 4s]  which lets you [end state] before [risk], and it's completely free.
[CTA 4s]     So if you guys want to try this yourselves, just comment [WORD]
             down below and I'll DM you the link directly.
```

---

## 7. Draft audit checklist

- [ ] Word count divided by 3.8 lands within 5s of target runtime
- [ ] Hook is one sentence, under 19 words, states the payoff, does not tease
- [ ] Hook uses a top-tier archetype: news peg, prohibition, or cost indictment
- [ ] If the hook is capability unlock, it has a forbidden-access or money angle bolted on
- [ ] A specific odd number appears in the first 10 seconds
- [ ] "Free" appears in the first 5 seconds when true
- [ ] Credibility is borrowed from a company, star count, or institution, never from us
- [ ] Every value sentence has a "so [friction removed]" clause
- [ ] Benefits phrased as things that stop happening, not features that exist
- [ ] Listicle: spoken ordinals, last item starts "And finally"
- [ ] Listicle: consider promising more than you deliver and withholding the rest
- [ ] Single tool: re-hook lands around 60 to 70% through
- [ ] Zero "I" statements outside the CTA, zero references to the visuals
- [ ] CTA is ~4s, one keyword, ends in "directly"
- [ ] Post caption opens with `Comment "KEYWORD" to get...`

---

## 8. Relationship to the existing `/reel-formula` skill

`/reel-formula` codifies the Chris Chong system (hook, primer, super hook,
unique mechanism, net new value, re-hooks) and is built for talking-head shorts
where the creator's POV is the product.

The Saraev formula is narrower and faster, tuned for one job: **tool discovery
with a comment-gated lead magnet**. It removes the creator's POV entirely,
borrows all authority from the tool, and caps at 60 seconds.

| Chris Chong beat | Saraev equivalent |
|---|---|
| Hook | Hook, tighter, 4s cap |
| Primer | Name plus borrowed proof |
| Super hook | Usually skipped, the number in beat 2 does this work |
| Unique mechanism | The "so [friction removed]" clause on each feature |
| Net new value | The list items, or the sequential walkthrough |
| Re-hooks | "It doesn't just stop there" / "Plus" / "And the best part is" |
| CTA | ~4s comment-gate block ending in "directly" |

This teardown became the `/tool-reel` skill in this repo, which covers
tool-review and lead-magnet reels. Personal POV and offer content is a
different job and deserves its own separate formula.

**Caveat:** the comment-gate CTA depends on having a DM
automation and a free resource to give away. Without both, the CTA beat has to
be replaced, and it is the one beat in this formula with no obvious substitute.
