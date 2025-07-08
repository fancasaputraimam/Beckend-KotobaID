#!/bin/bash

# KotobaID Backend Setup Script

echo "🚀 Setting up KotobaID Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server."
else
    echo "✅ .env file already exists"
fi

# Check if service account file exists
if [ ! -f "service-account.json" ]; then
    echo "⚠️  Service account file (service-account.json) not found."
    echo "   Please download your service account key from Google Cloud Console"
    echo "   and save it as 'service-account.json' in the backend directory."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Add service-account.json file"
echo "3. Run 'npm run dev' to start development server"
echo "4. Test the API at http://localhost:3001/health"
echo ""