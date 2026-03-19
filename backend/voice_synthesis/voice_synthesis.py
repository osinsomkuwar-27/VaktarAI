from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from cartesia import Cartesia
import os
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Kshitij's Voice Synthesis")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = Cartesia(api_key=os.getenv("CARTESIA_API_KEY"))

# ✅ Always save relative to THIS file, not the working directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

TONE_VOICE_MAP = {
    "urgent":     "256fd5ae-c666-4ce4-b356-03a53652e8be",  # Damon - Commanding Narrator
    "calm":       "256fd5ae-c666-4ce4-b356-03a53652e8be",  # Diana - Gentle Mom
    "inspiring":  "256fd5ae-c666-4ce4-b356-03a53652e8be",  # Mindy - Spirited Ally
    "formal":     "256fd5ae-c666-4ce4-b356-03a53652e8be",  # Donny - Steady Presence
    "empathetic": "256fd5ae-c666-4ce4-b356-03a53652e8be",  # Patricia - Veteran Support
}

TONE_SPEED_MAP = {
    "urgent":     1.3,
    "calm":       0.85,
    "inspiring":  1.1,
    "formal":     1.0,
    "empathetic": 0.9,
}


def strip_ssml(ssml_text: str) -> str:
    """Strip SSML tags — Cartesia takes plain text, not SSML."""
    return re.sub(r'<[^>]+>', '', ssml_text).strip()


class VoiceRequest(BaseModel):
    ssml: str
    detected_tone: str = "formal"


@app.get("/health")
def health():
    return {"status": "Voice synthesis running", "port": 8003}


@app.post("/synthesize")
async def synthesize(request: VoiceRequest):
    if not os.getenv("CARTESIA_API_KEY"):
        raise HTTPException(status_code=500, detail="CARTESIA_API_KEY not set in .env")

    try:
        plain_text = strip_ssml(request.ssml)

        if not plain_text:
            raise HTTPException(status_code=400, detail="Text is empty after stripping SSML tags")

        print(f"[VOICE] Tone: {request.detected_tone} | Text: {plain_text}")

        voice_id = TONE_VOICE_MAP.get(request.detected_tone, TONE_VOICE_MAP["formal"])

        response = client.tts.generate(
            model_id="sonic-3",
            transcript=plain_text,
            voice={
                "mode": "id",
                "id": voice_id,
            },
            output_format={
                "container": "wav",
                "sample_rate": 44100,
                "encoding": "pcm_s16le",
            },
        )

        # ✅ Save to absolute path — works regardless of where uvicorn is launched from
        audio_path = os.path.join(OUTPUT_DIR, "output_audio.wav")
        with open(audio_path, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)

        print(f"[VOICE] Audio saved: {audio_path}")

        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail=f"Audio file not created at {audio_path}")

        return FileResponse(
            audio_path,
            media_type="audio/wav",
            filename="output_audio.wav"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn voice_synthesis:app --reload --port 8003