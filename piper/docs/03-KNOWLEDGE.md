# 03 · Knowledge — feeding it your library

Anything in `knowledge/` (`.txt` or `.md`) becomes Piper's grounding. On launch it builds a
fast on-disk search index (SQLite FTS5) and pulls the most relevant passages into its
answers, citing each source by filename. This is what makes Piper answer from *your* books,
*your* plan, *your* theology — not improvisation.

## How to add material
1. Drop `.txt`/`.md` files into `knowledge/`. Subfolders are fine.
2. Relaunch Piper. It re-indexes only changed files, so it stays fast.
3. Ask something the files cover; Piper cites `[filename]`.

For PDFs or Word docs: export to plain text first (most apps: File → Export/Save As → .txt).
Plain text indexes best and lasts forever.

## How ranking works
- Files whose names suggest **faith** (islam, quran, deen, dua, hadith, tafsir, kitab…) are
  weighted higher for religious questions.
- Files that look **personal** (arcbook, companion, weekly plan, master plan, loophole,
  journal, profile, codex, or your name) are weighted **highest** — your own operating
  manual outranks generic textbooks.
- Everything else is reference (the textbooks).
Edit `_kind_of()` in `piper.py` to change these rules.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| New file isn't used | Piper not relaunched, or it's a PDF | Relaunch; convert PDFs to .txt. |
| "indexed 0 passages" | knowledge/ empty or only README | Add real text files. |
| Garbled text from a file | it was a binary/encoded export | Re-export as UTF-8 plain text. |
| Index seems stale | manifest out of sync | Delete `data/knowledge.fts` and `data/knowledge.manifest.json`; relaunch to rebuild. |
| Huge library slow to index | thousands of files | Normal once; only changed files re-index after. |
