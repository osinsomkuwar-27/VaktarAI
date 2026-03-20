from moviepy.editor import ColorClip
from captions import add_captions_to_video

# PUT YOUR VIDEO NAME HERE
video_path = "myvideo.mp4"  # change this to your actual video filename

ssml = '<speak><prosody rate="slow">मुझे दुख है।</prosody></speak>'

result = add_captions_to_video(video_path, ssml)
print(f"Done! Saved at: {result}")

