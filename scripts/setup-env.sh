#!/bin/bash

# JobGenie Environment Setup Script
echo "🔧 Setting up JobGenie environment variables..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy template to .env
if [ -f "env.template" ]; then
    cp env.template .env
    echo "✅ Created .env file from template"
else
    echo "❌ env.template not found. Please create it first."
    exit 1
fi

echo ""
echo "🔐 IMPORTANT: Update the following values in your .env file:"
echo "   - VITE_OPENAI_API_KEY (for AI features)"
echo "   - VITE_PINECONE_API_KEY (for vector search)"
echo "   - VITE_PINECONE_ENVIRONMENT (your Pinecone environment)"
echo ""
echo "📝 Firebase configuration is already set up with your project values."
echo ""
echo "⚡ To get started:"
echo "   1. Edit .env with your API keys"
echo "   2. Run: pnpm install"
echo "   3. Run: pnpm run dev"
echo ""
echo "✅ Environment setup complete!"
