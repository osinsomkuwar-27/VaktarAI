from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from emotion_engine import enhance_text

app = FastAPI(title="Soham's Emotion Engine")

# Request schema — what the frontend/pipeline sends
class TextRequest(BaseModel):
    text: str                        # Required: the plain message
    tone_override: Optional[str] = None  # Optional: "urgent", "calm", etc.

# Response schema — what you send back
class TextResponse(BaseModel):
    detected_tone: str
    ssml: str

@app.post("/enhance-text", response_model=TextResponse)
async def enhance(req: TextRequest):
    try:
        result = enhance_text(req.text, req.tone_override or "neutral")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health():
    return {"status": "Soham's emotion engine is live 🔥"}