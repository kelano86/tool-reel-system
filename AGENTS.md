# Tool Reel System — Agent Instructions

This file is for coding agents that read `AGENTS.md` (Codex and others).
The canonical instructions live in [CLAUDE.md](CLAUDE.md); follow that file
top to bottom, including the first-session protocol and the standing rules.

One adaptation if your harness does not support Claude Code skills natively:
the two skill files are plain markdown playbooks. When the user wants a
script, read `.claude/skills/tool-reel/SKILL.md` and follow it as
instructions. When the user has footage to edit, read
`.claude/skills/tool-reel-edit/SKILL.md` and follow that. Treat each file
as the complete, authoritative procedure for its stage.
