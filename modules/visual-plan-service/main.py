"""
Visual Plan Service — FastAPI microservice.

POST /generate   — render GIF + MP4 from structured plan, upload to R2
GET  /health     — liveness check
"""

import os
import tempfile
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import renderer
import r2_uploader

load_dotenv()

app = FastAPI(title="visual-plan-service")


class Step(BaseModel):
    label: str
    sublabel: str = ""
    milestone: bool = False
    durationDays: int | None = None


class GenerateRequest(BaseModel):
    planId: str = Field(..., description="UUID from backend — used as R2 key")
    userId: str
    title: str
    steps: list[Step]
    totalDays: int = 0


class GenerateResponse(BaseModel):
    gifUrl: str
    mp4Url: str
    r2KeyGif: str
    r2KeyMp4: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if not req.steps:
        raise HTTPException(status_code=400, detail="steps must not be empty")
    if len(req.steps) > 12:
        raise HTTPException(status_code=400, detail="max 12 steps supported")

    plan = {
        "title": req.title,
        "totalDays": req.totalDays,
        "steps": [s.model_dump() for s in req.steps],
    }

    with tempfile.TemporaryDirectory() as out_dir:
        try:
            paths = renderer.render(plan, out_dir)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"render failed: {e}")

        gif_key = f"visual-plans/{req.userId}/{req.planId}.gif"
        mp4_key = f"visual-plans/{req.userId}/{req.planId}.mp4"

        try:
            gif_url = r2_uploader.upload(paths["gif"], gif_key, "image/gif")
            mp4_url = r2_uploader.upload(paths["mp4"], mp4_key, "video/mp4")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"R2 upload failed: {e}")

    return GenerateResponse(
        gifUrl=gif_url,
        mp4Url=mp4_url,
        r2KeyGif=gif_key,
        r2KeyMp4=mp4_key,
    )
