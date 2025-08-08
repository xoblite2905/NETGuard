import logging
import asyncio
import multiprocessing
import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import (
    auth, debug, hosts, ports, security, threat_intel,
    zeek, packets, alerts, live_cockpit, investigation
)
from app.services import network_scanner, security_monitor, packet_capture
from app.database import create_db_and_tables
from app.config import settings
from app.state import app_state
from elasticsearch import Elasticsearch

# --- Configure Logging ---
logging.basicConfig(level="INFO", format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger("elastic_transport").setLevel(logging.WARNING)
logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)


# --- Define Application Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("========================================")
    logger.info("  CybReon Application Starting Up...   ")
    logger.info("========================================")

    # 1. CREATE DATABASE TABLES
    create_db_and_tables()

    # 2. WAIT FOR ELASTICSEARCH
    es_client = Elasticsearch(settings.ELASTICSEARCH_URI)
    while True:
        try:
            if es_client.ping():
                logger.info("✅ Elasticsearch is connected and healthy.")
                break
        except Exception:
            pass
        logger.warning("🟡 Elasticsearch not ready, waiting 5 seconds...")
        await asyncio.sleep(5)
    es_client.close()

    app_state.main_event_loop = asyncio.get_running_loop()

    # 3. START BACKGROUND SERVICES
    logger.info("Starting background services...")

    threading.Thread(target=security_monitor.start_security_monitor, daemon=True).start()
    threading.Thread(target=network_scanner.start_background_scanner, daemon=True).start()

    # --- Packet Capture from Named Pipe ---
    try:
        pipe_path_in_container = "/stream/scapy.pcap"
        logger.info(f"✅ Scapy analysis service will read from shared stream: '{pipe_path_in_container}'")

        packet_queue = multiprocessing.Queue()
        stop_event = multiprocessing.Event()
        app.state.packet_capture_stop_event = stop_event

        sniffer_process = multiprocessing.Process(
            target=packet_capture.json_sniffer_process,
            args=(packet_queue, pipe_path_in_container, stop_event),
            daemon=True
        )
        handler_thread = threading.Thread(
            target=packet_capture.data_handler_thread,
            args=(packet_queue, stop_event),
            daemon=True
        )

        sniffer_process.start()
        handler_thread.start()
        logger.info("✅ Scapy analysis service started successfully.")
    except Exception as e:
        logger.error(f"❌ FATAL: Failed to start Scapy analysis service: {e}", exc_info=True)

    logger.info("✅ Application startup sequence complete. CybReon is running.")
    yield

    # --- Shutdown logic ---
    logger.info("--- Shutting Down ---")
    if hasattr(app.state, 'packet_capture_stop_event'):
        app.state.packet_capture_stop_event.set()
    logger.info("✅ Shutdown complete.")


# --- Create and Configure the App ---
app = FastAPI(title="CybReon", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# --- Register API Routers ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(hosts.router, prefix="/api/hosts", tags=["Hosts"])
app.include_router(ports.router, prefix="/api/ports", tags=["Ports"])
app.include_router(packets.router, prefix="/api/packets", tags=["Packets"])
app.include_router(security.router, prefix="/api/security", tags=["Security"])
app.include_router(debug.router, prefix="/api/debug", tags=["Debug"])
app.include_router(threat_intel.router, prefix="/api/threat-intel", tags=["Threat Intelligence"])
app.include_router(zeek.router, prefix="/api/zeek", tags=["Zeek"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(live_cockpit.router, prefix="/api/cockpit", tags=["Live Cockpit"])
app.include_router(investigation.router, prefix="/api/investigation", tags=["Investigation"])


# --- Serve the React Frontend (Must be last) ---
class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except Exception:
            return await super().get_response("index.html", scope)

app.mount("/", SPAStaticFiles(directory="/app/build", html=True), name="spa")
