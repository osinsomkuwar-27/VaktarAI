#!/bin/bash
echo "================================"
echo "   Starting AI Avatar Pipeline"
echo "================================"

PROJECT="/Users/tanishkagadilkar/Desktop/VaktarAI"

echo "Starting Emotion Engine :8001..."
osascript -e "tell app \"Terminal\" to do script \"cd $PROJECT/backend && source venv/bin/activate && set -a && source .env && set +a && cd emotion_engine && uvicorn main:app --reload --port 8001\""

sleep 1

echo "Starting Translation :8002..."
osascript -e "tell app \"Terminal\" to do script \"cd $PROJECT/backend && source venv/bin/activate && set -a && source .env && set +a && cd translation && uvicorn main:app --reload --port 8002\""

sleep 1

echo "Starting Voice Synthesis :8003..."
osascript -e "tell app \"Terminal\" to do script \"cd $PROJECT/backend && source venv/bin/activate && set -a && source .env && set +a && cd voice_synthesis && uvicorn voice_synthesis:app --reload --port 8003\""

sleep 1

echo "Starting Pipeline :8000..."
osascript -e "tell app \"Terminal\" to do script \"cd $PROJECT/backend && source venv/bin/activate && set -a && source .env && set +a && cd pipeline && uvicorn pipeline:app --reload --port 8000\""

sleep 1

echo "Starting Avatar SadTalker :8004..."
osascript -e "tell app \"Terminal\" to do script \"cd $PROJECT/avatar_video/SadTalker && ../venv/bin/python -m uvicorn main:app --reload --port 8004\""

echo "================================"
echo "All services started!"
echo "================================"
echo ""
echo "Ports:"
echo "  Pipeline       : http://localhost:8000"
echo "  Emotion Engine : http://localhost:8001"
echo "  Translation    : http://localhost:8002"
echo "  Voice Synthesis: http://localhost:8003"
echo "  Avatar         : http://localhost:8004"
echo ""
