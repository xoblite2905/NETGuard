# app/services/zeek_parser.py
import logging
import json
import time
import os

from ..state import app_state

logger = logging.getLogger(__name__)

# The default path for Zeek's current logs, in JSON format
ZEEK_CONN_LOG_FILE = "/opt/zeek/logs/current/conn.log"

def process_zeek_log_entry(line: str):
    """
    Parses a single JSON line from conn.log and adds it to the in-memory state.
    """
    try:
        # Load the JSON line into a Python dictionary
        log_data = json.loads(line)
        
        # Acquire the lock to safely add to our shared deque
        with app_state.zeek_lock:
            app_state.zeek_conn_logs.append(log_data)
            
        logger.debug(f"Zeek connection logged: {log_data.get('id.orig_h')} -> {log_data.get('id.resp_h')}")

    except Exception as e:
        logger.error(f"Failed to process Zeek log entry: '{line[:100]}...'. Error: {e}")

def start_log_monitoring():
    """
    Tails the Zeek conn.log file and processes new lines as they are written.
    This runs in a background thread.
    """
    logger.info("Zeek log monitoring service starting.")
    logger.info(f"Watching for connection logs in {ZEEK_CONN_LOG_FILE}")
    
    time.sleep(10) # Give Zeek time to start up and create the log file
    
    try:
        # Jump to the end of the file so we only process new logs
        with open(ZEEK_CONN_LOG_FILE, 'r') as f:
            f.seek(0, os.SEEK_END)
            last_pos = f.tell()
    except FileNotFoundError:
        last_pos = 0
        logger.warning(f"Zeek log file not found at startup: {ZEEK_CONN_LOG_FILE}. Will keep trying.")

    while True:
        try:
            with open(ZEEK_CONN_LOG_FILE, 'r') as f:
                # Handle log rotation
                current_size = os.fstat(f.fileno()).st_size
                if current_size < last_pos:
                    last_pos = 0
                
                f.seek(last_pos)
                for line in f:
                    if line.strip():
                        process_zeek_log_entry(line.strip())
                last_pos = f.tell()
        except FileNotFoundError:
            last_pos = 0
            time.sleep(5) # Wait longer if the file is missing
            continue
        except Exception as e:
            logger.error(f"Error in Zeek log monitoring loop: {e}. Retrying...")

        time.sleep(2) # Check for new lines every 2 seconds
