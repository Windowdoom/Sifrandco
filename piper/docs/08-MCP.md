# 08 · MCP — connecting the open tool ecosystem

The Model Context Protocol (MCP) is an open standard for giving an AI tools. Hundreds of
MCP servers exist and the number grows fast: filesystem, web fetch, GitHub, Slack, Google
Drive, databases, browser automation, and more. Teach Piper to speak MCP once, and it can
borrow any of them.

An MCP server is a small program Piper launches and talks to over stdin/stdout. You declare
the servers you want in `piper.conf`.

## Setup
1. Most MCP servers run via **Node** (`npx`) or **Python** (`uvx`). Install whichever a
   server needs:
   - Node: install from nodejs.org (gives you `npx`).
   - uv/uvx: `curl -LsSf https://astral.sh/uv/install.sh | sh` (gives you `uvx`).
2. Add servers to `piper.conf`:
   ```
   "mcp_servers": {
     "files": { "command": ["npx","-y","@modelcontextprotocol/server-filesystem","/Users/you/Documents"] },
     "fetch": { "command": ["uvx","mcp-server-fetch"] }
   }
   ```
3. Relaunch. Ask Piper to "list MCP tools on files" or just ask for something those tools
   provide; `mcp_call` is mutating, so you'll get a confirm card.

## Status: experimental
MCP is young and each server has its own quirks and install steps. Piper's client speaks
newline-delimited JSON-RPC and does the standard initialize → list → call handshake. If a
server uses a different transport or framing, it may not work yet; that is expected at this
stage and is a known area to harden.

## What can go wrong
| Symptom | Cause | Fix |
|---|---|---|
| "runtime not installed" | npx/uvx missing | Install Node or uv (above). |
| "no response from MCP server" | server uses a different transport, or crashed on launch | Run the `command` yourself in a terminal to see its output; check its docs. |
| Server needs an API key | many do (GitHub, Slack…) | Pass it via the server's env/args per that server's README. |
| Slow first call | server starts fresh each call | Expected; fine for occasional use. A persistent-session client is a future upgrade. |

Treat MCP as the long-term lever: every server the community ships becomes a Piper ability,
for free, the day you add a line to the config.
