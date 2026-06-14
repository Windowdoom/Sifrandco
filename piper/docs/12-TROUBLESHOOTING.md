# 12 · Troubleshooting — the master index

Start here when something is wrong. The single best diagnostic: run Piper from a terminal
(`python3 piper.py`) and read what it prints.

## Won't start
- "Python was not found" → install Python 3 (see `01-INSTALL.md`); on Windows tick Add to PATH.
- "address already in use" → another Piper is up; it auto-hops ports — read the printed URL.
- A `caps/` file errors on load → the terminal names it: "capability X failed to load". Fix
  or remove that file; the rest still load.

## Page problems
- Blank/unstyled → a file didn't unzip; re-unzip, keep `shell/` whole. Hard-refresh
  (Cmd/Ctrl+Shift+R).
- Stuck "loading" → look at the terminal for a Python traceback; the index build on a huge
  library can take a minute the first time.

## Brain problems
- Header "offline" with Ollama installed → Ollama isn't running; start it.
- Slow/short answers → model too big for the hardware; use a smaller one.
- "API key rejected" → fix `claude_key` / `PIPER_CLAUDE_KEY`.

## Knowledge / memory
- New files ignored → relaunch; convert PDFs to .txt.
- Bad recall → add an embed model (`02-BRAINS.md`).
- Rebuild index → delete `data/knowledge.fts` and `data/knowledge.manifest.json`, relaunch.
- Wipe memory → delete `data/memory.db`.

## Actions / connections
- Action refused → `"actions"` is "off"; set "confirm".
- No confirm card → connection dropped mid-wait; re-ask.
- Home Assistant errors → `07-HOME-ASSISTANT.md` table.
- MCP errors → `08-MCP.md` table; run the server command yourself to see its output.

## Phone / network
- Phone can't connect → same Wi-Fi or Tailscale; firewall; use the full `?k=` link.
- Old version on phone → re-add to Home Screen.

## Voice
- It won't speak → click the page once (browsers block audio until you interact); check the
  🔊 toggle.
- Mic does nothing → voice input needs Chrome/Edge/Safari and a mic-permission tap.

## Nuclear options (safe)
- Reset runtime state: delete the whole `data/` folder (loses memory, tasks, index; rebuilds
  the index on next launch). `knowledge/`, `persona.txt`, `piper.conf` are untouched.
- Total reinstall: keep `knowledge/`, `data/`, `persona.txt`, `piper.conf`; replace
  everything else from a fresh copy. See `13-RECREATE-FROM-ZERO.md`.
