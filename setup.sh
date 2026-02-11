#!/bin/bash

# RepoRemix Setup Script
# This script helps you set up RepoRemix for the first time

set -e

echo "🎯 RepoRemix Setup"
echo "=================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL 14+"
    echo "   macOS: brew install postgresql@14"
    echo "   Ubuntu: sudo apt-get install postgresql-14"
    exit 1
fi

echo "✅ PostgreSQL detected"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw reporemix; then
    echo "⚠️  Database 'reporemix' already exists"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb reporemix || true
        createdb reporemix
        echo "✅ Database recreated"
    fi
else
    createdb reporemix
    echo "✅ Database created"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Environment setup
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env
    
    # Generate session secret
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/generate_a_random_secret_here_min_32_chars/$SESSION_SECRET/" .env
    else
        sed -i "s/generate_a_random_secret_here_min_32_chars/$SESSION_SECRET/" .env
    fi
    
    echo "✅ .env file created with random session secret"
    echo ""
    echo "⚠️  IMPORTANT: You need to set up GitHub OAuth credentials"
    echo ""
    echo "1. Go to: https://github.com/settings/developers"
    echo "2. Click 'New OAuth App'"
    echo "3. Fill in:"
    echo "   - Application name: RepoRemix (Dev)"
    echo "   - Homepage URL: http://localhost:3000"
    echo "   - Callback URL: http://localhost:3000/auth/github/callback"
    echo "4. Copy the Client ID and Client Secret"
    echo "5. Update .env file with:"
    echo "   GITHUB_CLIENT_ID=your_client_id"
    echo "   GITHUB_CLIENT_SECRET=your_client_secret"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
else
    echo "✅ .env file already exists"
fi

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run migrate:up

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:5173"
echo ""
echo "For production deployment, see README.md"
echo ""
