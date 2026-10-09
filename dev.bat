@echo off
cd /d "%~dp0"
set PYTHONUTF8=1
echo Instalando dependencias...
uv sync --system-certs
set NODE_OPTIONS=--use-system-ca
cd frontend
call npm install
cd ..
echo.
echo Backend em http://127.0.0.1:5000
echo Frontend em http://127.0.0.1:5173
start "Giassi backend" /D "%~dp0" cmd /k uv run --no-sync giassi
cd frontend
call npm run dev
