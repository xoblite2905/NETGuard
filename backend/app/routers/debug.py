from fastapi import APIRouter
from app.services import network_scanner

router = APIRouter()

@router.get("/scan_ports_manual")
def scan_ports_manual():
    network_scanner.scan_network_ports()
    return {"status": "Scan triggered"}
