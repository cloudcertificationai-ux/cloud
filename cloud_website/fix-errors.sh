#!/bin/bash

# Anywheredoor Error Fix Script
# This script fixes common development errors

echo "🔧 Anywheredoor Error Fix Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the anywheredoor directory."
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Step 1: Clear Next.js cache
echo "📦 Step 1: Clearing Next.js cache..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Cleared .next directory"
else
    echo "ℹ️  No .next directory found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Cleared node_modules/.cache"
else
    echo "ℹ️  No cache directory found"
fi
echo ""

# Step 2: Check database connection
echo "🗄️  Step 2: Checking database connection..."
if [ -f ".env" ]; then
    echo "✅ Found .env file"
    
    # Check if DATABASE_URL exists
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL is configured"
    else
        echo "⚠️  DATABASE_URL not found in .env"
        echo "   Please add your database connection string"
    fi
else
    echo "⚠️  No .env file found"
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file - please update with your credentials"
    else
        echo "❌ .env.example not found"
    fi
fi
echo ""

# Step 3: Database setup
echo "🔄 Step 3: Setting up database..."
read -p "Do you want to push schema and seed the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing schema to database..."
    npx prisma db push
    
    echo "Seeding database..."
    npx prisma db seed
    
    echo "✅ Database setup complete"
else
    echo "⏭️  Skipped database setup"
fi
echo ""

# Step 4: Clear browser data instructions
echo "🌐 Step 4: Clear browser data"
echo "================================"
echo "Please manually clear your browser data:"
echo ""
echo "Chrome/Edge:"
echo "1. Open DevTools (F12)"
echo "2. Go to Application tab"
echo "3. Click 'Service Workers' → Unregister all"
echo "4. Click 'Clear storage' → Clear site data"
echo ""
echo "Firefox:"
echo "1. Open DevTools (F12)"
echo "2. Go to Storage tab"
echo "3. Right-click 'Service Workers' → Unregister"
echo "4. Clear all storage"
echo ""

# Step 5: Start development server
echo "🚀 Step 5: Starting development server..."
read -p "Do you want to start the dev server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server..."
    echo ""
    echo "✅ All fixes applied!"
    echo "📝 Check ERROR_FIXES.md for detailed information"
    echo ""
    npm run dev
else
    echo ""
    echo "✅ All fixes applied!"
    echo "📝 Check ERROR_FIXES.md for detailed information"
    echo ""
    echo "To start the server manually, run:"
    echo "  npm run dev"
fi
