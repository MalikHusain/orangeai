"""
database/models.py — SQLAlchemy ORM models
"""

from sqlalchemy import Column, String, Float, DateTime, Integer, Text
from sqlalchemy.sql import func
import uuid
from database.db import Base


class Detection(Base):
    __tablename__ = "detections"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id    = Column(String, index=True, nullable=True)

    # Result
    disease_id    = Column(String, nullable=False)
    disease_name  = Column(String, nullable=False)
    confidence    = Column(Float,  nullable=False)
    severity      = Column(String, nullable=False)

    # Settings
    mode          = Column(String, default="full")
    plant_part    = Column(String, default="leaf")
    language      = Column(String, default="en")

    # Geo
    latitude      = Column(Float,  nullable=True)
    longitude     = Column(Float,  nullable=True)
    district      = Column(String, nullable=True)
    state         = Column(String, default="Maharashtra")

    # Meta
    top3_json     = Column(Text, nullable=True)   # JSON string of top-3 predictions
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id":           self.id,
            "disease_id":   self.disease_id,
            "disease_name": self.disease_name,
            "confidence":   self.confidence,
            "severity":     self.severity,
            "mode":         self.mode,
            "plant_part":   self.plant_part,
            "language":     self.language,
            "latitude":     self.latitude,
            "longitude":    self.longitude,
            "district":     self.district,
            "created_at":   self.created_at.isoformat() if self.created_at else None,
        }


class GeoReport(Base):
    __tablename__ = "geo_reports"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    district   = Column(String, nullable=False, index=True)
    latitude   = Column(Float,  nullable=False)
    longitude  = Column(Float,  nullable=False)
    disease    = Column(String, nullable=False)
    severity   = Column(String, nullable=False)
    report_count = Column(Integer, default=1)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())