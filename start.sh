#!/bin/bash

# ============================================
# AI Esports Performance Analyzer - Start Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${PURPLE}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   AI Esports Performance Analyzer            ║"
echo "  ║   Starting Application...                    ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Load .env
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
  echo -e "${GREEN}[OK]${NC} Loaded .env configuration"
else
  echo -e "${RED}[ERROR]${NC} .env file not found! Please create one."
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ---- Clean up ports ----
echo -e "\n${CYAN}[1/6]${NC} Cleaning up used ports..."

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${YELLOW}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Check PostgreSQL ----
echo -e "\n${CYAN}[2/6]${NC} Checking PostgreSQL..."

if ! command -v psql &> /dev/null; then
  echo -e "${RED}[ERROR]${NC} PostgreSQL (psql) not found. Please install PostgreSQL."
  exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -q 2>/dev/null; then
  echo -e "${YELLOW}  PostgreSQL is not running. Attempting to start...${NC}"
  if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  fi
  sleep 2
  if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -q 2>/dev/null; then
    echo -e "${RED}[ERROR]${NC} Cannot connect to PostgreSQL. Please start it manually."
    exit 1
  fi
fi
echo -e "  ${GREEN}PostgreSQL is running${NC}"

# ---- Setup Database ----
echo -e "\n${CYAN}[3/6]${NC} Setting up database..."

DB_NAME=${DB_NAME:-esports_analyzer}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Create database if it doesn't exist
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "  ${YELLOW}Creating database '$DB_NAME'...${NC}"
  PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
fi

# Run schema
echo -e "  ${YELLOW}Applying schema...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PROJECT_DIR/backend/db/schema.sql" -q 2>/dev/null

# Run seed data
echo -e "  ${YELLOW}Seeding data...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PROJECT_DIR/backend/db/seed.sql" -q 2>/dev/null

echo -e "  ${GREEN}Database setup complete${NC}"

# ---- Install Dependencies ----
echo -e "\n${CYAN}[4/6]${NC} Installing dependencies..."

# Backend dependencies
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
  echo -e "  ${YELLOW}Installing backend dependencies...${NC}"
  cd "$PROJECT_DIR/backend" && npm install --silent 2>/dev/null
else
  echo -e "  ${GREEN}Backend dependencies already installed${NC}"
fi

# Frontend dependencies
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
  echo -e "  ${YELLOW}Installing frontend dependencies (this may take a moment)...${NC}"
  cd "$PROJECT_DIR/frontend" && npm install --silent 2>/dev/null
else
  echo -e "  ${GREEN}Frontend dependencies already installed${NC}"
fi

cd "$PROJECT_DIR"

# ---- Start Backend ----
echo -e "\n${CYAN}[5/6]${NC} Starting backend server on port $BACKEND_PORT..."

# Use nodemon if available, otherwise use node with a simple watch
if command -v npx &> /dev/null; then
  cd "$PROJECT_DIR/backend"
  npx -y nodemon --watch . --ext js,json server.js &
  BACKEND_PID=$!
else
  cd "$PROJECT_DIR/backend"
  node server.js &
  BACKEND_PID=$!
fi

echo -e "  ${GREEN}Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "  ${YELLOW}Waiting for backend to be ready...${NC}"
for i in $(seq 1 15); do
  if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}Backend is ready!${NC}"
    break
  fi
  sleep 1
done

# ---- Start Frontend ----
echo -e "\n${CYAN}[6/6]${NC} Starting frontend on port $FRONTEND_PORT..."

cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!

echo -e "  ${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"

cd "$PROJECT_DIR"

# ---- Ready ----
echo ""
echo -e "${PURPLE}  ╔══════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}  ║${NC}   ${GREEN}Application is starting!${NC}                    ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}   Frontend:  ${CYAN}http://localhost:$FRONTEND_PORT${NC}          ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}   Backend:   ${CYAN}http://localhost:$BACKEND_PORT${NC}          ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}   Login:     ${YELLOW}admin@esports.gg / admin123${NC}    ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}   (or click Quick Login button)              ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}  ║${NC}   ${RED}Press Ctrl+C to stop all services${NC}          ${PURPLE}║${NC}"
echo -e "${PURPLE}  ╚══════════════════════════════════════════════╝${NC}"
echo ""

# ---- Graceful Shutdown ----
cleanup() {
  echo ""
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}All services stopped. Goodbye!${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
