# 06 · Actions and safety — letting Piper act

Some tools only read (web search, list files, host info); those run freely. Others change
your machine or the world (`run_command`, `write_file`, `ha_control`, `mcp_call`); those are
"mutating" and governed by one setting in `piper.conf`:

```
"actions": "confirm"
```

- **"off"** — mutating tools are refused. Piper can look but never touch.
- **"confirm"** — (default, recommended) Piper proposes the exact action and a card appears
  in the shell showing the tool and its arguments. Nothing runs until you tap **approve**.
- **"auto"** — mutating tools run immediately, no prompt. Fastest, most Jarvis-like, riskiest.
  Only use on a machine you fully trust and control.

Every mutating action is appended to `data/actions.log` with a timestamp, whatever the mode.

## The confirm card
When Piper wants to act, you see a card: the tool name, a description, and the precise
arguments (the command text, the file path and content, etc.). **Read it before approving.**
Deny anything you do not recognize. Approval waits up to ~2.5 minutes, then auto-denies.

## Boundaries already in place
- `system` file tools are confined to your home folder and the Piper folder.
- `run_command` runs as your normal user (never root) with a 60-second timeout.
- Code/command output is truncated so a runaway cannot flood the model.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| No confirm card appears, action just refused | `actions` is "off" | Set `"actions": "confirm"`. |
| Action ran with no prompt | `actions` is "auto" | Set it back to "confirm". |
| Card appears but approve does nothing | shell lost the connection mid-wait | Re-ask; check the terminal for errors. |
| Want a record of everything done | — | Read `data/actions.log`. |

Rule of thumb: keep `"confirm"`. Move to `"auto"` only for specific trusted automations,
and never on a shared or exposed machine.
