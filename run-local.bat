@echo off
rem Serve from this folder on loopback; requires the Python launcher for Windows.
cd /d "%~dp0"
py -3 -m http.server 4173 --bind 127.0.0.1
