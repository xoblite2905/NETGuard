# backend/app/services/gvm_scanner.py
import os
import logging
import threading
from gvm.connections import TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
from gvm.errors import GvmError
from sqlalchemy.orm import Session
from app import models
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

# --- GVM Connection Details (from environment variables) ---
GVM_HOST = os.environ.get('GVM_HOST', '127.0.0.1')
GVM_PORT = int(os.environ.get('GVM_PORT', 9392))
GVM_USER = os.environ.get('GVM_USER') # You must set this
GVM_PASSWORD = os.environ.get('GVM_PASSWORD') # You must set this

# --- GVM Scanner & Config UUIDs (Standard definitions) ---
OPENVAS_SCANNER_UUID = "08b69003-5fc2-4037-a479-93b440211c73"
FULL_AND_FAST_CONFIG_UUID = "daba56c8-73ec-11df-a475-002264764cea"

def _get_gmp_connection():
    if not all([GVM_USER, GVM_PASSWORD]):
        logger.error("GVM_USER and GVM_PASSWORD environment variables are not set. GVM scanning is disabled.")
        return None
    try:
        connection = TLSConnection(hostname=GVM_HOST, port=GVM_PORT, timeout=120)
        return Gmp(connection=connection, transform=EtreeTransform())
    except GvmError as e:
        logger.error(f"Failed to establish GVM connection: {e}")
        return None

def start_gvm_scan_on_host(db: Session, host_ip: str):
    logger.info(f"[GVM] Preparing to launch deep scan for {host_ip}")
    gmp = _get_gmp_connection()
    if not gmp:
        return
    
    with gmp:
        try:
            gmp.authenticate(username=GVM_USER, password=GVM_PASSWORD)
            
            # 1. Create target
            target_name = f"Host {host_ip} - {datetime.now(timezone.utc).isoformat()}"
            target_xml = gmp.create_target(name=target_name, hosts=[host_ip])
            target_id = target_xml.xpath('//target/@id')[0]
            
            # 2. Create and start task
            task_name = f"Scan {host_ip}"
            task_xml = gmp.create_task(
                name=task_name,
                config_id=FULL_AND_FAST_CONFIG_UUID,
                target_id=target_id,
                scanner_id=OPENVAS_SCANNER_UUID
            )
            task_id = task_xml.xpath('//task/@id')[0]
            gmp.start_task(task_id=task_id)

            # 3. Save task to DB for tracking
            scan_task = models.GvmScanTask(
                task_id=task_id,
                host_ip=host_ip,
                status='Requested'
            )
            db.add(scan_task)
            db.commit()
            logger.info(f"[GVM] ✅ Successfully launched scan for {host_ip} with Task ID: {task_id}")

        except GvmError as e:
            logger.error(f"[GVM] Failed to create or start scan task for {host_ip}. Error: {e}", exc_info=True)
            db.rollback()

def _parse_and_save_report(db: Session, report_xml_str: str, host_ip: str):
    root = ET.fromstring(report_xml_str)
    
    for result in root.findall('.//results/result'):
        host = result.find('host').text.strip()
        port = result.find('port').text
        nvt = result.find('nvt')
        severity = float(result.find('severity').text)
        
        if severity == 0.0: continue # Skip logs/infos

        # Save raw finding to detailed OpenvasVulnerability table
        nvt_oid = nvt.get('oid')
        existing_vuln = db.query(models.OpenvasVulnerability).filter_by(nvt_oid=nvt_oid, host=host).first()
        if not existing_vuln:
            raw_finding = models.OpenvasVulnerability(
                host=host, port=port, nvt_oid=nvt_oid,
                nvt_name=nvt.find('name').text,
                threat_level=result.find('threat').text,
                severity_score=severity,
                description=nvt.find('description').text or "No description available.",
                solution=nvt.find('solution').text or "No solution provided."
            )
            db.add(raw_finding)

        # Save to the unified Vulnerability table for the UI
        existing_unified = db.query(models.Vulnerability).filter_by(cve=nvt.find('.//cve').text, host_ip=host_ip).first() if nvt.find('.//cve') is not None else None
        if not existing_unified:
             unified_finding = models.Vulnerability(
                host_ip=host, port=int(port.split('/')[0]) if port != 'general' else 0,
                service=port.split('/')[1] if port != 'general' else 'system',
                cve=nvt.find('.//cve').text if nvt.find('.//cve') is not None else 'N/A',
                severity=result.find('threat').text,
                description=f"{nvt.find('name').text}: {nvt.find('description').text or ''}"[:1000],
                source='GVM'
            )
             db.add(unified_finding)

    db.commit()
    logger.info(f"[GVM] ✅ Parsed and saved report for {host_ip}")

def check_and_process_completed_scans(db: Session):
    logger.info("[GVM] Checking for completed scans...")
    tasks_to_check = db.query(models.GvmScanTask).filter(models.GvmScanTask.status.in_(['Requested', 'Running'])).all()
    if not tasks_to_check: return
    
    gmp = _get_gmp_connection()
    if not gmp: return

    with gmp:
        gmp.authenticate(username=GVM_USER, password=GVM_PASSWORD)
        for task in tasks_to_check:
            try:
                task_details = gmp.get_task(task.task_id)
                status = task_details.xpath('//status/text()')[0]
                task.status = status
                
                if status == 'Done':
                    report_id = task_details.xpath('//report/@id')[0]
                    task.report_id = report_id
                    logger.info(f"[GVM] Scan {task.task_id} for host {task.host_ip} is 'Done'. Fetching report {report_id}...")
                    
                    # Get report in XML format
                    report = gmp.get_report(report_id, filter_string="apply_overrides=1")
                    report_xml = ET.tostring(report, encoding='unicode')

                    _parse_and_save_report(db, report_xml, task.host_ip)

                db.commit()
            except GvmError as e:
                logger.error(f"[GVM] Error checking task {task.task_id}: {e}")
                task.status = 'Error'
                db.commit()
            except Exception as e:
                logger.error(f"A general error occurred processing task {task.task_id}: {e}", exc_info=True)
                db.rollback()