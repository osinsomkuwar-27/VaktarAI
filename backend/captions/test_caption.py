from moviepy.editor import ColorClip
from captions import add_captions_to_video
import os

test_video_path = "test_video.mp4"
output_path = "test_video_captioned.mp4"

print("Creating a test video...")
clip = ColorClip(size=(640, 480), color=[0, 0, 255], duration=5)
clip.write_videofile(test_video_path, fps=24, codec='libx264', audio=False)
clip.close()
print("Test video created!")

test_ssml = '<speak><prosody rate="slow" pitch="low">मुझे अभी सच में बहुत निराशा महसूस हो रही है।</prosody></speak>'

result = add_captions_to_video(test_video_path, test_ssml, output_path)
print(f"Captioned video saved at: {result}")

os.remove(test_video_path)
print("All done!")


