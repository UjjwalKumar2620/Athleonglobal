#!/bin/bash

# Athleon Global - Localhost Startup Script
# This script helps you start the application on localhost

echo "🚀 Athleon Global - Localhost Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server
    npm install
    cd ..
    echo ""
fi

# Check if concurrently is installed
if ! npm list concurrently &> /dev/null; then
    echo "📦 Installing concurrently..."
    npm install --save-dev concurrently
    echo ""
fi

# Check for .env file in server directory
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server/ directory"
    echo "   Please create server/.env with your configuration"
    echo "   See LOCALHOST_SETUP.md for details"
    echo ""
    echo "   Minimum required:"
    echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/athleon_db\""
    echo "   JWT_SECRET=\"your-secret-key\""
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Prisma client is generated
if [ ! -d "server/node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    cd server
    npx prisma generate
    cd ..
    echo ""
fi

echo "🎯 Starting development servers..."
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev:full

