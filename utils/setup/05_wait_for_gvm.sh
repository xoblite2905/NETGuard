#!/bin/bash
set -e

echo "--- Waiting for GVM Daemon ---"
MAX_ATTEMPTS=90
ATTEMPTS=0

while true; do
  if docker logs workinggg_gvmd_1 2>&1 | grep -q 'gvmd is ready'; then
    echo "✅ GVM is ready."
    break
  fi
  ((ATTEMPTS++))
  [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ] && { echo "❌ Timeout."; exit 1; }
  echo "Waiting... (${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 10
done

ATTEMPTS=0
echo "--- Waiting for 'admin' user ---"
while true; do
  if docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --get-users --verbose | grep -q 'admin'; then
    echo "✅ Admin user exists."
    break
  fi
  ((ATTEMPTS++))
  [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ] && { echo "❌ Admin user not found."; exit 1; }
  echo "Waiting for user... (${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 10
done
