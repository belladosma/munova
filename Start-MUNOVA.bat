@echo off
setlocal
cd /d "%~dp0"
if not exist "index.html" (
  echo No encuentro index.html. Descomprime el ZIP completo y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
where py >nul 2>nul
if %errorlevel%==0 (
  start "MUNOVA Local Server" /min cmd /k "cd /d ""%~dp0"" && py -m http.server 8765 --bind 127.0.0.1"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Necesitas Python 3 para ejecutar la vista local. Tambien puedes publicar el proyecto en Vercel.
    pause
    exit /b 1
  )
  start "MUNOVA Local Server" /min cmd /k "cd /d ""%~dp0"" && python -m http.server 8765 --bind 127.0.0.1"
)
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765"
echo MUNOVA se esta ejecutando en http://127.0.0.1:8765
endlocal
