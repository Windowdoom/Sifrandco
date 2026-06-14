# 04 · Memory — what Piper remembers

Piper keeps long-term memory in `data/memory.db`, recalled by importance × time-decay
(and by meaning when an embed model is set, otherwise by word-match). It is yours to grow
and prune.

## Teach it
- `remember that my Step 2 is in August` → stored as a fact, surfaced when relevant.
- It also quietly notes things you say about preferences ("I prefer…") and relationships
  ("my brother…").

## Manage it
- `what do you know about me` → recent memories.
- `forget step 2` → removes anything matching that phrase.
- The **memory** button (top-right of the shell) shows everything it holds.

## Kinds and weighting
correction > preference ≈ relationship > win > fact > conversation > query. Higher-weight
memories surface more readily; everything fades on a ~45-day half-life unless reinforced.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| It forgot something | low importance + time decay | Re-teach it, or raise weighting in `IMPORTANCE` in piper.py. |
| Recall feels off | no embed model, word-match only | `ollama pull nomic-embed-text`, set `embed_model` in piper.conf. |
| Want a clean slate | — | Delete `data/memory.db` (this erases all memories). |
| Memory not saving | disk/permissions | Ensure the `data/` folder is writable. |

Back up `data/` to keep your memory across machines.
