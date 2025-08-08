# backend/app/routers/hosts.py

from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app import models, schemas
from collections import defaultdict

router = APIRouter()

# THIS IS THE FINAL FIX: We add a second decorator.
# Now, this same function will correctly handle requests for BOTH
# /api/hosts (without the slash) AND /api/hosts/ (with the slash).
@router.get("")
@router.get("/")
def get_discovered_hosts(db: Session = Depends(get_db)):
    """
    Returns all host records from the database.
    """
    # This code is already correct and does not need to be changed.
    db_hosts = db.query(models.Host).order_by(models.Host.last_seen.desc()).all()
    db_ports = db.query(models.NetworkPort).all()
    db_vulnerabilities = db.query(models.Vulnerability).all()

    ports_by_host = defaultdict(list)
    for port in db_ports:
        ports_by_host[port.host_ip].append(port)

    vulnerabilities_by_host = defaultdict(list)
    for vuln in db_vulnerabilities:
        vulnerabilities_by_host[vuln.host_ip].append(vuln)

    response_hosts = []
    for host in db_hosts:
        host_schema = schemas.HostSchema.from_orm(host)
        host_schema.ports = ports_by_host[host.ip_address]
        host_schema.vulnerabilities = vulnerabilities_by_host[host.ip_address]
        response_hosts.append(host_schema)

    return response_hosts