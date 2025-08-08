#!/bin/bash
set -e

echo "--- Cleaning Docker Environment ---"
docker-compose --env-file .env down -v --remove-orphans || true
docker volume prune -f

echo "--- Downloading test PCAP file ---"
mkdir -p ./packet_stream
wget -O ./packet_stream/http.pcap https://gitlab.com/wireshark/wireshark/-/raw/master/test/captures/http.pcap
