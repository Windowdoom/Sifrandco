@echo off
REM Double-click on Windows to launch Piper.
cd /d "%~dp0"
where python >/dev/null 2>/dev/null && (python piper.py & goto :eof)
where py >/dev/null 2>/dev/null && (py piper.py & goto :eof)
echo Python 3 not found. Install from python.org, tick "Add to PATH", then run this again.
pause
