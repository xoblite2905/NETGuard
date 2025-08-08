# backend/app/routers/alerts.py
from fastapi import APIRouter
from app.services import alert_service

router = APIRouter()

@router.get("/api/alerts")
def read_alerts():
    alerts = alert_service.get_latest_alerts()
    return {"alerts": alerts}

# Don't forget to include this router in your main.py!