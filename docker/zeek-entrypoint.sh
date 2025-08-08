#!/bin/bash

# This script expects ZEEK_INTERFACE to be passed in from the environment.
# It's simple and focused on just starting Zeek.

echo "Zeek Entrypoint: Starting Zeek process."
echo "Zeek Entrypoint: Listening on network interface: $ZEEK_INTERFACE"

if [ -z "$ZEEK_INTERFACE" ]; then
    echo "FATAL: ZEEK_INTERFACE environment variable is not set."
    exit 1
fi

exec /usr/local/zeek/bin/zeek -i "$ZEEK_INTERFACE" local.zeek