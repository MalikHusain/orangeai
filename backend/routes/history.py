"""
routes/history.py — GET /api/history, DELETE /api/history/:id
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database.db import get_db
from database.models import Detection

router = APIRouter(tags=["History"])


@router.get("/history")
async def get_history(
    session_id: str = "anonymous",
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Detection)
        .where(Detection.session_id == session_id)
        .order_by(Detection.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return {"history": [r.to_dict() for r in rows]}


@router.delete("/history/{detection_id}")
async def delete_detection(
    detection_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Detection).where(Detection.id == detection_id)
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(404, "Detection not found")
    await db.delete(row)
    return {"status": "deleted", "id": detection_id}


@router.delete("/history")
async def clear_history(
    session_id: str = "anonymous",
    db: AsyncSession = Depends(get_db),
):
    stmt = delete(Detection).where(Detection.session_id == session_id)
    await db.execute(stmt)
    return {"status": "cleared"}