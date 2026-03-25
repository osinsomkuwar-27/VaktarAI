"""
pipeline/pipeline.py — Shreeja's master orchestration server
Runs on port 8000. Osin's frontend calls POST /generate-video.

Full flow:
  Text → Deepfake/Content Flagging (Gemini AI)
       → Translation (Bhargavi :8002)
       → Emotion/SSML (Soham :8001)
       → Voice (Kshitij :8003)
       → Avatar Video (Tanishka :8004)
       → Captions (captions :8006)
       → Video URL returned to frontend

Q&A flow:
  Question → Deepfake/Content Flagging (Gemini AI)
           → ai_brain :8005 (Gemini/Ollama)
           → answer text
           → Translation → Emotion → Voice → Avatar → Captions
           → Video URL + answer returned to frontend
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import requests
import os
import json
import uuid
import sys
from dotenv import load_dotenv

load_dotenv("/workspaces/VaktarAI/.env")

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
AI_BRAIN_URL    = os.getenv("AI_BRAIN_URL",    "http://localhost:8005")
CAPTION_URL     = os.getenv("CAPTION_URL",     "http://localhost:8006")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY")

UPLOAD_DIR = "uploads"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY")

MODERATION_PROMPT = """You are a strict content moderation system for an AI avatar video platform.
Analyze the user text and determine if it should be BLOCKED.
BLOCK if the text contains: violence, threats, hate speech, adult/sexual content, deepfake misuse, misinformation, self-harm, illegal activities.
ALLOW normal conversation, education, business, neutral creative writing.
Respond ONLY with valid JSON, no explanation, no markdown:
{"flagged": false, "category": null, "message": null}
If flagged=true, set category to one of: violence, hate_speech, adult, deepfake_misuse, misinformation, self_harm, illegal
Set message to a short user-friendly warning like: ⚠ Your text contains violent content and cannot be processed."""


def _flag_with_gemini(text: str) -> dict:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": MODERATION_PROMPT + f"\n\nUser text:\n{text}"}]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 100}
    }
    response = requests.post(url, json=payload, timeout=10)
    response.raise_for_status()
    content = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def _flag_with_groq(text: str) -> dict:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "temperature": 0,
        "max_tokens": 100,
        "messages": [
            {"role": "system", "content": MODERATION_PROMPT},
            {"role": "user",   "content": f"User text:\n{text}"}
        ]
    }
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"].strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def flag_content(text: str) -> dict:
    if not text.strip():
        return {"flagged": True, "category": "empty", "message": "⚠ Please enter some text before generating.", "keyword": None}
    try:
        print("[FLAGGING] Checking with Gemini...")
        result = _flag_with_gemini(text)
        result["keyword"] = None
        if result.get("flagged"):
            print(f"[FLAGGING] ⚠ Blocked — category: {result.get('category')}")
        else:
            print("[FLAGGING] ✅ Content is safe")
        return result
    except Exception as e:
        print(f"[FLAGGING] Gemini failed ({e}), trying Groq...")
    try:
        result = _flag_with_groq(text)
        result["keyword"] = None
        if result.get("flagged"):
            print(f"[FLAGGING] ⚠ Blocked — category: {result.get('category')}")
        else:
            print("[FLAGGING] ✅ Content is safe")
        return result
    except Exception as e:
        print(f"[FLAGGING] Groq also failed ({e}), failing open")
    return {"flagged": False, "category": None, "message": None, "keyword": None}



# ── AI-Powered Content Flagging ───────────────────────────────────────────────
# Uses Gemini as primary, falls back to Groq if Gemini fails.
# No hardcoded keywords — the LLM understands intent, slang, rephrasing.

MODERATION_PROMPT = """You are a strict content moderation system for an AI avatar video platform.

Analyze the user's text and determine if it should be BLOCKED.

BLOCK if the text contains or implies:
- Violence, threats, harm to people or animals
- Hate speech, racism, discrimination of any group
- Adult or sexual content
- Attempts to create deepfakes to deceive or impersonate someone
- Misinformation, propaganda, or deliberate deception
- Self-harm or suicide
- Illegal activities

ALLOW if the text is:
- Normal conversation, education, business, storytelling
- Mentions of sensitive topics in a clearly informational or neutral context
- Creative writing that is not harmful

Respond ONLY with a valid JSON object — no explanation, no markdown, no extra text:
{"flagged": false, "category": null, "message": null}

If flagged=true, set category to one of: violence, hate_speech, adult, deepfake_misuse, misinformation, self_harm, illegal
And set message to a short, user-friendly warning like: "⚠ Your text contains violent content and cannot be processed."
"""


# ── Caption helper ─────────────────────────────────────────────────────────────

def add_captions_via_service(video_path: str, caption_text: str, target_language: str, session_id: str) -> str:
    """
    Calls captions service on :8006 to burn captions onto video.
    Returns captioned video filename, or original if captioning fails.
    """
    captioned_filename = f"{session_id}_avatar_captioned.mp4"
    captioned_path     = os.path.join("generated_videos", captioned_filename)

    text_path = os.path.join("generated_videos", f"{session_id}_avatar_text.txt")
    try:
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(caption_text)
    except Exception:
        pass

    try:
        caption_response = requests.post(
            f"{CAPTION_URL}/add-captions",
            json={
                "video_path":      os.path.abspath(video_path),
                "translated_ssml": caption_text,
                "output_path":     os.path.abspath(captioned_path),
                "target_language": target_language,
                "font_size":       16,
            },
            timeout=120
        )
        if caption_response.status_code == 200:
            print(f"[PIPELINE] Captions added ✅")
            return captioned_filename
        else:
            print(f"[PIPELINE] Caption service returned {caption_response.status_code}, using uncaptioned video")
            return os.path.basename(video_path)

    except Exception as e:
        print(f"[PIPELINE] Caption service unavailable ({e}), using uncaptioned video")
        return os.path.basename(video_path)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "Pipeline running", "port": 8000}


# ── /generate-video ────────────────────────────────────────────────────────────

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

        original_text = text.strip()
        print(f"\n[PIPELINE] Session: {session_id}")
        print(f"[PIPELINE] Original text: {original_text} | Lang: {target_language}")

        # ── CONTENT FLAGGING ───────────────────────────────────────────────
        print("[PIPELINE] Flagging: Checking content...")
        flag = flag_content(original_text)
        if flag["flagged"]:
            print(f"[PIPELINE] ⚠ Content blocked: {flag['category']}")
            raise HTTPException(
                status_code=400,
                detail={
                    "flagged":  True,
                    "category": flag["category"],
                    "message":  flag["message"],
                }
            )
        print("[PIPELINE] Flagging: ✅ Content is safe")

        # ── STEP 1: Translate ──────────────────────────────────────────────
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

        caption_text = original_text if target_language in ("en", "auto", None, "") else translated_text

        # ── STEP 2: Emotion + SSML ─────────────────────────────────────────
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

        # ── STEP 3: Voice Audio ────────────────────────────────────────────
        print("[PIPELINE] Step 3: Generating voice audio...")
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

        # ── STEP 4: Avatar Video ───────────────────────────────────────────
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
        video_path     = os.path.join("generated_videos", video_filename)
        with open(video_path, "wb") as f:
            f.write(avatar_response.content)
        print(f"[PIPELINE] Avatar video saved")

        # ── STEP 5: Captions ───────────────────────────────────────────────
        print(f"[PIPELINE] Step 5: Adding captions via :8006...")
        video_filename = add_captions_via_service(
            video_path=video_path,
            caption_text=caption_text,
            target_language=target_language,
            session_id=session_id
        )

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


# ── /document-to-text ──────────────────────────────────────────────────────────

@app.post("/document-to-text")
async def document_to_text(
    file:       UploadFile = File(default=None),
    email_text: str        = Form(default=None),
):
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


# ── /ask-and-generate ──────────────────────────────────────────────────────────

@app.post("/ask-and-generate")
async def ask_and_generate(
    question:        str        = Form(...),
    target_language: str        = Form(default="en"),
    speaker:         str        = Form(default="shreeja"),
    photo:           UploadFile = File(...)
):
    session_id = uuid.uuid4().hex
    photo_path = os.path.join(UPLOAD_DIR, f"{session_id}_photo.png")
    audio_path = os.path.join(UPLOAD_DIR, f"{session_id}_audio.wav")

    try:
        with open(photo_path, "wb") as f:
            f.write(await photo.read())

        print(f"\n[PIPELINE] /ask-and-generate session: {session_id}")
        print(f"[PIPELINE] Question: {question}")

        # ── CONTENT FLAGGING ───────────────────────────────────────────────
        print("[PIPELINE] Flagging: Checking question...")
        flag = flag_content(question)
        if flag["flagged"]:
            print(f"[PIPELINE] ⚠ Question blocked: {flag['category']}")
            raise HTTPException(
                status_code=400,
                detail={
                    "flagged":  True,
                    "category": flag["category"],
                    "message":  flag["message"],
                }
            )
        print("[PIPELINE] Flagging: ✅ Question is safe")

        # ── STEP 0: ai_brain ──────────────────────────────────────────────
        print("[PIPELINE] Step 0: Getting answer from ai_brain :8005...")
        brain_response = requests.post(
            f"{AI_BRAIN_URL}/ask",
            json={"question": question},
            timeout=30
        )
        if brain_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ai_brain failed: {brain_response.text}")

        brain_data = brain_response.json()
        answer     = brain_data.get("answer", "")
        llm_source = brain_data.get("source", "unknown")
        print(f"[PIPELINE] Answer from {llm_source}: {answer[:80]}...")

        # ── STEP 1: Translate ──────────────────────────────────────────────
        if target_language in ("en", "auto", None, ""):
            translated_text = answer
        else:
            try:
                trans_response = requests.post(
                    f"{TRANSLATION_URL}/translate",
                    json={"text": answer, "target_language": target_language},
                    timeout=30
                )
                translated_text = trans_response.json().get("translated_text", answer)
            except Exception as e:
                print(f"[PIPELINE] Translation failed, using original: {e}")
                translated_text = answer
        print(f"[PIPELINE] Translated: {translated_text}")

        caption_text = answer if target_language in ("en", "auto", None, "") else translated_text

        # ── STEP 2: Emotion + SSML ─────────────────────────────────────────
        print("[PIPELINE] Step 2: Detecting emotion...")
        emotion_response = requests.post(
            f"{EMOTION_URL}/enhance-text",
            json={"text": translated_text, "tone_override": None},
            timeout=30
        )
        if emotion_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Emotion engine failed: {emotion_response.text}")

        detected_tone = emotion_response.json().get("detected_tone", "formal")
        ssml          = emotion_response.json().get("ssml", translated_text)
        print(f"[PIPELINE] Tone: {detected_tone}")

        # ── STEP 3: Voice ──────────────────────────────────────────────────
        print("[PIPELINE] Step 3: Generating voice...")
        voice_response = requests.post(
            f"{VOICE_URL}/synthesize",
            json={"ssml": ssml, "speaker": speaker},
            timeout=60
        )
        if voice_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {voice_response.text}")

        with open(audio_path, "wb") as f:
            f.write(voice_response.content)

        # ── STEP 4: Avatar Video ───────────────────────────────────────────
        print("[PIPELINE] Step 4: Generating avatar video (2-3 min)...")
        with open(photo_path, "rb") as p, open(audio_path, "rb") as a:
            avatar_response = requests.post(
                f"{AVATAR_URL}/generate-avatar",
                files={
                    "photo": ("photo.png", p, "image/png"),
                    "audio": ("audio.wav", a, "audio/wav"),
                },
                timeout=300
            )
        if avatar_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Avatar generation failed: {avatar_response.text}")

        video_filename = f"{session_id}_avatar.mp4"
        video_path     = os.path.join("generated_videos", video_filename)
        with open(video_path, "wb") as f:
            f.write(avatar_response.content)

        # ── STEP 5: Captions ───────────────────────────────────────────────
        print(f"[PIPELINE] Step 5: Adding captions via :8006...")
        video_filename = add_captions_via_service(
            video_path=video_path,
            caption_text=caption_text,
            target_language=target_language,
            session_id=session_id
        )

        video_url = f"http://localhost:8000/videos/{video_filename}"
        print(f"[PIPELINE] Done! {video_url}")

        return JSONResponse({
            "success":         True,
            "video_url":       video_url,
            "answer":          answer,
            "llm_source":      llm_source,
            "detected_tone":   detected_tone,
            "translated_text": translated_text,
            "caption_text":    caption_text,
            "session_id":      session_id,
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for f in [photo_path, audio_path]:
            if os.path.exists(f):
                os.remove(f)


# Run with: uvicorn pipeline:app --reload --port 8000