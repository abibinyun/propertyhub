#!/bin/bash

# Jalankan backend (NestJS) dan frontend (Next.js) secara bersamaan via Turborepo
# Usage: ./dev.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# Jalankan via Turborepo
cd "$ROOT_DIR"
bunx turbo dev
