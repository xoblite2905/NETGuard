# backend/app/routers/security.py
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db
from app import models, schemas

# --- Import all our scanner services ---
from app.services.nuclei_scanner import NucleiScanner
from app.services import gvm_scanner

router = APIRouter()

@router.get("/alerts", response_model=List[schemas.SecurityAlertSchema])
def get_all_security_alerts(db: Session = Depends(get_db)):
    """Retrieve all security alert records from the database."""
    alerts = db.query(models.SecurityAlert).order_by(models.SecurityAlert.timestamp.desc()).limit(100).all()
    return alerts

@router.post("/scan/nuclei/{target}")
def start_nuclei_scan(target: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Triggers a new Nuclei scan on the specified target (host or URL)."""
    scanner = NucleiScanner(db)
    background_tasks.add_task(scanner.run_scan, target)
    return {"message": "Nuclei scan initiated in the background.", "target": target}

# ### --- NEW GVM SCAN ENDPOINT --- ###
@router.post("/scan/gvm/{target_ip}")
def start_manual_gvm_scan(target_ip: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Triggers a new GVM Deep Scan on a single IP address."""
    # Run the GVM scan initiation in the background to avoid blocking the API response
    background_tasks.add_task(gvm_scanner.start_gvm_scan_on_host, db, target_ip)
    return {"message": "GVM deep scan initiated in the background.", "target": target_ip}