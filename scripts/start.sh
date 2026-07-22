#!/bin/bash



NGROK_DOMAIN="photobathic-epiblastic-noble.ngrok-free.dev"
DOCKER_DIR="$(dirname "$0")/../docker"
ENV_FILE=".env.docker"
API_PORT=3000


# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' 

# Banner
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ██╗   ██╗██╗███████╗████████╗ █████╗  ██████╗ ██████╗  █████╗ ███╗   ███╗"
echo "  ██║   ██║██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██╔══██╗██╔══██╗████╗ ████║"
echo "  ██║   ██║██║███████╗   ██║   ███████║██║  ███╗██████╔╝███████║██╔████╔██║"
echo "  ╚██╗ ██╔╝██║╚════██║   ██║   ██╔══██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║"
echo "   ╚████╔╝ ██║███████║   ██║   ██║  ██║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║"
echo "    ╚═══╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝"
echo -e "${NC}"
echo -e "${BOLD}  Instagram Clone Backend${NC}"
echo ""


echo -e "${BLUE}[1/4]${NC} Checking dependencies..."

if ! command -v docker &> /dev/null; then
  echo -e "  ${RED}✗ Docker not found. Install Docker first.${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ Docker found${NC}"

if ! command -v ngrok &> /dev/null; then
  echo -e "  ${RED}✗ Ngrok not found. Run: brew install ngrok${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ Ngrok found${NC}"


echo ""
echo -e "${BLUE}[2/4]${NC} Checking environment..."

if [ ! -f "$DOCKER_DIR/$ENV_FILE" ]; then
  echo -e "  ${RED}✗ Missing $DOCKER_DIR/$ENV_FILE${NC}"
  echo -e "  ${YELLOW}  Copy docker/.env.docker.example to docker/.env.docker and fill in values${NC}"
  exit 1
fi
echo -e "  ${GREEN}✓ Environment file found${NC}"


echo ""
echo -e "${BLUE}[3/4]${NC} Starting Docker services..."

cd "$DOCKER_DIR" || exit 1


RUNNING=$(docker compose --env-file $ENV_FILE ps --status running -q 2>/dev/null | wc -l)

if [ "$RUNNING" -gt 5 ]; then
  echo -e "  ${GREEN}✓ Services already running ($RUNNING containers up)${NC}"
else
  echo -e "  ${YELLOW}→ Starting all services...${NC}"
  docker compose --env-file $ENV_FILE up -d 2>&1 | grep -E "Started|Running|Created|Error" | while read -r line; do
    echo -e "    ${GREEN}✓${NC} $line"
  done

  echo -e "  ${YELLOW}→ Waiting for services to be healthy...${NC}"
  sleep 8
fi


HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$API_PORT/health" 2>/dev/null)

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "  ${GREEN}✓ API Gateway healthy (port $API_PORT)${NC}"
else
  echo -e "  ${YELLOW}⚠ API Gateway not responding yet (status: $HTTP_STATUS)${NC}"
  echo -e "  ${YELLOW}  Services may still be starting up...${NC}"
fi

cd - > /dev/null || exit 1

 
echo ""
echo -e "${BLUE}[4/4]${NC} Starting public tunnel..."
echo ""
echo -e "  ${GREEN}${BOLD}✓ Vistagram is LIVE!${NC}"
echo ""
echo -e "  ${BOLD}Public API:${NC}      ${CYAN}https://$NGROK_DOMAIN${NC}"
echo -e "  ${BOLD}Local API:${NC}       ${CYAN}http://localhost:$API_PORT${NC}"
echo -e "  ${BOLD}Ngrok Dashboard:${NC} ${CYAN}http://localhost:4040${NC}"
echo -e "  ${BOLD}OpenSearch UI:${NC}   ${CYAN}http://localhost:5601${NC}"
echo -e "  ${BOLD}RabbitMQ UI:${NC}     ${CYAN}http://localhost:15672${NC}"
echo -e "  ${BOLD}MinIO Console:${NC}   ${CYAN}http://localhost:9001${NC}"
echo ""
echo -e "  ${BOLD}Quick test:${NC}"
echo -e "  ${YELLOW}curl https://$NGROK_DOMAIN/health${NC}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${NC} to stop the tunnel"
echo -e "  ${YELLOW}(Docker services will keep running in background)${NC}"
echo ""
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""


ngrok http --domain="$NGROK_DOMAIN" $API_PORT


echo ""
echo -e "${YELLOW}Tunnel closed.${NC}"
echo -e "Docker services are still running in background."
echo ""
echo -e "To stop everything run:"
echo -e "  ${CYAN}cd docker && docker compose --env-file .env.docker down${NC}"
echo ""