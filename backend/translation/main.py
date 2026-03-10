from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from translation import translate_with_emotion, get_supported_languages

app = FastAPI(title="Bhargavi's Translation Module")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# Request schema — what the pipeline sends
class TranslateRequest(BaseModel):
    text: str
    target_language: str = "hi"


# Response schema
class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    language_name: str


@app.get("/health")
def health():
    return {"status": "Translation running", "port": 8002}


@app.get("/languages")
def languages():
    return {"supported_languages": get_supported_languages()}


@app.post("/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest):
    supported = get_supported_languages()

    if req.target_language not in supported:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language '{req.target_language}'. Use: {list(supported.keys())}"
        )

    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        translated = translate_with_emotion(req.text, req.target_language)
        return TranslateResponse(
            original_text=req.text,
            translated_text=translated,
            target_language=req.target_language,
            language_name=supported[req.target_language]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --reload --port 8002