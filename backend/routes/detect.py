"""
routes/detect.py — POST /api/detect
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import json, uuid
from typing import Optional

from database.db import get_db
from database.models import Detection
from ml.model import run_inference

router = APIRouter(tags=["Detection"])

MAX_SIZE = 10 * 1024 * 1024   # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/detect")
async def detect_disease(
    image:      UploadFile = File(...),
    mode:       str        = Form("full"),
    lang:       str        = Form("en"),
    part:       str        = Form("leaf"),
    lat:        Optional[float] = Form(None),
    lng:        Optional[float] = Form(None),
    session_id: Optional[str]  = Form(None),
    db: AsyncSession = Depends(get_db),
):
    # ── Validate ──────────────────────────────────────────────
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {image.content_type}")

    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(413, "Image too large. Max 10 MB.")

    # ── Run model ─────────────────────────────────────────────
    result = run_inference(image_bytes)

    # ── Persist to DB ─────────────────────────────────────────
    detection = Detection(
        id           = str(uuid.uuid4()),
        session_id   = session_id or "anonymous",
        disease_id   = result["primary"]["id"],
        disease_name = result["primary"]["name"],
        confidence   = result["primary"]["confidence"],
        severity     = result["primary"]["severity"],
        mode         = mode,
        plant_part   = part,
        language     = lang,
        latitude     = lat,
        longitude    = lng,
        top3_json    = json.dumps(result["top3"]),
    )
    db.add(detection)
    await db.flush()

    return {
        "status": "success",
        "result": {
            "id":            detection.id,
            "primary":       result["primary"],
            "top3":          result["top3"],
            "probabilities": result["probabilities"],
            "confidence":    result["primary"]["confidence"],
            "timestamp":     detection.created_at.isoformat() if detection.created_at else None,
            "settings": {
                "mode": mode,
                "lang": lang,
                "part": part,
            },
        },
    }