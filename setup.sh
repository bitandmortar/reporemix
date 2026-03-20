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

# PostgreSQL connection defaults (override with env vars)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5434}"
DB_USER="${DB_USER:-$USER}"
DB_NAME="${DB_NAME:-reporemix}"

echo "✅ PostgreSQL client detected (target: ${DB_HOST}:${DB_PORT}, user: ${DB_USER})"

# Verify PostgreSQL major version from psql client
PSQL_VERSION=$(psql --version | sed -E 's/.* ([0-9]+)\..*/\1/')
if [ -z "$PSQL_VERSION" ] || [ "$PSQL_VERSION" -lt 14 ]; then
    echo "❌ PostgreSQL 14+ required. Current client: $(psql --version)"
    exit 1
fi

# Verify target server is reachable on configured host/port
if ! PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Cannot connect to PostgreSQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}"
    echo "   Set DB_HOST / DB_PORT / DB_USER / DB_PASSWORD env vars, then rerun setup."
    exit 1
fi

echo "✅ PostgreSQL ${PSQL_VERSION}+ reachable at ${DB_HOST}:${DB_PORT}"

# Check if database exists
if PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PGPASSWORD="${DB_PASSWORD:-}" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || true
        PGPASSWORD="${DB_PASSWORD:-}" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        echo "✅ Database recreated"
    fi
else
    PGPASSWORD="${DB_PASSWORD:-}" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
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
