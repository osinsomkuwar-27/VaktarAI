"""
caption_engine/caption.py
--------------------------
Burns captions directly onto a video using the exact translated text.

No Whisper. No transcription. No Hinglish mess.
Captions are always in the same language the avatar speaks.

Supports:
  - English, Hindi, and any language (uses NotoSans font for Unicode)
  - Automatic font detection based on OS
  - Text wrapping so long sentences fit on screen
  - Safe ffmpeg escaping so special characters don't break anything

Called by pipeline.py after SadTalker generates the video.
"""

import os
import platform
import subprocess
import textwrap


# ── Font detection ────────────────────────────────────────────────────────────

def get_font(text: str) -> str:
    """
    Returns the right font path based on OS and whether the text
    contains non-Latin characters (Hindi, Arabic, etc.)

    - Latin text  → Arial (works everywhere)
    - Non-Latin   → NotoSans (Linux/Mac) or Mangal (Windows)
    """
    needs_unicode = any(ord(c) > 127 for c in text)

    if not needs_unicode:
        return "Arial"

    system = platform.system()

    if system == "Windows":
        # Mangal ships with Windows and supports Devanagari (Hindi)
        return "Mangal"
    elif system == "Darwin":
        return "/System/Library/Fonts/Supplemental/NotoSans-Regular.ttf"
    else:
        # Linux / Codespaces
        # Install with: sudo apt-get install -y fonts-noto
        noto_paths = [
            "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansSC-Regular.otf",
        ]
        for path in noto_paths:
            if os.path.exists(path):
                return path

        # Fallback — may not render Hindi but won't crash
        print("[captions] WARNING: NotoSans not found. Run: sudo apt-get install -y fonts-noto")
        return "Arial"


# ── Text helpers ──────────────────────────────────────────────────────────────

def wrap_text(text: str, width: int = 40) -> str:
    """
    Wraps long text into multiple lines so it fits on screen.
    Uses \\n which ffmpeg drawtext understands as a line break.
    """
    lines = textwrap.wrap(text, width=width)
    return "\\n".join(lines)


def escape_ffmpeg_text(text: str) -> str:
    """
    Escapes characters that break ffmpeg's drawtext filter.
    Order matters — backslash must be escaped first.
    """
    text = text.replace("\\", "\\\\")    # backslash
    text = text.replace("'",  "\u2019")  # apostrophe → curly quote
    text = text.replace(":",  "\\:")     # colon
    text = text.replace("%",  "\\%")     # percent
    text = text.replace("\n", "\\n")     # newline
    return text


# ── Main function ─────────────────────────────────────────────────────────────

def add_captions(video_path: str, text: str, output_path: str = None) -> str:
    """
    Burns caption text directly onto the video using ffmpeg drawtext.

    Args:
        video_path  : path to input .mp4 from SadTalker
        text        : the translated text the avatar is speaking
                      (pass translated_text from pipeline, not the original English)
        output_path : where to save captioned video
                      (default: adds _captioned suffix next to input)

    Returns:
        path to the captioned video, or original video path if captioning fails
    """
    if not output_path:
        base, ext = os.path.splitext(video_path)
        output_path = f"{base}_captioned{ext}"

    # Wrap and escape the text
    wrapped = wrap_text(text, width=40)
    escaped = escape_ffmpeg_text(wrapped)

    # Pick the right font
    font = get_font(text)
    print(f"[captions] Using font: {font}")

    # Build ffmpeg drawtext filter
    # - text centered horizontally
    # - positioned near the bottom with padding
    # - white text with black border for readability on any background
    drawtext = (
        f"drawtext="
        f"text='{escaped}':"
        f"font='{font}':"
        f"fontsize=24:"
        f"fontcolor=white:"
        f"borderw=2:"
        f"bordercolor=black:"
        f"x=(w-text_w)/2:"
        f"y=h-text_h-50:"
        f"line_spacing=8"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", drawtext,
        "-codec:a", "copy",    # keep original audio completely untouched
        output_path
    ]

    print(f"[captions] Burning captions onto video...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"[captions] ffmpeg error:\n{result.stderr[-400:]}")
        # Don't break the pipeline — return original video
        print("[captions] Returning original video without captions")
        return video_path

    print(f"[captions] Done → {output_path}")
    return output_path