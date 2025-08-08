# backend/app/routers/threat_intel.py
# --- FINAL WORKING VERSION ---
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from sqlalchemy import func
from app import models, schemas
from app.dependencies import get_db
from ..schemas import ThreatIntelSummarySchema



router = APIRouter()

# The frontend calls GET /api/threat-intel/origins. This is the new, correct path.
@router.get("/origins", response_model=List[Dict[str, Any]])
def get_threat_origins(db: Session = Depends(get_db)):
    """
    Counts the number of alerts per source country.
    Note: This is a placeholder as you don't have country data in your models.
    We will simulate it by counting alerts by source IP for now.
    """
    # This query counts alerts grouped by source IP address.
    origin_counts = db.query(
        models.SecurityAlert.source_ip, 
        func.count(models.SecurityAlert.source_ip).label('count')
    ).group_by(models.SecurityAlert.source_ip).order_by(func.count(models.SecurityAlert.source_ip).desc()).limit(10).all()

    # Format the data for the chart on the frontend.
    # In a real app, you would look up the country from the IP here.
    results = [{"country": ip, "count": count} for ip, count in origin_counts]
    return results


@router.get("/summary", response_model=ThreatIntelSummarySchema)
def get_threat_summary_endpoint(db: Session = Depends(get_db)):
    """
    Returns a full summary of threat intelligence data, including country lookups.
    """
    summary = threat_intelligence.get_threat_intel_summary(db)
    return summary