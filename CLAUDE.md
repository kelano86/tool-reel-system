# Tool Reel System — Agent Instructions

You are helping a creator make short-form AI-tool reels using this repo's
two skills: `tool-reel` (scriptwriting) and `tool-reel-edit` (editing).
Read this file fully before doing anything else in this repo.

## First session protocol

When the user first opens this repo (or says "set me up", "get started",
or anything similar), do this in order:

1. **Check the environment.** Run the checks below and report results as a
   single clear list: what's installed, what's missing, and the exact install
   command for each missing item. Do not proceed to a build until the user
   has what the task needs.

   | Requirement | Needed for | Check |
   |---|---|---|
   | Node.js 18+ and npm | the Remotion edit project | `node --version` |
   | ffmpeg on PATH | audio extraction, voice mastering, pace work | `ffmpeg -version` |
   | Python 3.10+ | caption, take-selection, and verification scripts | `python --version` |
   | Python packages: `numpy`, `faster-whisper`, `Pillow` | captions, audio scans, safe-zone checks | `pip show faster-whisper` |
   | (optional) `rembg` Python package | only for the pop-out face shot | `pip show rembg` |
   | (optional) Notion API key | only if scripts live in Notion | `.env` has `NOTION_API_KEY` |

   Notes: `faster-whisper` downloads a model on first use (hundreds of MB,
   one time). Windows users can get ffmpeg via `winget install ffmpeg`;
   macOS via `brew install ffmpeg`.

2. **Explain the pipeline in five lines.** Idea → script (tool-reel skill) →
   they film it → edit (tool-reel-edit skill) → they click Render. Make clear
   which parts are theirs (filming, judgement calls, the final Render click)
   and which are yours.

3. **Point them at their first step.** They need nothing but a rough idea:
   a tool or a list of tools worth covering. When they have one, run the
   `tool-reel` skill on it.

## Standing rules for this repo

- **Read `research/edit-teardown.md` before your first edit session** and
  `research/formula-teardown.md` before your first script. The skills
  reference both.
- **Scripts live on a page the edit stage can read.** If the user works in
  Notion and `NOTION_API_KEY` is set in `.env`, write scripts back to their
  Notion page via the API. Otherwise keep a markdown file per video (see
  `examples/script-page-template.md` for the format). Never leave a script
  only in chat.
- **Never hardcode API keys** into any file. `.env` only, and `.env` is
  gitignored.
- **Starting an edit:** copy `template/` to `<video-name>-edit/`, then follow
  the "Starting a new video" section of the `tool-reel-edit` skill. The
  template is a real video's project with media removed, so it will not
  render until footage and assets exist. That is expected, not broken.
  From the second video on, copy the user's own latest edit project instead.
- **The user clicks Render.** Open Remotion Studio (`npm run dev`) as the
  first act of every edit session, give them the URL, and never produce the
  full render yourself. Verify with stills and measurements instead.
- **Never fabricate a number.** Star counts, view counts, model counts,
  "official" claims: verify via the fetch scripts or flag as `[VERIFY]`.
  This applies to scripts, on-screen text, and anything else.
- **Verify before reporting done.** Wpm in band, captions synced, every text
  element inside the Instagram safe zone (measured on rendered frames, not
  eyeballed), no clipped words. The checklists at the end of each skill are
  the definition of done.
