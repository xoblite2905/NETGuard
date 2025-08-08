#!/bin/bash
set -e
source ./scripts/utils.sh

DB_USER="netguard_user"
DB_NAME="netguard_db"

read -s -p "Create MASTER password: " MASTER_PASSWORD
echo ""
read -s -p "Confirm MASTER password: " CONFIRM
echo ""

[ "$MASTER_PASSWORD" != "$CONFIRM" ] && { echo "ERROR: Passwords do not match."; exit 1; }

update_env_var "POSTGRES_USER" "$DB_USER"
update_env_var "POSTGRES_DB" "$DB_NAME"
update_env_var "POSTGRES_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_USER" "admin"

update_env_var "DB_HOST" "127.0.0.1"
update_env_var "DB_PORT" "5432"
update_env_var "DB_DRIVER" "pg8000"
update_env_var "ELASTICSEARCH_URI" "http://127.0.0.1:9200"

ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$MASTER_PASSWORD'''))")
update_env_var "DATABASE_URL" "postgresql+pg8000://${DB_USER}:${ENCODED}@postgres_db:5432/${DB_NAME}"
