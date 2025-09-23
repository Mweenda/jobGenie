#!/bin/bash

# Development Setup Script for JobGenie
echo "🚀 Starting JobGenie Development Environment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your actual configuration values"
fi

# Start Firebase emulators in background
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --only auth,firestore --project demo-project &
FIREBASE_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for Firebase emulators to start..."
sleep 5

# Check if emulators are running
if curl -s http://localhost:9099 > /dev/null; then
    echo "✅ Firebase Auth emulator running on port 9099"
else
    echo "❌ Firebase Auth emulator failed to start"
    exit 1
fi

if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Firestore emulator running on port 8080"
else
    echo "❌ Firestore emulator failed to start"
    exit 1
fi

# Start development server
echo "🌐 Starting Vite development server..."
pnpm run dev &
VITE_PID=$!

echo ""
echo "🎉 Development environment ready!"
echo ""
echo "📍 Application: http://localhost:5173"
echo "🔥 Firebase UI: http://localhost:4000"
echo "🔐 Auth Emulator: http://localhost:9099"
echo "💾 Firestore Emulator: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
