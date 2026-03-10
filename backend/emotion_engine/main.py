from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from emotion_engine import enhance_text

app = FastAPI(title="Soham's Emotion Engine")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# Request schema — what the pipeline sends
class TextRequest(BaseModel):
    text: str
    tone_override: Optional[str] = None  # "urgent", "calm", etc. or null


# Response schema — what we send back
class TextResponse(BaseModel):
    detected_tone: str
    ssml: str


@app.get("/health")
def health():
    return {"status": "Emotion engine running", "port": 8001}


@app.post("/enhance-text", response_model=TextResponse)
async def enhance(req: TextRequest):
    try:
        # FIX: was passing "neutral" which confused the LLM — now passes None
        result = enhance_text(req.text, req.tone_override or None)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --reload --port 8001