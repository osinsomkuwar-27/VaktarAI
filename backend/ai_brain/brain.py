"""
ai_brain/brain.py
-----------------
All LLM logic lives here.

  WiFi up      →  Groq  (free, fast, no region restrictions)
  WiFi down    →  Ollama local (fully offline)
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
MAX_ANSWER_WORDS = int(os.getenv("MAX_ANSWER_WORDS", "40"))


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

    # Cut at word limit
    trimmed = " ".join(words[:MAX_ANSWER_WORDS])

    # Try to end at a clean sentence boundary (. ! ?)
    for punct in [".", "!", "?"]:
        last = trimmed.rfind(punct)
        if last != -1:
            return trimmed[:last + 1]

    # No sentence boundary found — just add ellipsis
    return trimmed + "..."


# ── Groq (online) ─────────────────────────────────────────────────────────────

async def ask_groq(question: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set in .env")

    # Tell the model to keep answers concise for avatar delivery
    system_prompt = (
        f"You are a helpful assistant. "
        f"Keep your answer under {MAX_ANSWER_WORDS} words. "
        f"Be clear and concise — your response will be spoken aloud by an avatar."
    )

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
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": question},
                ],
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


# ── Ollama (offline) ──────────────────────────────────────────────────────────

async def ask_ollama(question: str) -> str:
    prompt = (
        f"Answer in under {MAX_ANSWER_WORDS} words. "
        f"Be clear and concise — your response will be spoken aloud by an avatar.\n\n"
        f"{question}"
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
        3. Both fail   → raise RuntimeError
    """
    online  = await has_internet()
    primary = "groq" if online else "ollama"

    try:
        answer = await ask_groq(question) if online else await ask_ollama(question)
        answer = trim_answer(answer)    # enforce word limit as hard cap
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