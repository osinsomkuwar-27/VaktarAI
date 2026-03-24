"""
test_caption.py — Test the fast caption system

Pick a video file, and the system will:
  1. Check for a _text.txt sidecar file (pipeline saves these automatically)
  2. If no text file, you can paste the text manually
  3. Generate captions using ffmpeg SRT burn (~5-10 seconds)

No Whisper, no MoviePy — just fast ffmpeg!
"""

import os
import tkinter as tk
from tkinter import filedialog
from captions import add_captions_to_video, try_read_text_file


def main():
    root = tk.Tk()
    root.withdraw()

    print("=" * 50)
    print("  Fast Caption System — Test Tool")
    print("=" * 50)
    print()

    print("Select a video file to add captions to...")
    video_path = filedialog.askopenfilename(
        title="Select video",
        filetypes=[("MP4 files", "*.mp4"), ("All files", "*.*")]
    )

    if not video_path:
        print("No file selected!")
        return

    print(f"Selected: {video_path}")
    print()

    # Check if text file exists
    existing_text = try_read_text_file(video_path)
    if existing_text:
        print(f"✅ Found text file! Text: {existing_text[:100]}...")
        use_it = input("Use this text? [Y/n]: ").strip().lower()
        if use_it in ('', 'y', 'yes'):
            text_to_use = existing_text
        else:
            text_to_use = input("Paste caption text: ").strip()
    else:
        print("No _text.txt file found next to video.")
        text_to_use = input("Paste caption text (or press Enter to skip): ").strip()

    if not text_to_use:
        print("No text provided — cannot generate captions.")
        return

    print()
    print(f"Generating captions...")
    print(f"Text: {text_to_use[:80]}...")
    print()

    result = add_captions_to_video(
        video_path=video_path,
        translated_ssml=text_to_use,
        font_size=16,
    )
    print(f"\n✅ Done! Output: {result}")
    print(f"   File size: {os.path.getsize(result) / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()