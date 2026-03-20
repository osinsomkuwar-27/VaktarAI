from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import re

def extract_plain_text(ssml_text):
    plain_text = re.sub(r'<[^>]+>', '', ssml_text).strip()
    return plain_text

def make_caption_image(text, video_width):
    # Create a TRANSPARENT background — not black/blue
    img = Image.new('RGBA', (video_width, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype(r"C:\Windows\Fonts\Nirmala.ttc", 36)
        print("Using Nirmala font for Hindi")
    except Exception as e:
        print(f"Font error: {e}")
        font = ImageFont.load_default()

    # Draw dark shadow behind text so it's readable on any video
    draw.text((11, 11), text, font=font, fill=(0, 0, 0, 180))
    # Draw white text on top
    draw.text((10, 10), text, font=font, fill=(255, 255, 255, 255))

    return np.array(img)

def add_captions_to_video(video_path: str, translated_ssml: str, output_path: str = None):
    if output_path is None:
        output_path = video_path.replace('.mp4', '_captioned.mp4')

    # Extract plain text from SSML
    caption_text = extract_plain_text(translated_ssml)
    print(f"Caption text: {caption_text}")

    # Load the original video
    print(f"Loading video from: {video_path}")
    video = VideoFileClip(video_path)

    # Create transparent caption image
    caption_array = make_caption_image(caption_text, video.w)

    # Turn into moviepy clip
    caption_clip = (ImageClip(caption_array)
                   .set_duration(video.duration)
                   .set_position(('center', 'bottom')))

    # Overlay caption ON TOP of original video
    final_video = CompositeVideoClip(
    [video, caption_clip],
    size=video.size
    )
    final_video = final_video.set_audio(video.audio)


    # Save with audio preserved
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