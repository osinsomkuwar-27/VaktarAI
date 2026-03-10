# ============================================================
#  COLAB_API.py
#  Copy-paste ALL of this into a single Colab cell and run it.
#  It starts SadTalker as a public API using Flask + ngrok.
#
#  Steps:
#  1. Open your working SadTalker Colab notebook
#  2. Add a new cell at the bottom
#  3. Paste everything below into it
#  4. Run it — copy the printed URL and put in .env
# ============================================================

# Install Flask, ngrok and all SadTalker dependencies
import subprocess
import sys

def pip_install(*packages):
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", *packages],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[PIP ERROR]\n{result.stderr}")
    else:
        print(f"[PIP OK] {', '.join(packages)}")

pip_install("flask", "pyngrok")
pip_install(
    "yacs",           # ← fixes: ModuleNotFoundError: No module named 'yacs'
    "face_alignment",
    "imageio-ffmpeg",
    "kornia",
    "safetensors",
    "ninja",
)

import subprocess as sp
import os, shutil, glob, threading, uuid, sys
from flask import Flask, request, send_file, jsonify
from pyngrok import ngrok

app = Flask(__name__)

os.chdir('/content/SadTalker')


@app.route('/health')
def health():
    return jsonify({"status": "SadTalker is running", "ready": True})


@app.route('/generate', methods=['POST'])
def generate():
    """
    Accepts: photo (image file) + audio (audio file)
    Returns: MP4 video
    """
    session = uuid.uuid4().hex

    try:
        # Clear old results
        if os.path.exists('./results'):
            shutil.rmtree('./results')
        os.makedirs('./results', exist_ok=True)

        # Save uploaded photo
        if 'photo' not in request.files:
            return jsonify({"error": "No photo uploaded"}), 400
        if 'audio' not in request.files:
            return jsonify({"error": "No audio uploaded"}), 400

        photo = request.files['photo']
        audio = request.files['audio']

        photo_path = f'./input_photo_{session}.png'
        audio_raw  = f'./input_audio_raw_{session}'

        photo.save(photo_path)
        audio.save(audio_raw)

        # Convert audio to WAV (handles mp3, ogg, wav, any format)
        audio_wav = f'./input_audio_{session}.wav'
        conv = sp.run([
            "ffmpeg", "-y", "-i", audio_raw, audio_wav
        ], capture_output=True, text=True)

        if conv.returncode != 0:
            return jsonify({"error": f"Audio conversion failed: {conv.stderr}"}), 500

        os.remove(audio_raw)

        # Run SadTalker
        print(f"[API] Running SadTalker for session {session}...")
        result = sp.run([
            sys.executable, "inference.py",   # ← sys.executable not "python"
            "--driven_audio", audio_wav,
            "--source_image", photo_path,
            "--result_dir", "./results",
            "--still",
            "--preprocess", "full",
            # "--enhancer", "gfpgan"  # ← disabled: causes ImportError if gfpgan is broken
        ], capture_output=True, text=True)

        # Clean up input files
        for f in [photo_path, audio_wav]:
            if os.path.exists(f):
                os.remove(f)

        if result.returncode != 0:
            return jsonify({"error": result.stderr[-500:]}), 500

        # Find the final video (shortest path = top-level combined video)
        mp4_files = glob.glob('./results/**/*.mp4', recursive=True)
        if not mp4_files:
            return jsonify({"error": "No video generated"}), 500

        final_video = min(mp4_files, key=lambda x: len(x))
        print(f"[API] Done! Sending: {final_video}")

        return send_file(final_video, mimetype='video/mp4')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Kill any existing process on port 5000 ──
import signal
sp.run(["fuser", "-k", "5000/tcp"], capture_output=True)

# ── Start ngrok tunnel ──
# Get free token from ngrok.com (sign up, go to dashboard, copy auth token)
NGROK_TOKEN = os.getenv("NGROK_TOKEN", "your_actual_token_here")  # ← paste your token from dashboard.ngrok.com/get-started/your-authtoken
if NGROK_TOKEN == "your_actual_token_here":
    raise ValueError("Replace NGROK_TOKEN with your real token from https://dashboard.ngrok.com/get-started/your-authtoken")

ngrok.set_auth_token(NGROK_TOKEN)
tunnel = ngrok.connect("http://localhost:5000")
public_url = tunnel.public_url  # ← extract the plain URL string

print("\n" + "="*55)
print("  SADTALKER API IS LIVE!")
print(f"  PUBLIC URL: {public_url}")
print("")
print("  Add this to your project .env file:")
print(f"  SADTALKER_URL={public_url}")
print("")
print("  Keep this tab open during the demo!")
print("="*55 + "\n")

# ── Start Flask (non-blocking) ──
threading.Thread(
    target=lambda: app.run(port=5000, use_reloader=False, debug=False)
).start()