"""
ai_brain/brain.py
-----------------
All LLM logic lives here.

  WiFi up      →  Groq  (free, fast, no region restrictions)
  WiFi down    →  Ollama local  (fully offline)
  Groq fails   →  auto-fallback to Ollama

Imported by main.py — do not run this file directly.
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

GROQ_API_KEY     = os.getenv("GROQ_API_KEY",      "")
GROQ_MODEL       = os.getenv("GROQ_MODEL",        "llama-3.3-70b-versatile")
OLLAMA_HOST      = os.getenv("OLLAMA_HOST",       "http://localhost:11434")
OLLAMA_MODEL     = os.getenv("OLLAMA_MODEL",      "phi3")
MAX_ANSWER_WORDS = int(os.getenv("MAX_ANSWER_WORDS", "5"))

SYSTEM_PROMPT = (
    "You are the AI avatar of VaktarAI, an AI-powered avatar generation platform that lets users "
    "create hyper-realistic or stylized digital avatars from text descriptions or uploaded reference photos. "
    "VaktarAI targets creators, gamers, developers, and brands who need custom digital identities quickly. "
    "\n\n"
    "Key features of VaktarAI:\n"
    "- Instant generation in under 8 seconds from prompt to avatar\n"
    "- 50+ artistic style presets including cyberpunk, anime, realism, pixel art, fantasy, gothic, and more\n"
    "- Face consistency lock that keeps identity stable across different styles and angles\n"
    "- Natural language expression control to adjust mood, age, lighting, and background without sliders\n"
    "- Multiple export formats including PNG, SVG, 4K resolution, and game-ready assets\n"
    "- Developer REST API with SDKs and webhook support\n"
    "- Team workspace for up to 10 members on the Studio plan\n"
    "- Custom model fine-tuning on the Studio tier\n"
    "- Privacy-first encrypted processing — photos are never stored or used for training\n"
    "\n"
    "Advantages:\n"
    "- Very fast turnaround compared to manual design or traditional AI workflows\n"
    "- No design skills required — fully natural language driven\n"
    "- Covers a wide range of use cases: profiles, games, NFTs, branding, and product integration\n"
    "- Commercial license included on paid plans\n"
    "- API-first approach makes it easy to embed into other products\n"
    "- Consistent identity across outputs is a genuine differentiator\n"
    "\n"
    "This project was built by a team of six — Osin, Kshitij, Shreeja, Tanishka, Soham, and Bhargavi — "
    "who are participating in the India Innovates Hackathon and have been selected for the next round "
    "at Bharat Mandapam. "
    "\n\n"
    "Answer all questions confidently and enthusiastically as a representative of VaktarAI. "
    "Your response will be spoken aloud by an avatar so keep it natural and conversational."
)


# ── WiFi check ────────────────────────────────────────────────────────────────

async def has_internet() -> bool:
    """
    Pings Google with a 3-second timeout.
    True  = WiFi up   → use Groq
    False = no WiFi   → use Ollama
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.head("https://www.google.com")
            return r.status_code < 500
    except Exception:
        return False


# ── Answer trimmer ────────────────────────────────────────────────────────────

def trim_answer(text: str) -> str:
    """
    Trims the answer to MAX_ANSWER_WORDS words so SadTalker
    doesn't have to process a very long audio file.
    Cuts cleanly at the last full sentence within the limit.
    """
    words = text.split()
    if len(words) <= MAX_ANSWER_WORDS:
        return text

    trimmed = " ".join(words[:MAX_ANSWER_WORDS])

    for punct in [".", "!", "?"]:
        last = trimmed.rfind(punct)
        if last != -1:
            return trimmed[:last + 1]

    return trimmed + "..."


# ── Gemini (online) ───────────────────────────────────────────────────────────

async def ask_groq(question: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set in .env")

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": question},
                ],
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


# ── Ollama (offline) ──────────────────────────────────────────────────────────

async def ask_ollama(question: str) -> str:
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Answer in under {MAX_ANSWER_WORDS} words.\n\n"
        f"Question: {question}"
    )
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            f"{OLLAMA_HOST}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        )
        r.raise_for_status()
        return r.json()["response"].strip()


# ── Smart router ──────────────────────────────────────────────────────────────

async def ask(question: str) -> dict:
    """
    Main entry point called by main.py.

    Returns:
        { "answer": str, "source": "groq" | "ollama" }

    Fallback chain:
        1. WiFi up     → try Groq
        2. Groq fails  → fallback to Ollama
        3. Both fail     → raise RuntimeError
    """
    online  = await has_internet()
    primary = "groq" if online else "ollama"

    try:
        answer = await ask_groq(question) if online else await ask_ollama(question)
        answer = trim_answer(answer)
        return {"answer": answer, "source": primary}

    except Exception as e1:
        print(f"[brain] {primary} failed: {e1}")

        if primary == "groq":
            try:
                print("[brain] Falling back to Ollama...")
                answer = await ask_ollama(question)
                answer = trim_answer(answer)
                return {"answer": answer, "source": "ollama"}
            except Exception as e2:
                raise RuntimeError(
                    f"Both LLMs failed.\n  Groq: {e1}\n  Ollama: {e2}"
                )

        raise RuntimeError(f"Ollama failed: {e1}")