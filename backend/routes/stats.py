"""
routes/stats.py — Analytics & statistics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database.db import get_db
from database.models import Detection

router = APIRouter(tags=["Stats"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_stmt    = select(func.count(Detection.id))
    disease_stmt  = (
        select(Detection.disease_name, func.count(Detection.id).label("count"))
        .group_by(Detection.disease_name)
        .order_by(func.count(Detection.id).desc())
    )
    severity_stmt = (
        select(Detection.severity, func.count(Detection.id).label("count"))
        .group_by(Detection.severity)
    )

    total_result    = await db.execute(total_stmt)
    disease_result  = await db.execute(disease_stmt)
    severity_result = await db.execute(severity_stmt)

    total    = total_result.scalar() or 0
    by_disease  = [{"disease": r.disease_name, "count": r.count} for r in disease_result.all()]
    by_severity = {r.severity: r.count for r in severity_result.all()}

    return {
        "total":       total,
        "by_disease":  by_disease,
        "by_severity": by_severity,
    }