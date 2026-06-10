#!/bin/bash
# Double-click this on a Mac to launch AXON.
# It starts a tiny local server in this folder and opens it in your browser.
cd "$(dirname "$0")"
PORT=8723
echo "Starting AXON at http://localhost:$PORT ..."
# open the browser shortly after the server starts
( sleep 1; open "http://localhost:$PORT/index.html" ) &
# prefer python3, fall back to python
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer $PORT
else
  echo "Python was not found. Install it once with: xcode-select --install"
  echo "Then double-click this file again."
  read -n 1 -s -r -p "Press any key to close."
fi
