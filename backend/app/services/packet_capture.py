# backend/app/services/packet_capture.py
import logging
import multiprocessing
import queue
import json
import asyncio
import os
import time
from datetime import datetime, timezone
from elasticsearch import Elasticsearch, ConnectionError as ESConnectionError

from scapy.all import sniff, Scapy_Exception, Packet as ScapyPacket, Ether
from scapy.layers.inet import IP, TCP, UDP, ICMP

from app.routers.connection_manager import manager
from app.state import app_state
from app.config import settings

logger = logging.getLogger(__name__)

def json_sniffer_process(packet_queue: multiprocessing.Queue, pipe_path: str, stop_event: multiprocessing.Event):
    """
    This function runs in a separate process. It reads newline-delimited JSON objects
    from a named pipe (produced by tshark -T ek) and puts them into a queue.
    """
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - [json_sniffer_process] - %(levelname)s - %(message)s')
    proc_logger = logging.getLogger(__name__)
    proc_logger.info(f"JSON sniffer process started. Monitoring pipe: '{pipe_path}'.")

    while not stop_event.is_set():
        try:
            proc_logger.info(f"Opening pipe '{pipe_path}'. Waiting for data stream...")
            with open(pipe_path, 'r') as f:
                for line in f:
                    if stop_event.is_set():
                        break

                    try:
                        ek_doc = json.loads(line)
                        layers = ek_doc.get("layers")
                        if not layers:
                            continue

                        # Extract the timestamp directly from the tshark -T ek output
                        timestamp_str = ek_doc.get("timestamp")
                        
                        packet_data = {
                            # Convert tshark timestamp (string with ms) to ISO 8601 format without ms for consistency
                            "@timestamp": datetime.fromtimestamp(float(timestamp_str)/1000, tz=timezone.utc).isoformat(),
                            "source_ip": layers.get("ip", {}).get("ip_ip_src"),
                            "destination_ip": layers.get("ip", {}).get("ip_ip_dst"),
                            "length": int(layers.get("frame", {}).get("frame_frame_len", 0)),
                            "ttl": int(layers.get("ip", {}).get("ip_ip_ttl", 0)),
                            "protocol": "UNKNOWN",
                            "source_mac": layers.get("eth", {}).get("eth_eth_src"),
                            "destination_mac": layers.get("eth", {}).get("eth_eth_dst"),
                            "source_port": None, "destination_port": None,
                            "flags": None, "info": ""
                        }

                        if "tcp" in layers:
                            packet_data["protocol"] = "TCP"
                            packet_data["source_port"] = int(layers["tcp"].get("tcp_tcp_srcport", 0))
                            packet_data["destination_port"] = int(layers["tcp"].get("tcp_tcp_dstport", 0))
                        elif "udp" in layers:
                            packet_data["protocol"] = "UDP"
                            packet_data["source_port"] = int(layers["udp"].get("udp_udp_srcport", 0))
                            packet_data["destination_port"] = int(layers["udp"].get("udp_udp_dstport", 0))
                        elif "icmp" in layers:
                             packet_data["protocol"] = "ICMP"

                        if packet_data["source_ip"] and packet_data["destination_ip"]:
                            packet_queue.put(packet_data)

                    except (json.JSONDecodeError, KeyError, AttributeError):
                        continue 

            proc_logger.warning("Stream ended. Will attempt to reopen in 2 seconds.")
            time.sleep(2) 

        except Exception as e:
            proc_logger.error(f"An unexpected error occurred in the JSON sniffer loop: {e}", exc_info=True)
            proc_logger.info("Restarting sniffer loop after a 5 second delay...")
            time.sleep(5)

    proc_logger.info("Sniffer process received stop signal and is shutting down.")


def data_handler_thread(packet_queue: multiprocessing.Queue, stop_event: multiprocessing.Event):
    """
    Handles data from the sniffer.
    - Path 1: Feeds data into Elasticsearch for deep analysis.
    - Path 2: Broadcasts data to the live UI via WebSockets.
    """
    logger.info("Elasticsearch Writer & Broadcaster thread started.")

    es_client = None
    try:
        es_client = Elasticsearch(settings.ELASTICSEARCH_URI, retry_on_timeout=True, max_retries=10)
        logger.info(f"Elasticsearch client connected to {settings.ELASTICSEARCH_URI}")
        
        # --- THIS IS THE FIX ---
        # Define the correct mapping for our index and create it if it doesn't exist.
        index_name = "netguard-packets"
        index_mapping = {
            "mappings": {
                "properties": {
                    "@timestamp":       { "type": "date" },
                    "source_ip":        { "type": "ip" },
                    "destination_ip":   { "type": "ip" },
                    "length":           { "type": "long" },
                    "ttl":              { "type": "integer" },
                    "protocol":         { "type": "keyword" },
                    "source_mac":       { "type": "keyword" },
                    "destination_mac":  { "type": "keyword" },
                    "source_port":      { "type": "integer" },
                    "destination_port": { "type": "integer" }
                }
            }
        }
        
        if not es_client.indices.exists(index=index_name):
            try:
                es_client.indices.create(index=index_name, body=index_mapping)
                logger.info(f"Successfully created Elasticsearch index '{index_name}' with custom mapping.")
            except Exception as e_map:
                logger.error(f"Failed to create Elasticsearch index mapping: {e_map}")
        # --- END OF FIX ---
                
    except ESConnectionError as e:
        logger.critical(f"FATAL: Could not connect to Elasticsearch on startup. Scapy data will not be saved. Error: {e}")

    while not stop_event.is_set():
        try:
            packet_data = packet_queue.get(timeout=1.0)

            # Broadcast to frontend
            broadcast_message = {"type": "packet_data", "data": packet_data}
            json_string_message = json.dumps(broadcast_message, default=str)
            main_loop = app_state.main_event_loop
            if main_loop and main_loop.is_running():
                asyncio.run_coroutine_threadsafe(manager.broadcast(json_string_message), main_loop)

            # Send to Elasticsearch
            if es_client:
                es_doc = packet_data.copy()
                del es_doc['info']
                try:
                    es_client.index(index="netguard-packets", document=es_doc)
                except ESConnectionError as e:
                    logger.error(f"Failed to send packet to Elasticsearch: {e}")

        except queue.Empty:
            continue
        except Exception as e:
            logger.error(f"Error in Elasticsearch data handler thread: {e}", exc_info=True)

    if es_client:
        es_client.close()
    logger.info("Elasticsearch data handler thread shutting down.")