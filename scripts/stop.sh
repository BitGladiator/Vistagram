#!/bin/bash

#   Vistagram - Stop Script
#   Usage: ./scripts/stop.sh

# ---- Config --------------------------------
DOCKER_DIR="$(dirname "$0")/../docker"
# --------------------------------------------

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}${BOLD}Stopping Vistagram Environment...${NC}"
echo ""

# Check if Docker directory exists
if [ ! -d "$DOCKER_DIR" ]; then
  echo -e "${RED}✗ Error: Cannot find docker directory at $DOCKER_DIR${NC}"
  exit 1
fi

cd "$DOCKER_DIR" || exit 1

# Build the Compose command with the correct env files
COMPOSE_CMD="docker compose"

if [ -f ".env.docker" ]; then
  COMPOSE_CMD="$COMPOSE_CMD --env-file .env.docker"
fi

if [ -f ".env" ]; then
  COMPOSE_CMD="$COMPOSE_CMD --env-file .env"
fi

echo -e "${YELLOW}→ Gracefully shutting down all Docker containers...${NC}"
echo -e "${YELLOW}  (This gives databases time to safely save their data to avoid corruption)${NC}"

# Stop containers gracefully
$COMPOSE_CMD down

echo ""
echo -e "${GREEN}${BOLD}✓ Vistagram environment safely stopped.${NC}"
echo -e "  All databases have been saved and containers removed."
echo ""
