### MODIFIED FILE ###
# app/routers/ports.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db
from ..models import NetworkPort
from ..schemas import PortSchema

router = APIRouter()

@router.get("/", response_model=List[PortSchema])
async def get_scanned_ports(db: Session = Depends(get_db)):
    """
    Retrieve a list of open ports found by the network scanner.
    """
    ports = db.query(NetworkPort).order_by(NetworkPort.host_ip, NetworkPort.port_number).all()
    return ports
