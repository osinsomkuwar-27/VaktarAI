@echo off
echo ================================
echo    Starting AI Avatar Pipeline
echo ================================

echo Starting Emotion Engine :8001...
start "Emotion Engine :8001" cmd /k "cd /d D:\Coding\aiavatar\backend && .\venv\Scripts\activate && cd emotion_engine && uvicorn main:app --reload --port 8001"

echo Starting Translation :8002...
start "Translation :8002" cmd /k "cd /d D:\Coding\aiavatar\backend && .\venv\Scripts\activate && cd translation && uvicorn main:app --reload --port 8002"

echo Starting Voice Synthesis :8003...
start "Voice Synthesis :8003" cmd /k "cd /d D:\Coding\aiavatar\backend && .\venv\Scripts\activate && cd voice_synthesis && uvicorn voice_synthesis:app --reload --port 8003"

echo Starting Pipeline :8000...
start "Pipeline :8000" cmd /k "cd /d D:\Coding\aiavatar\backend && .\venv\Scripts\activate && cd pipeline && uvicorn pipeline:app --reload --port 8000"

echo Starting Avatar SadTalker :8004...
start "Avatar SadTalker :8004" cmd /k "cd /d D:\Coding\aiavatar\avatar_video && .\venv\Scripts\activate && cd SadTalker && ..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8004"

echo ================================
echo All services started!
echo ================================
echo.
echo Ports:
echo   Pipeline      : http://localhost:8000
echo   Emotion Engine: http://localhost:8001
echo   Translation   : http://localhost:8002
echo   Voice Synthesis: http://localhost:8003
echo   Avatar        : http://localhost:8004
echo.
pause