# 13 · Recreate from zero (صفر)

This is the document that makes Piper outlive any machine. If it is years from now and you
have only this folder — or even only your `knowledge/` and `data/` and your memory of the
idea — here is how to bring the whole thing back. صفر: begin at zero, rebuild with intention.

## Case A — you have this whole folder
1. Install Python 3 (`01-INSTALL.md`).
2. `python3 piper.py`. Done. Your `knowledge/` and `data/` are already here.
3. Optional: install Ollama, `ollama pull qwen2.5:3b`, and run `service/install.sh`.

## Case B — you have only your data (knowledge/ and data/)
Your irreplaceable things are just files:
- `knowledge/` — your library.
- `data/memory.db` — what Piper remembers about you.
- `data/tasks.json` — your tasks.
- `persona.txt`, `piper.conf` — who it is and how it's set.
Drop them into a fresh copy of the piper folder (Case A) and relaunch. Everything returns.
The search index (`data/knowledge.fts`) rebuilds itself; you do not need to keep it.

## Case C — you have nothing but the idea
Piper is small and rebuildable by hand. The architecture, in one breath: a single Python
program that (1) serves a web page, (2) on each message assembles a prompt from a persona +
recalled memory + retrieved library passages + the time/prayer context, (3) streams the
answer from a local model via Ollama (or Claude, or an offline fallback), (4) remembers what
mattered, and (5) can call "capabilities" — small plugin files — to act in the world.

To rebuild from scratch:
1. **Server + shell.** A stdlib `http.server` that serves an HTML/CSS/JS chat page and a
   `/ask` endpoint streaming Server-Sent Events (`data: {"t": "..."}\n\n`).
2. **Model client.** POST to Ollama `http://127.0.0.1:11434/api/chat` with `stream: true`;
   yield the `message.content` tokens. (Optional: Anthropic `/v1/messages` for Claude.)
3. **Memory.** A SQLite table `(ts, kind, text, importance, emb)`. Recall = relevance ×
   (0.5+importance) × exp(-age/45 days). Relevance by embedding cosine if you have an embed
   model, else word overlap.
4. **Retrieval.** SQLite FTS5 over chunked `knowledge/` files; pull the top passages into the
   prompt and cite the filename.
5. **Awareness.** Compute prayer times from a standard solar algorithm (lat/lon/date) and the
   Hijri date from the tabular Islamic calendar; put a one-line "it is X, next prayer in Y"
   into the prompt.
6. **Capabilities.** Scan a `caps/` folder; each file exposes `MANIFEST` + functions; build a
   tool catalog into the prompt; parse a fenced `action` block from the model, run the tool,
   feed the result back, loop.
7. **Persona.** A text file injected at the top of every prompt.
This document plus `ROADMAP.md` and the source comments are enough to do it. Any capable
model — or a competent programmer — can reconstruct Piper from this description.

## What to back up (the only things that matter)
```
knowledge/        your library
data/             memory.db, tasks.json   (the index rebuilds itself)
persona.txt       who Piper is
piper.conf        your settings
```
Copy these to an encrypted drive periodically. Everything else is just code that can be
regenerated. That is the point of صفر: the data and the idea are sacred; the machine is rented
from no one and replaceable.
EOF
echo "(written via heredoc in next step)"