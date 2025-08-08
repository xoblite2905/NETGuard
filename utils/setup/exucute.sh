#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# --- This function MUST be defined before it is called ---
update_env_var() {
  local var_name=$1
  local var_value=$2
  if ! grep -q "^${var_name}=" .env; then
    echo "${var_name}=${var_value}" >> .env
  else
    sed -i "/^${var_name}=/c\\${var_name}=${var_value}" .env
  fi
}


clear
cat << "EOF"

████████████████████████████████████████████
████▀▀░░░░░░░░░░░░░░░░░░░▀▀████
███│░░░░░░░░░░░░░░░░░░░░░│███
██▌│░░░░░░░░░░░░░░░░░░░░░│▐██
██░└┐░░░░░░░░░░░░░░░░░░┌┘░██
██░░└┐░░▄█████▄░░░░░░┌┘░░██
██░░┌┘██████████░┌┐└┐░░██
██▌░│██████████▌░│││▐██
███░│██████████░││││███
██▀─┘░░░░░░░░░░░░░└─▀██
██▄░░░██████████░░░░▄██
████▄░░▀██████▀░░░▄████
██████░░░░░░░░░░███████
█████████▄▄▄▄▄██████████
████████████████████████

EOF
toilet -f future --metal "CybReon"
echo ">>> Disrupt. Expose. Prevail. <<<"




# --- Stage 1: System Configuration ---
echo "--- Stage 1: Configuring System Environment ---"
> .env
echo "INFO: Cleared previous .env file."

INTERFACE=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)
[ -z "$INTERFACE" ] && { echo "ERROR: Could not automatically detect network interface. Exiting."; exit 1; }
update_env_var "IFACE" "$INTERFACE"
echo "INFO: Network interface configured as ${INTERFACE}."

SCAN_TARGET_CIDR=$(ip -o -f inet addr show "$INTERFACE" | awk '/scope global/ {print $4}' | head -1)
[ -z "$SCAN_TARGET_CIDR" ] && { echo "ERROR: Could not automatically detect network CIDR. Exiting."; exit 1; }
update_env_var "SCAN_TARGET_CIDR" "$SCAN_TARGET_CIDR"
echo "INFO: LAN scan target automatically configured as ${SCAN_TARGET_CIDR}."


# --- Stage 2: Unified Password and Database Configuration ---
echo ""
echo "--- Stage 2: Unified Credentials and App Configuration ---"
DB_USER="netguard_user"
DB_NAME="netguard_db"

read -s -p "Create the MASTER password for GVM Admin and PostgreSQL: " MASTER_PASSWORD
echo ""
read -s -p "Confirm the MASTER password: " MASTER_PASSWORD_CONFIRM
echo ""
[ "$MASTER_PASSWORD" != "$MASTER_PASSWORD_CONFIRM" ] && { echo "ERROR: Passwords do not match. Please run again."; exit 1; }

echo "INFO: Saving ALL required configuration to .env file..."
update_env_var "POSTGRES_USER" "$DB_USER"
update_env_var "POSTGRES_DB" "$DB_NAME"
update_env_var "POSTGRES_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_USER" "admin"

# ### --- THIS IS THE FIX --- ###
# Use Docker service names because netguard_app is on a bridge network.
update_env_var "DB_HOST" "127.0.0.1"
update_env_var "DB_PORT" "5432"
update_env_var "DB_DRIVER" "pg8000"
update_env_var "ELASTICSEARCH_URI" "http://127.0.0.1:9200"

ENCODED_PASSWORD=$(echo "$MASTER_PASSWORD" | sed -e 's|%|%25|g' -e 's|:|%3A|g' -e 's|/|%2F|g' -e 's|?|%3F|g' -e 's|&|%26|g' -e 's|=|%3D|g' -e 's|+|%2B|g' -e 's| |%20|g' -e 's|#|%23|g' -e 's|@|%40|g')
# Construct the DATABASE_URL with the correct service name.
DATABASE_URL_VALUE="postgresql+pg8000://${DB_USER}:${ENCODED_PASSWORD}@postgres_db:5432/${DB_NAME}"
update_env_var "DATABASE_URL" "$DATABASE_URL_VALUE"
# ### --- END OF FIX --- ###


# --- Stages 3 & 4: Clean and prepare Docker environment ---
echo ""
echo "--- Stages 3 & 4: Cleaning and preparing Docker environment... ---"
if ! docker-compose --env-file .env down -v --remove-orphans; then
    echo "Notice: 'docker-compose down' reported an error. This is normal on the first run."
fi
docker volume prune -f

echo "--- Stage 4.5: Preparing packet stream directory and downloading test data... ---"
mkdir -p ./packet_stream
# Use wget to download a real PCAP file for initial log generation.
wget -O ./packet_stream/http.pcap https://gitlab.com/wireshark/wireshark/-/raw/master/test/captures/http.pcap
echo "✅ SUCCESS: Test PCAP file downloaded."


# --- Stage 5: Building and starting all Docker services ---
echo ""
echo "--- Stage 5: Building and starting all Docker services... ---"
export COMPOSE_HTTP_TIMEOUT=180
if ! docker-compose --env-file .env up --build -d; then
    echo "ERROR: Docker Compose failed to start. Please check the logs."
    exit 1
fi


echo ""
echo "--- Stage 6: Waiting for the GVM API service AND the default admin user to be created... ---"
MAX_ATTEMPTS=90 # 15 minutes total (90 * 10s)

# Stage 6.1: Wait for the GVMD service to be ready for connections
echo "Waiting for GVM daemon to be ready for connections..."
ATTEMPTS=0
while true; do
  # Passively check the logs for the 'ready' message without interfering
  if docker logs workinggg_gvmd_1 2>&1 | grep -q 'gvmd is ready to accept GMP connections'; then
    echo "✅ INFO: GVM daemon is ready for connections."
    break
  fi

  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "❌ ERROR: GVM daemon did not become ready in time."
    echo "--- LOGS FROM GVMD CONTAINER ---"
    docker logs workinggg_gvmd_1
    exit 1
  fi
  echo "Waiting for GVM daemon... (attempt ${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 10
done

# Stage 6.2: Now that the service is ready, wait for the 'admin' user to exist
echo "GVM daemon is up. Now waiting for the 'admin' user to be created..."
ATTEMPTS=0
while true; do
  # Now it's safe to query the service
  if docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --get-users --verbose | grep -q 'admin'; then
    echo "✅ INFO: GVM 'admin' user exists!"
    break
  fi

  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "❌ ERROR: The admin user was not created in time."
    exit 1
  fi
  echo "Waiting for 'admin' user creation... (attempt ${ATTEMPTS}/${MAX_ATTEMPTS})"
  sleep 10
done

# --- Stage 7: Set GVM Password (this stage is now guaranteed to work) ---
echo ""
echo "--- Stage 7: Setting the admin password inside the GVM service... ---"
if docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --user admin --new-password "$MASTER_PASSWORD"; then
    echo "✅ SUCCESS: The admin password has been set successfully!"
else
    echo "❌ ERROR: Failed to set the admin password. Exiting."
    exit 1
fi

# --- Deployment Complete ---
echo ""
echo "--- ✅ DEPLOYMENT COMPLETE ---"
echo "The application stack is now running."
echo "You can view the main application logs with: docker logs -f CybReon_app"