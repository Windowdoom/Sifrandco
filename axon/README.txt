AXON 2 — your personal assistant that runs on your own machine

HOW TO OPEN IT (Mac)
1. Double-click "start-axon.command".
   - First time: right-click it, choose Open, then Open again in the dialog.
   - If Python is missing, run once in Terminal: xcode-select --install
2. Your browser opens AXON at http://localhost:8723. Leave the Terminal window open.

Manual alternative (any computer with Python):
   cd /path/to/axon
   python3 -m http.server 8723
   then visit http://localhost:8723 in Chrome, Edge, or Safari.

MACHINE ACCESS — AXON NOW HAS HANDS (the bridge)
start-axon launches a tiny local server (bridge.py, pure Python, no installs)
that serves the app AND gives AXON real control of your computer:
  - Search and read any file under your home folder (free, instant).
  - Write and create files, run shell commands, open apps and URLs, and write
    and execute code (Python, JS, bash) in a scratch sandbox.
Reading and searching happen freely. Anything that changes your machine pops a
confirm card showing the exact file, command, or code, and waits for one tap.
The brain (Claude or local) drives these tools in a loop, so you can say things
like "find my tax notes and summarize them", "make a folder on my Desktop and
write today's plan into it", or "run this script and tell me what broke", and it
actually does it. Header shows "machine linked" when the bridge is connected.

SAFETY
  - The bridge binds to 127.0.0.1 only and is never on the network.
  - A fresh random token each launch; only the AXON page can call the tools.
  - Reads/writes are confined to approved folders (your home by default).
  - Every write, command, and code run is logged to axon-bridge.log.
  - Opening index.html directly (no bridge) still works for chat, notes, recall,
    and the offline engine — you just lose the machine powers until you launch
    with start-axon.

WHAT IS NEW IN AXON 2
- Instant offline answers with NO brain and NO internet: arithmetic of any
  complexity, unit conversions (length, mass, volume, temperature, time, speed,
  data), date math ("days until Aug 12", "what date is 6 weeks from now"),
  world facts (capitals, elements, planets, science constants), percentages,
  tips, dice, coin flips, square roots, factorials, spelling.
- If the Claude or local brain fails mid-answer, AXON now falls back to
  recalling from your own notes instead of just showing an error.
- The API engine retries automatically on rate limits and outages, and you can
  stop any answer with the stop button, Esc, or by saying "stop".
- Smarter recall: BM25 ranking with stemming, so "studying cardiology" finds
  your "cardiac study" notes.
- Cleaner output: live markdown while streaming, tables, blockquotes, code
  blocks with copy buttons.
- Better voice: speech skips URLs, headers, and markdown symbols. New ∞ button
  enables hands-free conversation mode: it listens again each time it finishes
  talking, so you can go back and forth without touching anything.
- A new look: glassmorphic panels, a living reactor core with ambient particle
  field that quickens when AXON thinks or speaks, suggestion chips, ⌘K to
  focus the command line.

WHAT TO USE
- Just talk to it. It remembers the conversation, so follow-ups work.
- "remember that ..."  teaches it a lasting fact.
- "note ..."           saves a quick note to the space you are in.
- "summarize this"     turns the conversation into a saved note.
- "switch to writing"  changes focus to another space.
- "stop"               cuts off speech and generation.
- Ask for a chart, a diagram, or to be quizzed, and it will draw it.
- Open any space and use "Feed me material" to upload .txt, .md, or .pdf
  sources. It pulls the relevant passages into its answers.

CHOOSING A BRAIN (Settings)
- Off:    instant answers (math, units, dates, facts), notes, memory, recall.
- Claude: strongest answers, needs your Anthropic API key, needs internet.
- Local:  runs on your machine, free, offline after a one-time model download
          (1 to 5 GB depending on size). Your Apple Silicon handles the 8B well.

YOUR DATA
Everything stays in your browser on this machine. Use Settings, Export
everything now and then to keep a backup you can re-import anywhere.
