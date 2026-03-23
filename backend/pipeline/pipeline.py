"""
pipeline/pipeline.py — Shreeja's master orchestration server
Runs on port 8000. Osin's frontend calls POST /generate-video.

Full flow:
  Text → Translation (Bhargavi :8002)
       → Emotion/SSML (Soham :8001)
       → Voice (Kshitij :8003)
       → Avatar Video (Tanishka :8004)
       → Video URL returned to frontend
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import requests
import os
import uuid
import sys
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path so document_processor can be imported
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

app = FastAPI(title="AI Avatar Master Pipeline", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("generated_videos", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
app.mount("/videos", StaticFiles(directory="generated_videos"), name="videos")

# Service URLs
EMOTION_URL     = os.getenv("EMOTION_URL",     "http://localhost:8001")
TRANSLATION_URL = os.getenv("TRANSLATION_URL", "http://localhost:8002")
VOICE_URL       = os.getenv("VOICE_URL",       "http://localhost:8003")
AVATAR_URL      = os.getenv("AVATAR_URL",      "http://localhost:8004")
CAPTION_URL     = os.getenv("CAPTION_URL",     "http://localhost:8005")

UPLOAD_DIR = "uploads"


@app.get("/health")
def health():
    return {"status": "Pipeline running", "port": 8000}


@app.post("/generate-video")
async def generate_video(
    text:            str        = Form(...),
    target_language: str        = Form(default="hi"),
    tone_override:   str        = Form(default=None),
    speaker:         str        = Form(default="shreeja"),
    photo:           UploadFile = File(...)
):
    session_id = uuid.uuid4().hex
    photo_path = os.path.join(UPLOAD_DIR, f"{session_id}_photo.png")
    audio_path = os.path.join(UPLOAD_DIR, f"{session_id}_audio.wav")

    try:
        with open(photo_path, "wb") as f:
            f.write(await photo.read())

        # Keep the user's original text (exactly as typed) — used for English captions
        original_text = text.strip()

        print(f"\n[PIPELINE] Session: {session_id}")
        print(f"[PIPELINE] Original text: {original_text}")
        print(f"[PIPELINE] Target language: {target_language}")

        # ── STEP 1: Translate ──
        # If English → skip translation, keep original text as-is
        # If other language → translate to get perfect target-language text
        if target_language in ("en", "auto", None, ""):
            print("[PIPELINE] Step 1: English — skipping translation")
            translated_text = original_text
        else:
            print(f"[PIPELINE] Step 1: Translating to {target_language}...")
            try:
                trans_response = requests.post(
                    f"{TRANSLATION_URL}/translate",
                    json={"text": original_text, "target_language": target_language},
                    timeout=30
                )
                translated_text = trans_response.json().get("translated_text", original_text)
            except Exception as e:
                print(f"[PIPELINE] Translation failed, using original: {e}")
                translated_text = original_text
        print(f"[PIPELINE] Translated: {translated_text}")

        # ── Caption text decision ──
        # English → use user's exact original text (zero corruption)
        # Other language → use translated text from Step 1 (already perfect)
        if target_language in ("en", "auto", None, ""):
            caption_text = original_text
            print(f"[PIPELINE] Caption text: original English")
        else:
            caption_text = translated_text
            print(f"[PIPELINE] Caption text: translated {target_language}")

        # ── STEP 2: Emotion + SSML ──
        print("[PIPELINE] Step 2: Detecting emotion...")
        emotion_response = requests.post(
            f"{EMOTION_URL}/enhance-text",
            json={
                "text": translated_text,
                "tone_override": tone_override if tone_override and tone_override != "null" else None
            },
            timeout=30
        )
        if emotion_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Emotion engine failed: {emotion_response.text}")

        detected_tone = emotion_response.json().get("detected_tone", "formal")
        ssml          = emotion_response.json().get("ssml", translated_text)
        print(f"[PIPELINE] Tone: {detected_tone}")

        # ── STEP 3: Voice Audio ──
        print("[PIPELINE] Step 3: Generating voice audio...")
        print(f"[PIPELINE] Speaker: {speaker}")
        voice_response = requests.post(
            f"{VOICE_URL}/synthesize",
            json={"ssml": ssml, "speaker": speaker},
            timeout=60
        )
        if voice_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {voice_response.text}")

        with open(audio_path, "wb") as f:
            f.write(voice_response.content)
        print(f"[PIPELINE] Audio saved")

        # ── STEP 4: Avatar Video ──
        print("[PIPELINE] Step 4: Generating avatar video (2-3 min)...")
        with open(photo_path, "rb") as p, open(audio_path, "rb") as a:
            avatar_response = requests.post(
                f"{AVATAR_URL}/generate-avatar",
                files={
                    "photo": ("photo.png", p, "image/png"),
                    "audio": ("audio.wav", a, "audio/wav")
                },
                timeout=300
            )
        if avatar_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Avatar generation failed: {avatar_response.text}")

        video_filename = f"{session_id}_avatar.mp4"
        video_path = os.path.join("generated_videos", video_filename)
        with open(video_path, "wb") as f:
            f.write(avatar_response.content)

        # Save caption text alongside video (for standalone captioning)
        text_path = os.path.join("generated_videos", f"{session_id}_avatar_text.txt")
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(caption_text)
        print(f"[PIPELINE] Caption text saved: {text_path}")

        # ── STEP 5: Add Captions (using known text — zero typos) ──
        # caption_text = original English OR translated Hindi/Marathi/etc.
        # No Whisper, no re-translation — just burn the exact text we already have
        print(f"[PIPELINE] Step 5: Adding captions ({len(caption_text.split())} words)...")
        captioned_filename = f"{session_id}_avatar_captioned.mp4"
        captioned_path = os.path.join("generated_videos", captioned_filename)
        try:
            caption_response = requests.post(
                f"{CAPTION_URL}/add-captions",
                json={
                    "video_path": os.path.abspath(video_path),
                    "translated_ssml": caption_text,
                    "output_path": os.path.abspath(captioned_path),
                    "target_language": target_language,
                    "font_size": 16,
                },
                timeout=120
            )
            if caption_response.status_code == 200:
                video_filename = captioned_filename
                print(f"[PIPELINE] Captions added ✅")
            else:
                print(f"[PIPELINE] Caption service returned {caption_response.status_code}, using uncaptioned video")
        except Exception as e:
            print(f"[PIPELINE] Caption service unavailable ({e}), using uncaptioned video")

        video_url = f"http://localhost:8000/videos/{video_filename}"
        print(f"[PIPELINE] Done! {video_url}")

        return JSONResponse({
            "success":         True,
            "video_url":       video_url,
            "detected_tone":   detected_tone,
            "original_text":   original_text,
            "translated_text": translated_text,
            "caption_text":    caption_text,
            "ssml":            ssml,
            "session_id":      session_id
        })


    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for f in [photo_path, audio_path]:
            if os.path.exists(f):
                os.remove(f)


# ── DOCUMENT TO TEXT ENDPOINT ──
@app.post("/document-to-text")
async def document_to_text(
    file:       UploadFile = File(default=None),
    email_text: str        = Form(default=None),
):
    """
    Extract text from PDF/DOCX/TXT or email and summarize into key points.

    Input:
      - file       : PDF, DOCX or TXT file (optional)
      - email_text : pasted email text (optional)

    Output:
      {
        "success": true,
        "key_points": ["point1", "point2", ...],
        "spoken_text": "Full text for avatar to speak",
        "bullet_summary": "• point1\n• point2",
        "paragraph_summary": "...",
        "key_topic": "Main topic",
        "suggested_tone": "formal",
        "word_count": 150
      }
    """
    from document_processor import process_document

    session_id = uuid.uuid4().hex
    file_path  = None

    try:
        if file and file.filename:
            file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")
            with open(file_path, "wb") as f:
                f.write(await file.read())
            print(f"[DOC-ENDPOINT] File saved: {file_path}")

        if not file_path and not email_text:
            raise HTTPException(status_code=400, detail="Please upload a file or paste email text")

        result = process_document(
            file_path=file_path,
            email_text=email_text,
        )

        return JSONResponse({
            "success":           True,
            "key_points":        result.get("key_points", []),
            "spoken_text":       result["spoken_text"],
            "bullet_summary":    result["bullet_summary"],
            "paragraph_summary": result["paragraph_summary"],
            "key_topic":         result["key_topic"],
            "suggested_tone":    result["suggested_tone"],
            "word_count":        result["word_count"],
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[DOC-ENDPOINT] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)


# Run with: uvicorn pipeline:app --reload --port 8000