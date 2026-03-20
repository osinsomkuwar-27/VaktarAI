from moviepy.editor import VideoFileClip, CompositeVideoClip, ImageClip
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import whisper
import re

def extract_plain_text(ssml_text):
    plain_text = re.sub(r'<[^>]+>', '', ssml_text).strip()
    return plain_text

def get_timed_segments(video_path):
    print("Loading Whisper model...")
    model = whisper.load_model("small")

    print("Detecting language...")
    audio = whisper.load_audio(video_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)

    detected_lang = max(probs, key=probs.get)

    if probs.get("hi", 0) > 0.10:
        detected_lang = "hi"

    print(f"Using language: {detected_lang}")

    print("Transcribing audio to get timestamps...")
    result = model.transcribe(video_path, language=detected_lang, task="transcribe")

    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip()
        })
        print(f"{seg['start']:.1f}s -> {seg['end']:.1f}s : {seg['text']}")
    return segments


def make_caption_image(text, video_width):
    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\Nirmala.ttc", 16)
    except:
        font = ImageFont.load_default()

    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = current_line + " " + word if current_line else word
        dummy_img = Image.new('RGBA', (1, 1))
        dummy_draw = ImageDraw.Draw(dummy_img)
        bbox = dummy_draw.textbbox((0, 0), test_line, font=font)
        line_width = bbox[2] - bbox[0]

        if line_width < video_width - 80:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    line_height = 22
    img_height = line_height * len(lines) + 10
    img = Image.new('RGBA', (video_width, img_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (video_width - text_width) // 2
        y = i * line_height + 5
        draw.text((x + 1, y + 1), line, font=font, fill=(0, 0, 0, 180))
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))

    return np.array(img)

def add_captions_to_video(video_path: str, translated_ssml: str = None, output_path: str = None):
    if output_path is None:
        output_path = video_path.replace('.mp4', '_captioned.mp4')

    print(f"Loading video: {video_path}")
    video = VideoFileClip(video_path)

    segments = get_timed_segments(video_path)

    caption_clips = []

    for seg in segments:
        text = seg["text"]
        start = seg["start"]
        end = seg["end"]
        duration = end - start

        if not text.strip():
            continue

        # Split text into chunks that fit in 2 lines
        words = text.split()
        chunks = []
        current_chunk = ""

        try:
            font = ImageFont.truetype(r"C:\Windows\Fonts\Nirmala.ttc", 16)
        except:
            font = ImageFont.load_default()

        for word in words:
            test = current_chunk + " " + word if current_chunk else word
            dummy_img = Image.new('RGBA', (1, 1))
            dummy_draw = ImageDraw.Draw(dummy_img)
            bbox = dummy_draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] < video.w - 80:
                current_chunk = test
            else:
                chunks.append(current_chunk)
                current_chunk = word

        if current_chunk:
            chunks.append(current_chunk)

        # Show each chunk for equal time
        chunk_duration = duration / len(chunks) if chunks else duration

        for j, chunk in enumerate(chunks):
            chunk_start = start + j * chunk_duration
            caption_array = make_caption_image(chunk, video.w)
            clip = (ImageClip(caption_array)
                    .set_start(chunk_start)
                    .set_duration(chunk_duration)
                    .set_position(('center', 'bottom')))
            caption_clips.append(clip)

    all_clips = [video] + caption_clips
    final_video = CompositeVideoClip(all_clips, size=video.size)
    final_video = final_video.set_audio(video.audio)

    print(f"Saving captioned video to: {output_path}")
    final_video.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        fps=video.fps
    )

    video.close()
    final_video.close()

    print("Timed captions added successfully!")
    return output_path
