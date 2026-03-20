from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import re

def extract_plain_text(ssml_text):
    plain_text = re.sub(r'<[^>]+>', '', ssml_text).strip()
    return plain_text

def make_caption_image(text, video_width, video_height):
    img = Image.new('RGBA', (video_width, 120), (0, 0, 0, 150))
    draw = ImageDraw.Draw(img)

    try:
        # Nirmala.ttc supports Hindi/Devanagari
        font = ImageFont.truetype(r"C:\Windows\Fonts\Nirmala.ttc", 36)
        print("Using Nirmala font for Hindi")
    except Exception as e:
        print(f"Font error: {e}")
        font = ImageFont.load_default()

    # Draw black shadow for readability
    draw.text((11, 11), text, font=font, fill=(0, 0, 0, 255))
    # Draw white text on top
    draw.text((10, 10), text, font=font, fill=(255, 255, 255, 255))

    return np.array(img)

def add_captions_to_video(video_path: str, translated_ssml: str, output_path: str = None):
    if output_path is None:
        output_path = video_path.replace('.mp4', '_captioned.mp4')

    # Extract plain text from SSML
    caption_text = extract_plain_text(translated_ssml)
    print(f"Caption text: {caption_text}")

    # Load video
    print(f"Loading video from: {video_path}")
    video = VideoFileClip(video_path)

    # Create caption image using Pillow
    caption_array = make_caption_image(caption_text, video.w, video.h)

    # Turn it into a moviepy clip
    caption_clip = ImageClip(caption_array)
    caption_clip = caption_clip.set_duration(video.duration)
    caption_clip = caption_clip.set_position(('center', 'bottom'))

    # Overlay on video
    final_video = CompositeVideoClip([video, caption_clip])

    # Save
    print(f"Saving captioned video to: {output_path}")
    final_video.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        fps=video.fps
    )

    video.close()
    final_video.close()

    print("Captions added successfully!")
    return output_path
