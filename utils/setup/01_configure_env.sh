#!/bin/bash
set -e
source ./scripts/utils.sh

> .env
echo "--- Stage 1: Configuring System Environment ---"

INTERFACE=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)
[ -z "$INTERFACE" ] && { echo "ERROR: No network interface found."; exit 1; }
update_env_var "IFACE" "$INTERFACE"

CIDR=$(ip -o -f inet addr show "$INTERFACE" | awk '/scope global/ {print $4}' | head -1)
[ -z "$CIDR" ] && { echo "ERROR: No CIDR found."; exit 1; }
update_env_var "SCAN_TARGET_CIDR" "$CIDR"
