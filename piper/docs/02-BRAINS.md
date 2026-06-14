# 02 · The three brains

Piper picks the best available brain on every turn, automatically.

1. **Ollama (local)** — private, free, offline after the model is downloaded. The default
   and the home brain. Runs on your machine.
2. **Claude (API)** — the strongest reasoning, for when an answer must be exactly right.
   Optional; needs a key and the internet. Used only when a turn routes to it.
3. **Offline engine** — math, dates, simple facts, and recall from your memory and library.
   Always works, even with no model and no internet. The floor that keeps Piper useful.

## Setting up Ollama (recommended)

1. Install from **ollama.com** (native app on Mac/Windows, one-line on Linux).
2. Pull a model:
   ```
   ollama pull qwen2.5:3b
   ```
   `qwen2.5:3b` is a good balance for modest hardware. On a strong machine (Apple Silicon,
   a GPU), use `qwen2.5:7b` or `llama3.1:8b` for noticeably better reasoning. Set the name
   in `piper.conf` under `"model"`.
3. That is it. Launch Piper; it detects Ollama at `http://127.0.0.1:11434` and the header
   shows the brain as "ollama".

Optional: a smaller `"voice_model"` for snappier spoken replies, and `"embed_model"`
(`nomic-embed-text`, `ollama pull nomic-embed-text`) so memory recalls by meaning rather
than word-match.

## Setting up Claude (the amplifier)

1. Get an API key from the Anthropic console.
2. Either put it in `piper.conf` as `"claude_key"`, or — better — set an environment
   variable so it never touches disk:
   ```
   export PIPER_CLAUDE_KEY=sk-ant-...
   ```
3. Set `"claude_model"` (default `claude-sonnet-4-6`; use a heavier model for hard work).

If both Ollama and Claude are available, Ollama is used first (private, free). To prefer
Claude, stop Ollama or leave it unpulled.

## Choosing a model — the honest trade-off

The quality of Piper's reasoning is the size of the model. A 3B model is fast and private
but will sometimes be shallow or get fine detail wrong. A 7–8B model is much better and
still local. Claude is best of all but leaves your machine. For medicine and anything that
must be exact, use a bigger local model or Claude, and lean on your `knowledge/` library
to ground it.

## What can go wrong

| Symptom | Cause | Fix |
|---|---|---|
| Header says "offline" though Ollama is installed | Ollama not running | Start it (`ollama serve`, or just open the app). |
| First question hangs a long time | model is downloading or loading into RAM | Wait; subsequent answers are fast. Pull the model ahead of time. |
| Answers are slow/short on weak hardware | model too big for the machine | Use `qwen2.5:1.5b` or `3b`; close other apps. |
| "API key was rejected" | bad/expired Claude key | Re-check `claude_key` or `PIPER_CLAUDE_KEY`. |
| Ollama runs out of memory | model larger than RAM | Smaller model; the service caps memory (see `10-HOME-SERVER.md`). |
