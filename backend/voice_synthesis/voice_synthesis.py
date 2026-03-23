from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from cartesia import Cartesia
import os
import re
import json
from dotenv import load_dotenv

# Search for .env in current dir and parent dirs (project root has the keys)
_dir = os.path.dirname(os.path.abspath(__file__))
for _i in range(5):
    _env = os.path.join(_dir, ".env")
    if os.path.exists(_env):
        load_dotenv(_env)
        break
    _dir = os.path.dirname(_dir)
else:
    load_dotenv()  # fallback: default behavior

app = FastAPI(title="AI Avatar Voice Synthesis")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load voice config
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice_config.json")
with open(CONFIG_PATH) as f:
    VOICE_CONFIG = json.load(f)

VALID_SPEAKERS = list(VOICE_CONFIG["voices"].keys())
# ["shreeja", "osin", "soham", "kshitij", "tanishka", "bhargavi"]


def strip_ssml(ssml_text: str) -> str:
    return re.sub(r'<[^>]+>', '', ssml_text).strip()


class VoiceRequest(BaseModel):
    ssml: str
    speaker: str = "shreeja"  # name-based, replaces detected_tone


@app.get("/health")
def health():
    return {"status": "Voice synthesis running", "port": 8003, "speakers": VALID_SPEAKERS}


@app.get("/speakers")
def get_speakers():
    return {"speakers": VALID_SPEAKERS}


@app.post("/synthesize")
async def synthesize(request: VoiceRequest):
    # Validate speaker name
    speaker = request.speaker.lower().strip()
    if speaker not in VALID_SPEAKERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid speaker '{speaker}'. Valid options: {VALID_SPEAKERS}"
        )

    # Block speakers with placeholder IDs
    voice_id = VOICE_CONFIG["voices"][speaker]
    if not voice_id or voice_id.endswith("-here"):
        raise HTTPException(
            status_code=400,
            detail=f"Voice ID for '{speaker}' is not configured yet."
        )

    # Pick correct API key for this speaker
    api_key_env = VOICE_CONFIG["api_keys"][speaker]
    api_key = os.getenv(api_key_env)
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=f"API key '{api_key_env}' not set in .env"
        )

    client = Cartesia(api_key=api_key)

    try:
        plain_text = strip_ssml(request.ssml)

        if not plain_text:
            raise HTTPException(status_code=400, detail="Text is empty after stripping SSML tags")

        print(f"[VOICE] Speaker: {speaker} | Voice ID: {voice_id} | Text: {plain_text}")

        chunk_iter = client.tts.bytes(
            model_id="sonic-3",
            transcript=plain_text,
            voice={
                "mode": "id",
                "id": voice_id,
            },
            output_format={
                "container": "wav",
                "sample_rate": 44100,
                "encoding": "pcm_f32le",
            },
        )

        audio_path = os.path.join(OUTPUT_DIR, f"{speaker}_output.wav")
        with open(audio_path, "wb") as f:
            for chunk in chunk_iter:
                f.write(chunk)

        file_size = os.path.getsize(audio_path)
        print(f"[VOICE] Audio saved: {audio_path} ({file_size} bytes)")

        if file_size == 0:
            raise ValueError("Cartesia returned empty audio — check voice ID or API quota")

        return FileResponse(
            audio_path,
            media_type="audio/wav",
            filename=f"{speaker}_output.wav"
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


# Run with: uvicorn voice_synthesis:app --reload --port 8003