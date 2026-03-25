# 🎭 VaktarAI — AI-Powered Avatar Generation Platform

> Create hyper-realistic talking avatar videos from just a photo and text. Multilingual, emotion-aware, and caption-ready — in seconds.

[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 🚀 What is VaktarAI?

VaktarAI lets anyone create a **talking avatar video** from a single photo and a text message — no studio, no camera, no design skills required.

Type what you want the avatar to say → choose a language and voice → upload a photo → get back a fully animated, captioned video in seconds.

Built for the **India Innovates Hackathon** — selected for the next round at **Bharat Mandapam** 🇮🇳

---

## ✨ Features

- ⚡ **Instant generation** — under 8 seconds from prompt to avatar
- 🎨 **50+ artistic style presets** — cyberpunk, anime, realism, pixel art, fantasy, gothic
- 🔒 **Face consistency lock** — keeps identity stable across styles and angles
- 🗣️ **Natural language control** — adjust mood, age, lighting, background without sliders
- 🌐 **Multilingual support** — Hindi, English, Marathi, Tamil, Telugu, Bengali and more
- 📝 **Auto captions** — SRT subtitles burned directly onto video, zero transcription errors
- 🧠 **AI Q&A mode** — ask a question, avatar answers via Gemini (online) or Ollama (offline)
- 🛡️ **Content flagging** — blocks deepfake misuse, violence, hate speech before generation
- 🎙️ **6 unique voices** — each team member has their own Cartesia voice ID
- 🔌 **REST API** — every service accessible via HTTP endpoints
- 🔐 **Privacy-first** — photos are never stored or used for training

---

## 🏗️ Architecture

VaktarAI is built as a **microservices pipeline**. Each service runs independently on its own port.

```
User question / text
        │
  ┌─────▼──────┐
  │  Content   │  ← blocks deepfake misuse, violence, hate speech
  │  Flagging  │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │  ai_brain  │  ← Gemini (WiFi on) or Ollama (WiFi off)
  │   :8005    │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │Translation │  ← skip if English
  │   :8002    │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │  Emotion   │  ← detect tone, wrap in SSML
  │   :8001    │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │   Voice    │  ← Cartesia TTS → .wav
  │   :8003    │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │ SadTalker  │  ← photo + audio → .mp4
  │   :8004    │
  └─────┬──────┘
        │
  ┌─────▼──────┐
  │  Captions  │  ← burn SRT subtitles onto video
  │   :8006    │
  └─────┬──────┘
        │
   video_url → frontend
```

### Service Map

| Service | Port | Responsibility |
|---------|------|----------------|
| `pipeline` | `:8000` | Master orchestrator — coordinates all services |
| `emotion_engine` | `:8001` | Detects tone and wraps text in SSML markup |
| `translation` | `:8002` | Translates text to target language |
| `voice_synthesis` | `:8003` | Generates speech audio via Cartesia TTS |
| `SadTalker` | `:8004` | Animates avatar face from photo + audio |
| `ai_brain` | `:8005` | Routes to Gemini (online) or Ollama (offline) |
| `captions` | `:8006` | Burns SRT subtitles onto video via ffmpeg |

---

## 📁 Folder Structure

```
VaktarAI/
├── backend/
│   ├── ai_brain/
│   │   ├── brain.py              # Gemini / Ollama routing + WiFi check
│   │   └── main.py               # FastAPI on :8005
│   ├── captions/
│   │   ├── captions.py           # SRT generation + ffmpeg subtitle burn
│   │   ├── main.py               # FastAPI on :8006
│   │   └── test_captions.py      # GUI test tool
│   ├── emotion_engine/
│   │   └── main.py               # FastAPI on :8001
│   ├── pipeline/
│   │   └── pipeline.py           # FastAPI on :8000 (master orchestrator)
│   ├── translation/
│   │   └── main.py               # FastAPI on :8002
│   ├── voice_synthesis/
│   │   ├── voice_synthesis.py    # FastAPI on :8003
│   │   └── voice_config.json     # Speaker voice IDs + API keys mapping
│   ├── document_processor.py     # PDF/DOCX/email text extraction
│   └── venv/                     # Python virtual environment
├── avatar_video/
│   └── SadTalker/                # FastAPI on :8004
│       ├── inference.py          # SadTalker core inference
│       ├── main.py               # API wrapper
│       └── checkpoints/          # Model weights (not committed)
├── frontend/                     # React frontend
├── .env                          # All API keys (never committed)
├── .env.example                  # Template — copy this to .env
├── .gitignore
├── start_all.bat                 # One-click startup for Windows
└── README.md
```

---

## ⚙️ Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- ffmpeg (installed and in PATH)
- Git
- Windows 10/11 (for full pipeline with SadTalker)

### 1. Clone the repo

```bash
git clone https://github.com/osinsomkuwar-27/VaktarAI.git
cd VaktarAI
```

### 2. Create virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# LLM — online
GEMINI_API_KEY=your_gemini_key_here

# LLM — offline fallback (Codespaces / no billing)
GROQ_API_KEY=your_groq_key_here

# Ollama — fully offline
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=phi3

# Services
EMOTION_URL=http://localhost:8001
TRANSLATION_URL=http://localhost:8002
VOICE_URL=http://localhost:8003
AVATAR_URL=http://localhost:8004
AI_BRAIN_URL=http://localhost:8005
CAPTION_URL=http://localhost:8006

# Avatar word limit (keeps videos short for SadTalker)
MAX_ANSWER_WORDS=40
```

### 4. Download SadTalker models

```bash
cd avatar_video/SadTalker
bash scripts/download_models.sh
```

> This downloads ~5GB of model weights. Run once.

### 5. Install Ollama (for offline mode)

```bash
# Download from https://ollama.com
ollama pull phi3
```

### 6. Start everything

```bash
# Windows — double-click or run:
start_all.bat
```

This opens 7 terminal windows, one per service.

---

## 🔌 API Reference

### `POST /generate-video`

Generate a talking avatar video from text.

```bash
curl -X POST http://localhost:8000/generate-video \
  -F "text=Welcome to VaktarAI!" \
  -F "target_language=hi" \
  -F "speaker=shreeja" \
  -F "photo=@your_photo.png"
```

**Response:**
```json
{
  "success": true,
  "video_url": "http://localhost:8000/videos/xxx_captioned.mp4",
  "detected_tone": "formal",
  "translated_text": "वक्तरएआई में आपका स्वागत है!",
  "session_id": "abc123"
}
```

---

### `POST /ask-and-generate`

Ask a question — avatar answers and speaks it.

```bash
curl -X POST http://localhost:8000/ask-and-generate \
  -F "question=What is VaktarAI?" \
  -F "target_language=en" \
  -F "speaker=osin" \
  -F "photo=@your_photo.png"
```

**Response:**
```json
{
  "success": true,
  "video_url": "http://localhost:8000/videos/xxx_captioned.mp4",
  "answer": "VaktarAI is an AI-powered avatar generation platform...",
  "llm_source": "gemini",
  "detected_tone": "enthusiastic",
  "session_id": "abc123"
}
```

---

### `POST /ask` (ai_brain :8005)

Direct LLM query — returns text only, no video.

```bash
curl -X POST http://localhost:8005/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is artificial intelligence?"}'
```

---

### `GET /health`

Check if a service is running.

```bash
curl http://localhost:8000/health
curl http://localhost:8005/health
curl http://localhost:8006/health
```

---

## 🛡️ Content Flagging

All text is checked before generation. The following are blocked:

| Category | Examples |
|----------|----------|
| `violence` | kill, bomb, terrorist, suicide, torture |
| `hate_speech` | nazi, ethnic cleansing, white supremacy |
| `adult` | porn, explicit, nsfw |
| `deepfake_misuse` | deepfake, impersonate, fake video of |
| `misinformation` | spread false, fake news about, deceive people |

**Blocked response:**
```json
{
  "flagged": true,
  "category": "deepfake_misuse",
  "message": "⚠ This platform cannot be used to create misleading or deceptive content."
}
```

---

## 🌐 Multilingual Support

| Language | Code | Caption Font |
|----------|------|-------------|
| English | `en` | Arial |
| Hindi | `hi` | Nirmala (Windows) |
| Marathi | `mr` | Nirmala (Windows) |
| Tamil | `ta` | Nirmala (Windows) |
| Telugu | `te` | Nirmala (Windows) |
| Bengali | `bn` | Nirmala (Windows) |

Captions always match the language the avatar is speaking — no Whisper, no transcription errors.

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY quota exceeded` | Use `GROQ_API_KEY` instead — free, no region limits |
| `ffmpeg not found` | Install ffmpeg and add to Windows PATH |
| SadTalker produces no video | Run `bash scripts/download_models.sh` in SadTalker dir |
| Ollama not responding | Run `ollama serve` then `ollama pull phi3` |
| Port already in use | Kill the process using Task Manager |
| Captions not showing | Check `:8006` is running, verify `ffprobe` is in PATH |
| `.env` not loading | Make sure `.env` is in project root, not inside `backend/` |
| Hindi text not rendering | `Nirmala.ttc` must be present in `C:\Windows\Fonts\` |

---

## 👥 Team

| Name | Role | Service |
|------|------|---------|
| **Osin** |
| **Shreeja** |
| **Bhargavi** |
| **Soham** |
| **Kshitij** |
| **Tanishka** |

---

## 📝 Commit Convention

```
feat:     new feature
fix:      bug fix
chore:    config, deps, cleanup
refactor: restructuring without new feature
docs:     documentation only
```

**Example:**
```bash
git commit -m "feat: add real-time Q&A with Gemini/Ollama fallback"
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for <strong>India Innovates Hackathon</strong> 🇮🇳
</p>