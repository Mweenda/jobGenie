#!/bin/bash

# JobGenie Deployment Script for jobgenie-71964.web.app
echo "🚀 Deploying JobGenie to https://jobgenie-71964.web.app/"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "   firebase login"
    echo ""
    echo "After logging in, run this script again."
    exit 1
fi

# Use the correct project
echo "🎯 Setting Firebase project to jobgenie-71964..."
firebase use jobgenie-71964

if [ $? -ne 0 ]; then
    echo "❌ Failed to set Firebase project. Please ensure you have access to jobgenie-71964."
    echo "   You can check your projects with: firebase projects:list"
    exit 1
fi

# Build the project
echo "🔨 Building JobGenie for production..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors and try again."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 JobGenie is now live at: https://jobgenie-71964.web.app/"
    echo ""
    echo "🎉 Your app is ready for users!"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
