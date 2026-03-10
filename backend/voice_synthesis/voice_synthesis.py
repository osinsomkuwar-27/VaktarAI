from cartesia import Cartesia
from dotenv import load_dotenv
import os

load_dotenv()
client = Cartesia(api_key=os.getenv("CARTESIA_API_KEY"))

async def generate_audio(text: str) -> str:
    response = client.tts.generate(
        model_id="sonic-3",
        transcript=text,
        voice={
            "mode": "id",
            "id": "f4e58e74-19e8-41ae-b602-0f5fd37a41c3",
        },
        output_format={
            "container": "wav",
            "sample_rate": 44100,
            "encoding": "pcm_f32le",
        },
    )

    audio_path = "output_audio.wav"
    with open(audio_path, "wb") as f:
        f.write(response.read())

    return audio_path
