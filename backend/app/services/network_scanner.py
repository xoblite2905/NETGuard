# backend/app/services/network_scanner.py

import logging
import time
import threading
import nmap
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..database import SessionLocal
from app.state import app_state

# ### --- THIS IS PART OF THE FIX --- ###
# We import the scanner modules we will now orchestrate
from . import vulnerability_scanner
from .nuclei_scanner import NucleiScanner
# ### --- END OF FIX --- ###

logger = logging.getLogger(__name__)

def check_admin():
    try: return os.geteuid() == 0
    except AttributeError: return False

def scan_and_update_hosts(db: Session):
    from app.models import Host, NetworkPort

    if not check_admin():
        logger.warning("Host scan requires root/admin privileges. Skipping.")
        return

    cidr = os.environ.get("SCAN_TARGET_CIDR")
    if not cidr:
        logger.error("FATAL: SCAN_TARGET_CIDR environment variable is not set. Cannot perform network scan.")
        return

    logger.info(f"🔍 [Nmap] Starting Stage 1: Comprehensive host and port discovery on CIDR: {cidr}")
    nm = nmap.PortScanner()
    try:
        nm.scan(hosts=cidr, arguments='-sS -O --osscan-guess -T4 -Pn')
    except nmap.nmap.PortScannerError as e:
        logger.error(f"Nmap scan failed. Are you running with sudo? Error: {e}")
        return

    online_hosts = nm.all_hosts()
    logger.info(f"Found {len(online_hosts)} online hosts. Beginning modern scan funnel...")

    # ### --- THIS IS PART OF THE FIX --- ###
    # Instantiate the Nuclei scanner once per run, as it manages its own DB connections.
    nuclei_scanner_instance = NucleiScanner(db=db)
    # ### --- END OF FIX --- ###

    for host_ip in online_hosts:
        try:
            # (Host processing and port updating logic remains the same)
            db_host = db.query(Host).filter(Host.ip_address == host_ip).first()
            hostname = nm[host_ip].hostname() or 'N/A'
            mac_address = nm[host_ip]['addresses'].get('mac')
            vendor = next(iter(nm[host_ip].get('vendor', {}).values()), None)
            os_name = "Unknown"
            if 'osmatch' in nm[host_ip] and nm[host_ip]['osmatch']:
                os_name = nm[host_ip]['osmatch'][0]['name']

            if not db_host:
                db_host = Host(ip_address=host_ip)
                db.add(db_host)

            db_host.mac_address = mac_address
            db_host.hostname = hostname
            db_host.vendor = vendor
            db_host.os_name = os_name
            db_host.status = 'up'
            db_host.last_seen = datetime.now(timezone.utc)
            db.commit()

            has_open_ports = False
            if 'tcp' in nm[host_ip]:
                for port, port_info in nm[host_ip]['tcp'].items():
                    if port_info['state'] == 'open':
                        has_open_ports = True
                        existing_port = db.query(NetworkPort).filter_by(host_ip=host_ip, port_number=port, protocol='tcp').first()
                        if not existing_port:
                            new_port = NetworkPort(port_number=port, protocol='tcp', service_name=port_info.get('name', 'unknown'), timestamp=datetime.now(timezone.utc), host_ip=host_ip, host=db_host)
                            db.add(new_port)
            db.commit()


            # ### --- THIS IS THE NEW SCAN FUNNEL LOGIC --- ###

            if not has_open_ports:
                logger.info(f"Host {host_ip} has no open ports. Skipping vulnerability scans.")
                continue

            # Stage 2: Fast Triage with Nuclei
            logger.info(f"🔬 [Nuclei] Starting Stage 2: Fast vulnerability triage for {host_ip}")
            nuclei_findings = nuclei_scanner_instance.run_scan(target=host_ip)

            # Stage 3: Analyze and Escalate
            # Check if any of the findings from Nuclei are high or critical.
            should_escalate_to_openvas = any(
                finding.get('severity') in ['high', 'critical']
                for finding in nuclei_findings
            )

            if should_escalate_to_openvas:
                # Stage 4 (Conditional): Escalate to OpenVAS for a deep-dive analysis
                logger.warning(f"🚨 [OpenVAS] Condition MET for {host_ip}. Escalating to Stage 3: DEEP vulnerability scan. This may take a long time.")
                vulnerability_scanner.run_vulnerability_scan_on_host(db, host_ip)
            else:
                # If no high/critical findings, we save resources and stop.
                logger.info(f"✅ [OpenVAS] Condition NOT met for {host_ip}. No high/critical findings from Nuclei. Skipping deep scan.")

            # ### --- END OF NEW SCAN FUNNEL LOGIC --- ###

        except Exception as e:
            logger.error(f"Failed to process host {host_ip}. Error: {e}", exc_info=True)
            db.rollback()

    app_state.active_host_ips = online_hosts
    logger.info("✅ Full network scan funnel complete. Database and state updated.")


def start_background_scanner():
    logger.info("Initializing background scanner threads...")
    def run_host_scanner_loop():
        time.sleep(10)
        while True:
            with SessionLocal() as db:
                scan_and_update_hosts(db)
            time.sleep(300) # Scan every 5 minutes
    threading.Thread(target=run_host_scanner_loop, daemon=True).start()
    logger.info("✅ Host scanner thread started.")

def get_active_hosts_from_state():
    return getattr(app_state, 'active_host_ips', [])