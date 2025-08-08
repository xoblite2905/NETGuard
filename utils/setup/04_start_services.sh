#!/bin/bash
set -e

export COMPOSE_HTTP_TIMEOUT=180
echo "--- Starting Docker Services ---"
docker-compose --env-file .env up --build -d
