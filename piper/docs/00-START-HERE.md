# Start here

This is Piper — your personal AI, the outer mind of SifarOS, in one folder. If you are
reading this years from now on a fresh machine, you can rebuild the whole thing from
this folder alone. Nothing here depends on a company, a cloud, or a subscription.

## What this folder is

```
piper/
  piper.py              the entire core: server + reasoning + memory + retrieval + awareness
  persona.txt           who Piper is (edit freely)
  piper.conf            all settings (model, location, port, connections)
  start.command         launcher for Mac/Linux  (double-click or: python3 piper.py)
  start.bat             launcher for Windows
  shell/                the صفر web interface (HTML/CSS/JS)
  caps/                 capabilities — each file is a new sense or hand (web, system, home, mcp, tasks)
  knowledge/            your library; text files here become Piper's grounding
  service/              install Piper as an always-on home service
  docs/                 this manual
  data/                 created at runtime: memory.db, the search index, tasks, logs (back this up)
```

## The 60-second version

1. Have Python 3 (`python3 --version`). If missing, see `01-INSTALL.md`.
2. Double-click `start.command` (Mac/Linux) or `start.bat` (Windows). A browser opens.
3. For a real brain, install Ollama and run `ollama pull qwen2.5:3b` (see `02-BRAINS.md`).
   Without it, Piper still does math, dates, memory, and library recall.
4. Talk to it. Drop more `.txt`/`.md` into `knowledge/` to deepen it.

## The manual

- `01-INSTALL.md` — install on Mac, Linux, Windows, phone, from zero. What breaks, how to fix.
- `02-BRAINS.md` — the three brains (Ollama / Claude / offline), choosing a model.
- `03-KNOWLEDGE.md` — feeding it your library and how recall works.
- `04-MEMORY.md` — what it remembers, how to teach and forget.
- `05-CAPABILITIES.md` — the plugin system and how to write your own.
- `06-ACTIONS-SAFETY.md` — letting it act on your machine, safely.
- `07-HOME-ASSISTANT.md` — connecting smart-home hardware.
- `08-MCP.md` — connecting the open tool ecosystem.
- `09-PHONE-AND-MESH.md` — using it from your iPhone, anywhere.
- `10-HOME-SERVER.md` — running it always-on.
- `11-SECURITY.md` — the lock, biometrics, the threat model, honestly.
- `12-TROUBLESHOOTING.md` — the master index of what goes wrong.
- `13-RECREATE-FROM-ZERO.md` — rebuild everything from صفر, even if this folder is lost.

## The one rule

صفر — zero. Nothing is added except on purpose. Every capability, every book, every node
is a deliberate choice. The system is small, owned, and yours. It compounds over a decade.
