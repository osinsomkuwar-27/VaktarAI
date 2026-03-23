"""
ai_brain/main.py
----------------
FastAPI service running on port 8005.

Flow:
    1. Receives question from frontend (or pipeline :8000)
    2. brain.py decides Gemini vs Ollama → returns text answer
    3. Sends answer text to SadTalker :8004 → gets back video URL
    4. Returns { answer, source, video_url } to caller

Start command (added to start_all.bat):
    uvicorn main:app --reload --port 8005
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# brain.py is in the same folder
from brain import ask, has_internet

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

SADTALKER_URL = os.getenv("SADTALKER_URL", "http://localhost:8004")

app = FastAPI(title="AI Brain", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question:      str
    source_image:  str | None = None   # optional: override avatar image path
    result_dir:    str | None = None   # optional: override output folder

class AskResponse(BaseModel):
    answer:    str
    source:    str           # "gemini" | "ollama"
    video_url: str | None    # URL returned by SadTalker, or None
    status:    str           # "ok" | "partial" | "error"


# ── /ask ──────────────────────────────────────────────────────────────────────

@app.post("/ask", response_model=AskResponse)
async def ask_endpoint(req: AskRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # ── Step 1: Get answer from brain (Gemini or Ollama) ──────────────────
    try:
        result = await ask(question)
        answer = result["answer"]
        source = result["source"]
        print(f"[ai_brain] Answer from {source}: {answer[:80]}...")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # ── Step 2: Send answer text to SadTalker :8004 → get video ──────────
    # SadTalker's main.py (already running on :8004) accepts:
    #   POST /generate  { "text": str, "source_image": str, "result_dir": str }
    # and returns:
    #   { "video_url": str }
    video_url = None
    try:
        payload = {"text": answer}
        if req.source_image:
            payload["source_image"] = req.source_image
        if req.result_dir:
            payload["result_dir"] = req.result_dir

        async with httpx.AsyncClient(timeout=300.0) as client:
            sadtalker_resp = await client.post(
                f"{SADTALKER_URL}/generate",
                json=payload,
            )
            sadtalker_resp.raise_for_status()
            video_url = sadtalker_resp.json().get("video_url")
            print(f"[ai_brain] SadTalker returned: {video_url}")

    except httpx.HTTPStatusError as e:
        print(f"[ai_brain] SadTalker HTTP error: {e.response.status_code} — {e.response.text}")
    except Exception as e:
        print(f"[ai_brain] SadTalker unreachable: {e}")

    return AskResponse(
        answer=answer,
        source=source,
        video_url=video_url,
        status="ok" if video_url else "partial",
    )


# ── /health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    online = await has_internet()

    # Check if SadTalker is reachable
    sadtalker_ok = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{SADTALKER_URL}/health")
            sadtalker_ok = r.status_code == 200
    except Exception:
        sadtalker_ok = False

    return {
        "status":       "ok",
        "internet":     online,
        "active_llm":   "gemini" if online else "ollama",
        "sadtalker":    "reachable" if sadtalker_ok else "unreachable",
        "sadtalker_url": SADTALKER_URL,
    }