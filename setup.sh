#!/bin/bash

# Setup Script for NestJS API Project
# This script helps you set up the development environment

echo "🚀 NestJS REST API - Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI is not installed."
    echo "   You can either:"
    echo "   1. Install PostgreSQL locally"
    echo "   2. Use Docker Compose (recommended): docker-compose up -d"
else
    echo "✅ PostgreSQL is installed"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Ask if user wants to start PostgreSQL with Docker
echo ""
read -p "Do you want to start PostgreSQL using Docker Compose? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
        echo "🐳 Starting PostgreSQL with Docker Compose..."
        docker-compose up -d
        echo "✅ PostgreSQL is running on port 5432"
        echo "   Connection: postgresql://postgres:postgres@localhost:5432/nestjs_api_db"
    else
        echo "❌ Docker is not installed. Please install Docker to use docker-compose."
    fi
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Make sure PostgreSQL is running"
echo "3. Run 'npm run start:dev' to start the application"
echo "4. Import postman_collection.json to Postman for API testing"
echo "5. Run 'npm run test:e2e' to run E2E tests"
echo ""
echo "📚 Read README.md for detailed documentation"
echo "🧪 Read API_TESTING_GUIDE.md for testing instructions"
