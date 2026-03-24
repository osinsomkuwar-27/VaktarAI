"""
captions/main.py — Caption Generation Service
Runs on port 8005. Pipeline calls POST /add-captions after video generation.

Fast text-based captioning:
  - Input:  video_path + translated_ssml (the exact text to display)
  - Output: captioned video path
  - Speed:  ~5-10 seconds (ffmpeg SRT burn, no Whisper)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from captions import add_captions_to_video

app = FastAPI(title="Vaktar AI Caption Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CaptionRequest(BaseModel):
    video_path:      str
    translated_ssml: Optional[str] = None
    output_path:     Optional[str] = None
    target_language: Optional[str] = "auto"
    font_size:       Optional[int] = 16


@app.get("/health")
def health():
    return {"status": "Caption service running", "port": 8005}


@app.post("/add-captions")
def add_captions(req: CaptionRequest):
    if not req.video_path:
        raise HTTPException(status_code=400, detail="video_path cannot be empty")

    if not os.path.exists(req.video_path):
        raise HTTPException(
            status_code=404,
            detail=f"Video not found: {req.video_path}"
        )

    try:
        output = add_captions_to_video(
            video_path=req.video_path,
            translated_ssml=req.translated_ssml,
            output_path=req.output_path,
            target_language=req.target_language or "auto",
            font_size=req.font_size or 16,
        )
        return {
            "status": "success",
            "output_video_path": output,
            "captioned": True,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[CAPTIONS] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --reload --port 8005