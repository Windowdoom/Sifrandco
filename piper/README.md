# Piper · صفر

A cohesive personal AI. The Piper model, in one folder, on any system.

Piper is the outer mind from SifarOS, made portable. One Python file, pure standard
library, no installs. It serves the صفر shell and runs the full Piper reasoning loop —
**persona + long-term memory + retrieval over your own library + faith/time awareness** —
streamed from a local model, with a Claude amplifier when you want it and a deterministic
floor so it is never dead.

## Run it

Any machine with Python 3 and a browser:

- **Mac / Linux:** double-click `start.command` (or `python3 piper.py`)
- **Windows:** double-click `start.bat` (or `py piper.py`)
- **Phone (Termux / iSH):** `python piper.py`, open the printed address

It prints a `localhost` address and opens it. Leave the window running; Control-C stops it.

## The three brains (auto-picked each turn)

1. **Ollama** at `127.0.0.1:11434` — the local, private, free home brain. Install Ollama,
   then `ollama pull qwen2.5:3b` (or any model; set it in `piper.conf`). This is the default.
2. **Claude API** — the amplifier for the hardest reasoning. Put your key in `piper.conf`
   as `claude_key`, or set the `PIPER_CLAUDE_KEY` environment variable so it never touches disk.
3. **Offline engine** — math, dates, unit-style facts, and recall from your own memory and
   library. Works with no model and no internet, so Piper always answers something useful.

Nothing leaves the machine unless a turn routes to Claude.

## Give it knowledge

Drop `.txt` or `.md` files into `knowledge/` — textbooks, notes, your own writing, Islamic
sources. On the next launch Piper rebuilds its FTS5 index and grounds answers in them,
citing each source by name. Faith-named files rank higher for religious questions; personal
files rank highest. Only changed files are re-indexed, so launches stay fast. This build
ships with the USMLE high-yield set and the Islamic guides already loaded.

## What it remembers

Tell it `remember that …` and it keeps the fact, encrypted-ready and weighted by importance
with time-decay, recalled by meaning (semantic when an embed model is present, term-match
otherwise). `forget …` removes it. The **memory** panel (top right) shows everything it holds.
It also quietly notes preferences and relationships you mention.

## Voice

- 🎙 speak one command.
- ∞ hands-free conversation: it listens, answers aloud, then listens again.
- 🔊 toggle spoken replies.

Voice input needs Chrome, Edge, or Safari; spoken output works anywhere. Browsers stay
silent until your first click, so click once after it loads.

## Make it yours

- `persona.txt` — who Piper is. Edit freely; it is injected into every prompt.
- `piper.conf` — model names, Claude key, your city and coordinates for prayer times
  (default Kenner, LA), prayer calculation angles, the port. Prayer times are computed
  locally with a standard solar algorithm; verify against your local masjid.

## How it is built

`piper.py` is the whole core: a stdlib HTTP server serving `shell/`, the reasoning loop
(`brain_ask`), memory (SQLite), retrieval (SQLite FTS5), awareness (local prayer-time and
Hijri computation), and the model clients. The shell (`shell/`) is plain HTML/CSS/JS that
talks to the core over server-sent events. The design language — masjid-at-night black,
illuminated-manuscript amber, aged parchment — is from the SifarOS manifesto.

صفر — the point from which everything begins.
