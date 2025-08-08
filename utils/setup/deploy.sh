#!/bin/bash
set -e

./scripts/00_banner.sh
./scripts/01_configure_env.sh
./scripts/02_set_passwords.sh
./scripts/03_prepare_docker.sh
./scripts/04_start_services.sh
./scripts/05_wait_for_gvm.sh
./scripts/06_set_admin_password.sh
./scripts/99_finalize.sh
