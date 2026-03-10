import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from emotion_engine.emotion_engine import enhance_text
from translation.translation import translate_with_emotion
from voice_synthesis.voice_synthesis import generate_audio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="AIAvatar Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelineRequest(BaseModel):
    text: str
    tone_override: Optional[str] = None
    target_language: Optional[str] = "en"

@app.get("/")
def health():
    return {"status": "Pipeline is live!"}

@app.post("/generate-video")
async def generate_video(req: PipelineRequest):
    try:
        # Step 1 — Soham: Get emotional SSML
        print("[STEP 1] Getting emotional SSML...")
        ssml_data = enhance_text(req.text, req.tone_override)
        tone = ssml_data["detected_tone"]
        ssml = ssml_data["ssml"]
        print(f"[STEP 1] Tone: {tone}")

        # Step 2 — Bhargavi: Translate if not English
        if req.target_language != "en":
            print(f"[STEP 2] Translating to {req.target_language}...")
            ssml = translate_with_emotion(ssml, req.target_language)
            print(f"[STEP 2] Translated!")
        else:
            print("[STEP 2] No translation needed.")

        # Step 3 — Kshitij: Generate audio
        print("[STEP 3] Generating audio...")
        audio_path = await generate_audio(ssml)
        print(f"[STEP 3] Audio saved: {audio_path}")

        # Step 4 — Tanishka: Generate video (stub for now)
        print("[STEP 4] Video generation pending Tanishka's module...")
        video_url = "https://dummy-video-url.com/video.mp4"

        return {
            "status": "success",
            "tone": tone,
            "ssml": ssml,
            "audio_file": audio_path,
            "video_url": video_url
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("pipeline:app", host="0.0.0.0", port=8000, reload=True)
