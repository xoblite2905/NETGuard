#!/bin/sh
set -e
ZEEK_CONN_LOG="/var/log/zeek/conn.log"
echo "Filebeat Entrypoint: Waiting for Zeek log file at ${ZEEK_CONN_LOG}..."
COUNTER=0
while [ ! -f "${ZEEK_CONN_LOG}" ] && [ ${COUNTER} -lt 120 ]; do
  sleep 2; COUNTER=$((COUNTER + 2));
done
if [ ! -f "${ZEEK_CONN_LOG}" ]; then
  echo "FATAL: Zeek log file not found after 120 seconds. Exiting."
  exit 1
fi
echo "Filebeat Entrypoint: Zeek log file found. Starting Filebeat."
exec filebeat -e -strict.perms=false
