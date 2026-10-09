@echo off
cd /d "%~dp0"
set PYTHONUTF8=1
echo Instalando o backend com uv...
uv sync --system-certs
echo.
echo Gerando o frontend...
cd frontend
set NODE_OPTIONS=--use-system-ca
call npm install
call npm run build
cd ..
echo.
echo Abrindo http://127.0.0.1:5000
start "" http://127.0.0.1:5000
uv run --no-sync giassi
pause
