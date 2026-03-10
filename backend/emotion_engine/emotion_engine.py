from groq import Groq
import json
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are an AI speech coach for a multilingual avatar platform used by government leaders, educators, and organizations.

Your job is to analyze a plain-text message and rewrite it using SSML (Speech Synthesis Markup Language) for ElevenLabs TTS.

Steps you must follow:
1. Detect the emotional tone. Choose exactly ONE from: urgent, calm, inspiring, formal, empathetic
2. Rewrite the message with appropriate SSML tags based on the tone:
   - urgent: <prosody rate="fast" pitch="+2st">, <emphasis level="strong"> on key words, <break time="0.3s"/> after critical points
   - calm: <prosody rate="slow" pitch="-1st">, <break time="0.7s"/> between sentences
   - inspiring: <prosody rate="medium" pitch="+3st">, <emphasis level="strong"> on powerful words
   - formal: <prosody rate="medium" pitch="0st">, minimal emphasis, clean delivery
   - empathetic: <prosody rate="slow" pitch="-1st" volume="soft">, <emphasis level="moderate"> on emotional words

SSML rules:
- Always wrap everything inside <speak> ... </speak>
- Never add emphasis to more than 3 words per message
- Never change the meaning or content of the original message
- Keep all original sentences, just wrap them in SSML tags

Return ONLY valid JSON in this exact format, no explanation, no markdown:
{"detected_tone": "urgent", "ssml": "<speak>...</speak>"}"""


def enhance_text(plain_text: str, tone_override: Optional[str] = None) -> dict:
    user_message = plain_text
    if tone_override:
        user_message = f"Use tone: {tone_override}\n\nMessage: {plain_text}"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    raw = response.choices[0].message.content

    if raw is None:
        raise ValueError("Model returned empty response")

    raw = raw.strip()

    # Strip markdown code fences
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            if part.startswith("json"):
                raw = part[4:].strip()
                break
            elif "{" in part:
                raw = part.strip()
                break

    # Extract JSON by braces
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in response: {raw}")

    raw = raw[start:end]

    # Fix common LLM JSON mistakes
    import re
    # Fix unescaped quotes inside SSML attribute values
    raw = re.sub(r'(?<=: ")(.+?)(?="[,\}])', lambda m: m.group(0).replace('"', '\\"').replace('\\\\"', '\\"'), raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: manually extract tone and ssml
        tone_match = re.search(r'"detected_tone"\s*:\s*"(\w+)"', raw)
        ssml_match = re.search(r'"ssml"\s*:\s*"(.+)"', raw, re.DOTALL)
        if tone_match and ssml_match:
            result = {
                "detected_tone": tone_match.group(1),
                "ssml": ssml_match.group(1).replace('\\"', '"')
            }
        else:
            raise ValueError(f"Could not parse response: {raw}")

    return result

# Quick test
if __name__ == "__main__":
    out = enhance_text("Citizens, we must act now on the water crisis.")
    print(f"Tone:  {out['detected_tone']}")
    print(f"SSML:  {out['ssml']}")