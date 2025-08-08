#!/bin/bash
set -e

# === Color Definitions ===
echo -e "\033[1;36mWelcome to CybReon\033[0m"


# === Logging Functions ===
info() { echo -e "${CYAN}[INFO]${RESET} $1"; }
success() { echo -e "${GREEN}[OK]${RESET} $1"; }
error() { echo -e "${RED}[ERROR]${RESET} $1"; }
step() { echo -e "\n${BOLD}${YELLOW}>>> $1 <<<${RESET}"; }

# === Spinner for waits ===
spinner() {
  local pid=$!
  local delay=0.15
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep "$pid")" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  wait $pid
  return $?
}

# === Update/Insert .env Variables ===
update_env_var() {
  local var_name=$1
  local var_value=$2
  if ! grep -q "^${var_name}=" .env; then
    echo "${var_name}=${var_value}" >> .env
  else
    sed -i "/^${var_name}=/c\\${var_name}=${var_value}" .env
  fi
}

# === ASCII Banner (Optional) ===
show_banner() {
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
  echo -e "${YELLOW}>>> Disrupt. Expose. Prevail. <<<${RESET}"
}

# === Initial Options ===
[[ "$1" == "--no-banner" ]] || show_banner

# === Stage 1: System Environment Setup ===
step "Stage 1: Configuring System Environment"
> .env
info "Cleared previous .env file."

INTERFACE=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)
[ -z "$INTERFACE" ] && error "Could not detect network interface. Exiting." && exit 1
update_env_var "IFACE" "$INTERFACE"
success "Network interface detected: ${INTERFACE}"

CIDR=$(ip -o -f inet addr show "$INTERFACE" | awk '/scope global/ {print $4}' | head -1)
[ -z "$CIDR" ] && error "Could not detect CIDR. Exiting." && exit 1
update_env_var "SCAN_TARGET_CIDR" "$CIDR"
success "CIDR range detected: ${CIDR}"

# === Stage 2: Credentials ===
step "Stage 2: Passwords & Database Config"
DB_USER="netguard_user"
DB_NAME="netguard_db"

while true; do
  read -s -p "Enter MASTER password (used for DB & GVM): " MASTER_PASSWORD
  echo ""
  read -s -p "Confirm MASTER password: " MASTER_PASSWORD_CONFIRM
  echo ""
  [[ "$MASTER_PASSWORD" != "$MASTER_PASSWORD_CONFIRM" ]] && error "Passwords do not match. Try again." || break
done

update_env_var "POSTGRES_USER" "$DB_USER"
update_env_var "POSTGRES_DB" "$DB_NAME"
update_env_var "POSTGRES_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_PASSWORD" "$MASTER_PASSWORD"
update_env_var "GVM_ADMIN_USER" "admin"
update_env_var "DB_HOST" "127.0.0.1"
update_env_var "DB_PORT" "5432"
update_env_var "DB_DRIVER" "pg8000"
update_env_var "ELASTICSEARCH_URI" "http://127.0.0.1:9200"

ENCODED_PASSWORD=$(echo "$MASTER_PASSWORD" | sed -e 's|%|%25|g' -e 's|:|%3A|g' -e 's|/|%2F|g' -e 's|?|%3F|g' -e 's|&|%26|g' -e 's|=|%3D|g' -e 's|+|%2B|g' -e 's| |%20|g' -e 's|#|%23|g' -e 's|@|%40|g')
update_env_var "DATABASE_URL" "postgresql+pg8000://${DB_USER}:${ENCODED_PASSWORD}@postgres_db:5432/${DB_NAME}"
success "Configuration saved to .env"

# === Stage 3: Docker Prep ===
step "Stage 3: Docker Cleanup & Volume Prep"
if ! docker-compose --env-file .env down -v --remove-orphans; then
  info "Docker cleanup skipped on first run."
fi
docker volume prune -f
mkdir -p ./packet_stream
rm -f ./packet_stream/scapy.pcap ./packet_stream/zeek.pcap
mkfifo ./packet_stream/scapy.pcap
mkfifo ./packet_stream/zeek.pcap
success "Docker and packet stream environment prepared"

# === Stage 4: Docker Build ===
step "Stage 4: Building and Launching Docker Services"
export COMPOSE_HTTP_TIMEOUT=180
docker-compose --env-file .env up --build -d || { error "Docker failed to start. Check logs."; exit 1; }
success "Docker services launched"

# === Stage 5: Wait for GVM ===
step "Stage 5: Waiting for GVM Services (15min timeout)"

MAX_ATTEMPTS=90
ATTEMPTS=0
while true; do
  if docker logs workinggg_gvmd_1 2>&1 | grep -q 'gvmd is ready to accept GMP connections'; then
    success "GVM daemon ready."
    break
  fi
  ((ATTEMPTS++))
  [[ $ATTEMPTS -ge $MAX_ATTEMPTS ]] && error "GVM daemon did not start in time." && exit 1
  echo -ne "Waiting for GVM daemon... ($ATTEMPTS/${MAX_ATTEMPTS})\r"
  sleep 10
done

# === Stage 6: Wait for Admin User ===
step "Stage 6: Waiting for GVM Admin User"
ATTEMPTS=0
while true; do
  if docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --get-users --verbose | grep -q 'admin'; then
    success "Admin user exists!"
    break
  fi
  ((ATTEMPTS++))
  [[ $ATTEMPTS -ge $MAX_ATTEMPTS ]] && error "Admin user not created in time." && exit 1
  echo -ne "Waiting for 'admin' user... ($ATTEMPTS/${MAX_ATTEMPTS})\r"
  sleep 10
done

# === Stage 7: Set Password ===
step "Stage 7: Setting Admin Password"
if docker-compose --env-file .env exec -T -u gvmd gvmd gvmd --user admin --new-password "$MASTER_PASSWORD

