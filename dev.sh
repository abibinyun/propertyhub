#!/bin/bash

# Jalankan backend (NestJS) dan frontend (Next.js) secara bersamaan
# Usage: ./dev.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

# Warna output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cleanup() {
  echo -e "\n${YELLOW}Stopping all processes...${NC}"
  kill 0
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}Starting PropertyHub Dev Environment${NC}"
echo "Backend  → http://localhost:3001"
echo "Frontend → http://localhost:3000"
echo "Press Ctrl+C to stop all"
echo "---"

# Backend
(
  cd "$SERVER_DIR"
  echo -e "${GREEN}[backend]${NC} Starting..."
  bun run start:dev 2>&1 | sed "s/^/$(echo -e "${GREEN}[backend]${NC}") /"
) &

# Frontend
(
  cd "$CLIENT_DIR"
  echo -e "${BLUE}[frontend]${NC} Starting..."
  bun run dev 2>&1 | sed "s/^/$(echo -e "${BLUE}[frontend]${NC}") /"
) &

wait
