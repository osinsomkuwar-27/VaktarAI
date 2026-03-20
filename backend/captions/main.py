from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from captions import add_captions_to_video

app = FastAPI(title=" Caption Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class CaptionRequest(BaseModel):
    video_path: str
    translated_ssml: str
    output_path: str = None

@app.get("/health")
def health():
    return {"status": "Caption service running", "port": 8005}

@app.post("/add-captions")
def add_captions(req: CaptionRequest):
    if not req.video_path:
        raise HTTPException(status_code=400, detail="video_path cannot be empty")
    if not req.translated_ssml:
        raise HTTPException(status_code=400, detail="translated_ssml cannot be empty")
    try:
        output = add_captions_to_video(
            req.video_path,
            req.translated_ssml,
            req.output_path
        )
        return {"status": "success", "output_video_path": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))