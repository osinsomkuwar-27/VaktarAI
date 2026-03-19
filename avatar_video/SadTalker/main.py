"""
avatar_video/SadTalker/main.py — Tanishka's Avatar Generation Service
Runs on port 8004. Pipeline calls POST /generate-avatar.

Input:  photo (image file) + audio (wav file)
Output: .mp4 video (FileResponse)
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import glob
import subprocess
from datetime import datetime

app = FastAPI(title="Tanishka's Avatar Generation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories — relative to SadTalker folder
UPLOAD_DIR = "uploads"
RESULT_DIR = "results"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


def convert_audio(input_path: str) -> str:
    """
    Convert any wav to 16000Hz mono pcm_s16le.
    SadTalker strictly needs this format.
    Voice synthesis outputs 44100Hz pcm_s16le — this fixes it.
    """
    output_path = input_path.rsplit(".", 1)[0] + "_16k.wav"
    subprocess.run([
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",          # mono
        "-ar", "16000",      # 16kHz sample rate
        "-sample_fmt", "s16", # 16-bit PCM
        output_path
    ], check=True, capture_output=True)
    return output_path


def merge_audio_into_video(video_path: str, audio_path: str) -> str:
    """
    SadTalker sometimes outputs video without audio track.
    This merges the original audio back in.
    """
    output_path = video_path.replace(".mp4", "_with_audio.mp4")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_path
    ], check=True, capture_output=True)
    return output_path


@app.get("/health")
def health():
    return {"status": "Avatar generation running", "port": 8004}


@app.post("/generate-avatar")
async def generate_avatar(
    photo: UploadFile = File(...),
    audio: UploadFile = File(...)
):
    """
    Called by pipeline.py Step 4.

    Input:
      - photo : user's face image (JPG/PNG)
      - audio : synthesized speech wav from voice_synthesis.py

    Output:
      - .mp4 video of the avatar speaking (FileResponse)
    """

    session_id = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)

    try:
        # ── Step 1: Save uploaded files ──
        img_path = os.path.join(session_dir, photo.filename)
        audio_path = os.path.join(session_dir, audio.filename)

        with open(img_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        with open(audio_path, "wb") as f:
            shutil.copyfileobj(audio.file, f)

        print(f"[AVATAR] Session: {session_id}")
        print(f"[AVATAR] Image: {img_path}")
        print(f"[AVATAR] Audio: {audio_path}")

        # ── Step 2: Convert audio to SadTalker format ──
        print("[AVATAR] Converting audio to 16kHz mono...")
        fixed_audio = convert_audio(audio_path)
        print(f"[AVATAR] Converted audio: {fixed_audio}")

        # ── Step 3: Run SadTalker inference ──
        result_dir = os.path.join(RESULT_DIR, session_id)
        print(f"[AVATAR] Running SadTalker → {result_dir}")

        import sys

        subprocess.run([
            sys.executable, "inference.py",
            "--source_image", img_path,
            "--driven_audio", fixed_audio,
            "--result_dir", result_dir,
            # "--enhancer", "gfpgan"
        ], check=True)

        # ── Step 4: Find generated video ──
        videos = sorted(glob.glob(os.path.join(result_dir, "**", "*.mp4"), recursive=True))
        if not videos:
            raise HTTPException(
                status_code=500,
                detail="SadTalker ran but no video was generated"
            )

        generated_video = videos[-1]
        print(f"[AVATAR] Video generated: {generated_video}")

        # ── Step 5: Merge audio into video ──
        print("[AVATAR] Merging audio into video...")
        final_video = merge_audio_into_video(generated_video, fixed_audio)
        print(f"[AVATAR] Final video: {final_video}")

        # ── Step 6: Return video to pipeline ──
        return FileResponse(
            final_video,
            media_type="video/mp4",
            filename=f"avatar_{session_id}.mp4"
        )

    except subprocess.CalledProcessError as e:
        print(f"[AVATAR] Error: {e.stderr.decode() if e.stderr else str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"SadTalker processing failed: {e.stderr.decode() if e.stderr else str(e)}"
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"[AVATAR] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up uploaded files after processing
        if os.path.exists(session_dir):
            shutil.rmtree(session_dir, ignore_errors=True)


# Run with: uvicorn main:app --reload --port 8004