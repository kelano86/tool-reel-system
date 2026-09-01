# Tool Reel System

An open pipeline for making short-form AI-tool reels with an AI agent doing
the heavy lifting: one skill writes the script, one skill cuts the edit.
You film one talking-head take in the middle. Everything else is automated
and verifiable.

Built by [FreshStack](https://freshstack.ai) and given away in full. The
format is reverse-engineered from 16 reels by Nick Saraev (630k followers),
transcribed with view counts attached, then codified into instructions an
agent can follow every time. The receipts are in `research/`.

## What's in the box

```
.claude/skills/tool-reel/        writes the script (the formula, codified)
.claude/skills/tool-reel-edit/   cuts the reel in Remotion (the edit format, codified)
research/formula-teardown.md     the writing teardown: what actually drives views
research/edit-teardown.md        the frame-by-frame edit teardown
template/                        a real shipped reel's Remotion project, media removed
examples/script-page-template.md the page format the two skills pass between them
CLAUDE.md / AGENTS.md            onboarding for your coding agent
```

## How the pipeline works

1. **Idea.** You dump a rough idea (a tool, some links) into a page.
2. **Script.** Your agent runs the `tool-reel` skill: hook archetype picked
   by view data, four-beat structure, every borrowed number verified, timing
   math done, self-audited against a checklist. Out comes a teleprompter-clean
   script plus shot notes.
3. **Shoot.** You read the script off your phone. Multiple takes are fine;
   the pipeline picks the best ones later.
4. **Edit.** Your agent runs the `tool-reel-edit` skill: finds the good takes,
   fixes your pace, masters the voice, word-syncs captions, harvests B-roll
   and star counts live from GitHub, and assembles the cut in Remotion.
   You watch it take shape in Remotion Studio and click Render yourself.

## Quick start

The repo is built to be driven by a coding agent (Claude Code, Codex, or
similar). Don't read everything first, just:

1. Clone this repo.
2. Open your coding agent inside it.
3. Say: **"set me up"**.

The agent reads `CLAUDE.md` / `AGENTS.md`, checks what's installed on your
machine, tells you exactly what's missing, and then walks you through your
first script.

If you want to do it manually instead, the prerequisites and steps are in
[CLAUDE.md](CLAUDE.md).

## Honest notes

- The `template/` project is a real shipped video's code with the footage and
  harvested assets stripped. It will not render until you add your own
  footage; that is expected. Its value is the components, the scripts, and
  the worked example `edit.json`.
- The comment-gate CTA in the formula only works if you have a free resource
  to give away and a DM automation to deliver it. Without both, replace that
  beat.
- Never fabricate a number on screen or in a script. Star counts and claims
  are one click from being checked, and this whole format runs on borrowed
  credibility. The skills enforce this; do not fight them on it.
- The raw transcripts of the studied reels are not included. That is Nick
  Saraev's content, not ours. The analysis is.

## Credit

Formula and edit format studied from [Nick Saraev](https://www.instagram.com/nicksaraev)'s
public reels. System built by [FreshStack](https://freshstack.ai).
Use it, ship reels, tag us if it works.
