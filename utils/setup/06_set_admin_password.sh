#!/bin/bash
set -e
source ./scripts/utils.sh

MASTER_PASSWORD=$(grep GVM_ADMIN_PASSWORD .env | cut -d= -f2)

echo "--- Setting GVM Admin Password ---"
docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --user admin --new-password "$MASTER_PASSWORD" \
  && echo "✅ Password set!" || { echo "❌ Failed to set password."; exit 1; }
