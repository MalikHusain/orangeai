"""
routes/geo.py — Heatmap geo endpoints
routes/stats.py — Analytics
"""

# ── geo.py ────────────────────────────────────────────────────
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from database.db import get_db
from database.models import Detection, GeoReport

router = APIRouter(tags=["Geo"])

VIDARBHA_FALLBACK = [
    {"district":"Nagpur",     "lat":21.14,"lng":79.08,"reports":24,"top_disease":"Citrus Canker",   "severity":"high"},
    {"district":"Amravati",   "lat":20.93,"lng":77.75,"reports":18,"top_disease":"Melanose",         "severity":"medium"},
    {"district":"Wardha",     "lat":20.74,"lng":78.60,"reports":11,"top_disease":"Black Spot",       "severity":"medium"},
    {"district":"Yavatmal",   "lat":20.40,"lng":78.12,"reports":19,"top_disease":"HLB",              "severity":"high"},
    {"district":"Chandrapur", "lat":19.96,"lng":79.29,"reports": 7,"top_disease":"Sooty Mould",      "severity":"low"},
    {"district":"Buldhana",   "lat":20.53,"lng":76.18,"reports": 9,"top_disease":"Tristeza",         "severity":"low"},
    {"district":"Akola",      "lat":20.70,"lng":77.00,"reports":13,"top_disease":"Citrus Scab",      "severity":"medium"},
    {"district":"Washim",     "lat":20.10,"lng":77.15,"reports": 5,"top_disease":"Root Rot",         "severity":"low"},
]


@router.get("/geo-reports")
async def get_geo_reports(db: AsyncSession = Depends(get_db)):
    """Aggregate district-level disease reports for the heatmap."""
    stmt = (
        select(
            Detection.district,
            Detection.latitude,
            Detection.longitude,
            func.count(Detection.id).label("reports"),
            Detection.disease_name,
            Detection.severity,
        )
        .where(Detection.latitude.isnot(None))
        .group_by(Detection.district)
        .order_by(func.count(Detection.id).desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    if rows:
        reports = [
            {
                "district": r.district or "Unknown",
                "lat": r.latitude,
                "lng": r.longitude,
                "reports": r.reports,
                "top_disease": r.disease_name,
                "severity": r.severity,
            }
            for r in rows
        ]
    else:
        # Return Vidarbha fallback data for demo
        reports = VIDARBHA_FALLBACK

    return {"reports": reports}


@router.post("/geo-report")
async def submit_geo_report(
    district: str,
    lat: float,
    lng: float,
    disease: str,
    severity: str,
    db: AsyncSession = Depends(get_db),
):
    """Submit a manual geo-tagged report."""
    report = GeoReport(
        district=district,
        latitude=lat,
        longitude=lng,
        disease=disease,
        severity=severity,
    )
    db.add(report)
    await db.flush()
    return {"status": "submitted", "id": report.id}