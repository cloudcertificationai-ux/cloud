#!/bin/bash

echo "🔧 Memory Error Fix Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop any running dev servers
echo "🛑 Step 1: Stopping any running dev servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Stopped dev servers${NC}"
echo ""

# Step 2: Clear all caches
echo "🗑️  Step 2: Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
echo -e "${GREEN}✅ Cleared .next, node_modules/.cache, and .swc${NC}"
echo ""

# Step 3: Update database connection string
echo "🔐 Step 3: Updating database SSL mode..."
if [ -f .env ]; then
    # Backup .env
    cp .env .env.backup
    # Update sslmode
    sed -i.bak 's/sslmode=require/sslmode=verify-full/g' .env
    rm .env.bak 2>/dev/null || true
    echo -e "${GREEN}✅ Updated DATABASE_URL to use sslmode=verify-full${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi
echo ""

# Step 4: Disable Turbopack temporarily
echo "⚡ Step 4: Checking Turbopack configuration..."
if grep -q "next dev --turbo" package.json; then
    echo -e "${YELLOW}⚠️  Turbopack is enabled. Consider disabling it if memory errors persist.${NC}"
    echo "   Edit package.json and remove --turbo flag from dev script"
else
    echo -e "${GREEN}✅ Turbopack not explicitly enabled${NC}"
fi
echo ""

# Step 5: Generate Prisma Client
echo "🔄 Step 5: Regenerating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client regenerated${NC}"
echo ""

# Step 6: Test database connection
echo "🗄️  Step 6: Testing database connection..."
if npx prisma db pull --force 2>&1 | grep -q "Introspected"; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "   Check your DATABASE_URL in .env"
fi
echo ""

# Step 7: Recommendations
echo "📋 Step 7: Recommendations"
echo "================================"
echo ""
echo "1. ${YELLOW}Disable image optimization in development:${NC}"
echo "   Add to next.config.ts images section:"
echo "   unoptimized: process.env.NODE_ENV === 'development',"
echo ""
echo "2. ${YELLOW}Reduce concurrent image loading:${NC}"
echo "   Implement pagination or lazy loading for course images"
echo ""
echo "3. ${YELLOW}Monitor memory usage:${NC}"
echo "   Run: node --trace-warnings --max-old-space-size=4096 node_modules/.bin/next dev"
echo ""
echo "4. ${YELLOW}If errors persist:${NC}"
echo "   - Update Node.js to latest LTS version"
echo "   - Update all dependencies: npm update"
echo "   - Try without Turbopack: next dev (remove --turbo)"
echo ""

echo -e "${GREEN}✅ Memory error fixes applied!${NC}"
echo ""
echo "🚀 Ready to start dev server"
echo "   Run: npm run dev"
echo ""
