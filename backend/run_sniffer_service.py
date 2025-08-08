# backend/run_sniffer_service.py

import multiprocessing
import threading
import psutil
import logging
import os
import sys

# Add the app directory to the Python path to allow imports
# This is crucial because this script runs from the 'backend' directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app.services import packet_capture

logging.basicConfig(level="INFO", format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sniffer_service")

def main():
    """
    Finds a valid network interface and starts the Scapy packet capture process
    and the associated database writer thread. This function must be run with
    root privileges.
    """
    logger.info("🚀 Starting isolated Scapy sniffer service...")

    try:
        # Find the best non-loopback interface
        valid_interfaces = [iface for iface, addrs in psutil.net_if_addrs().items() if 'Loopback' not in iface and 'lo' not in iface and 'docker' not in iface]
        if not valid_interfaces:
            raise RuntimeError("No valid network interfaces found for sniffing.")
            
        interface_to_use = valid_interfaces[0]
        logger.info(f"Selected interface '{interface_to_use}' for packet capture.")
        
        # This setup is copied directly from your main.py but will now run as root
        packet_queue = multiprocessing.Queue()
        stop_event = multiprocessing.Event()
        
        capture_process = multiprocessing.Process(
            target=packet_capture.scapy_sniffer_process,
            args=(packet_queue, interface_to_use, stop_event),
            daemon=True,
            name="ScapySniffer"
        )
        capture_process.start()
        
        db_writer_thread = threading.Thread(
            target=packet_capture.database_writer_thread,
            args=(packet_queue, stop_event),
            daemon=True,
            name="DatabaseWriter"
        )
        db_writer_thread.start()

        logger.info(f"✅ Packet capture started in isolated process [PID: {capture_process.pid}].")
        logger.info("Sniffer service will continue running in the background.")

        # Keep the main process alive to manage the children
        capture_process.join()
        db_writer_thread.join()

    except Exception as e:
        logger.critical(f"❌ Failed to start packet capture service: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
