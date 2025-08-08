# backend/app/routers/live_cockpit.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

# Import your actual models and schemas
from app import models
from app import schemas
from app.database import SessionLocal

router = APIRouter(
    prefix="/api/v1/cockpit",
    tags=["Live Cockpit"],
)

# Standard dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/hosts", response_model=List[schemas.HostSchema])
def get_discovered_hosts(db: Session = Depends(get_db)):
    """
    Get the list of active hosts discovered on the network.
    This endpoint is designed for the main dashboard view. It performs an
    efficient query to get hosts and their related open ports and vulnerabilities.
    
    The underlying 'hosts' table should be populated by your network_scanner.py service.
    """
    try:
        # joinedload is the professional way to prevent the "N+1 query problem".
        # It fetches the hosts and their related ports/vulnerabilities in one go.
        hosts = (
            db.query(models.Host)
            .options(
                joinedload(models.Host.ports), 
                joinedload(models.Host.vulnerabilities)
            )
            .filter(models.Host.status == 'online') # Example: only show online hosts
            .order_by(models.Host.last_seen.desc())
            .all()
        )
        return hosts
    except Exception as e:
        # This catches errors if the database query fails for some reason
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.get("/alerts", response_model=List[schemas.SecurityAlertSchema])
def get_recent_security_alerts(limit: int = 100, db: Session = Depends(get_db)):
    """
    Get the latest high-priority security alerts.
    
    The 'security_alerts' table should be populated by your security_monitor.py service.
    """
    try:
        alerts = (
            db.query(models.SecurityAlert)
            .order_by(models.SecurityAlert.timestamp.desc())
            .limit(limit)
            .all()
        )
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")