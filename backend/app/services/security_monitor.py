# backend/app/services/security_monitor.py
import logging
import time
import schedule
from app.database import SessionLocal
from app.models import Host
from . import gvm_scanner

logger = logging.getLogger(__name__)

def schedule_nightly_gvm_audit():
    """Triggers a GVM scan for all 'up' hosts that haven't been scanned recently."""
    logger.info("[Scheduler] Kicking off nightly GVM audit job...")
    with SessionLocal() as db:
        # This is a placeholder for more advanced logic to avoid re-scans.
        # For now, it will re-scan all currently 'up' hosts.
        hosts_to_scan = db.query(Host).filter(Host.status == 'up').all()
        logger.info(f"[Scheduler] Found {len(hosts_to_scan)} hosts to enqueue for GVM scanning.")
        for host in hosts_to_scan:
            gvm_scanner.start_gvm_scan_on_host(db, host.ip_address)
            time.sleep(5) # Stagger GVM API requests
    logger.info("[Scheduler] All hosts have been enqueued for tonight's audit.")

def schedule_gvm_report_check():
    """Periodically checks for and processes completed GVM scan reports."""
    logger.debug("[Scheduler] Checking for completed GVM scan reports...")
    with SessionLocal() as db:
        gvm_scanner.check_and_process_completed_scans(db)

def start_security_monitor():
    """
    Starts the background thread for security scheduling and monitoring.
    This replaces the old placeholder function.
    """
    logger.info("✅ Security monitor and scheduler service starting...")
    
    # --- Define the schedule ---
    # Check for finished reports every 15 minutes.
    schedule.every(15).minutes.do(schedule_gvm_report_check)
    # Run a full audit of all hosts every night at 2:00 AM.
    schedule.every().day.at("02:00").do(schedule_nightly_gvm_audit)
    
    logger.info("🗓️  Schedule configured. Nightly GVM audit at 02:00. Report checks every 15 mins.")

    # --- Run the scheduler loop ---
    # The first report check will be after an initial delay
    time.sleep(60) 
    while True:
        try:
            schedule.run_pending()
            time.sleep(30) # Check the schedule every 30 seconds
        except Exception as e:
            logger.error(f"Fatal error in scheduler loop: {e}", exc_info=True)
            time.sleep(60) # Wait a minute before retrying on fatal error