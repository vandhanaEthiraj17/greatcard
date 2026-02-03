#!/bin/bash

# GreatCard Enterprise Platform - Startup Script

echo "=================================================="
echo "   🚀 GreatCard Enterprise Platform Startup"
echo "=================================================="

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID
    fi
    # Don't kill mongo/redis as they might be system services, but we could if we started them locally.
    # For now, just kill the node server we started.
    exit
}

trap cleanup SIGINT

# 1. Infrastructure Checks
echo ""
echo "[1/4] 🏗️  Checking Infrastructure..."

# Redis
if pgrep "redis-server" > /dev/null; then
    echo "   ✅ Redis is running"
else
    echo "   📦 Starting Redis..."
    brew services start redis || redis-server --daemonize yes
fi

# MongoDB
if pgrep "mongod" > /dev/null; then
    echo "   ✅ MongoDB is running"
else
    echo "   🍃 Starting MongoDB (Local)..."
    mkdir -p db
    mongod --dbpath ./db --fork --logpath ./db/mongod.log
fi

# 2. Backend Server
echo ""
echo "[2/4] 🧠 Starting Backend Server..."
cd server
if [ ! -d "node_modules" ]; then
    echo "   📦 Installing Server Dependencies..."
    npm install --silent
fi

echo "   🚀 Launching API Server (Background)..."
# Start in background, piping logs to a file so we don't clutter the client view
# But we can tail it in a separate tab if needed.
npm start > server.log 2>&1 &
SERVER_PID=$!
echo "   -> Server PID: $SERVER_PID"
echo "   -> Logs: server/server.log"

# Wait for server to be healthy
echo "   ⏳ Waiting for Health Check..."
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/health/db)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "   ✅ Server is HEALTHY (Port 5001)"
else
    echo "   ⚠️  Server might be starting up still or failed. Check logs."
fi

cd ..

# 3. Frontend Client
echo ""
echo "[3/4] 💻 Starting Frontend Client..."
cd client
if [ ! -d "node_modules" ]; then
    echo "   📦 Installing Client Dependencies..."
    npm install --silent
fi

echo "   🚀 Launching Vite Dev Server..."
echo "   (Press Ctrl+C to stop everything)"
echo ""
npm run dev
