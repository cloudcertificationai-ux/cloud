#!/bin/bash

# Comprehensive Testing Script for Anywheredoor
# This script runs all types of tests in the correct order

set -e

echo "🚀 Starting Comprehensive Test Suite for Anywheredoor"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the anywheredoor directory."
    exit 1
fi

# Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci
fi

# 1. Type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# 2. Linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# 3. Format checking
print_status "Checking code formatting..."
if npm run format:check; then
    print_success "Code formatting is correct"
else
    print_warning "Code formatting issues found. Run 'npm run format' to fix."
fi

# 4. Unit tests
print_status "Running unit tests..."
if npm run test -- --coverage --watchAll=false; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# 5. Build the application
print_status "Building application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# 6. Start the application in background for E2E tests
print_status "Starting application for E2E tests..."
npm run start &
SERVER_PID=$!

# Wait for server to start
print_status "Waiting for server to start..."
sleep 10

# Check if server is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Server is running"
else
    print_warning "Server health check failed, but continuing with tests..."
fi

# 7. Install Playwright browsers if needed
print_status "Installing Playwright browsers..."
npx playwright install --with-deps

# 8. Run E2E tests
print_status "Running E2E tests..."
E2E_SUCCESS=true

# Run existing E2E tests
print_status "Running existing E2E tests..."
if npm run test:e2e tests/e2e/critical-user-flows.spec.ts tests/e2e/homepage.spec.ts tests/e2e/seo-performance.spec.ts tests/e2e/ssr-ssg-isr.spec.ts; then
    print_success "Existing E2E tests passed"
else
    print_error "Existing E2E tests failed"
    E2E_SUCCESS=false
fi

# Run comprehensive SSR/SSG/ISR tests
print_status "Running comprehensive SSR/SSG/ISR tests..."
if npm run test:e2e tests/e2e/comprehensive-ssr-ssg-isr.spec.ts; then
    print_success "Comprehensive SSR/SSG/ISR tests passed"
else
    print_error "Comprehensive SSR/SSG/ISR tests failed"
    E2E_SUCCESS=false
fi

# Run comprehensive SEO validation tests
print_status "Running comprehensive SEO validation tests..."
if npm run test:e2e tests/e2e/comprehensive-seo-validation.spec.ts; then
    print_success "Comprehensive SEO validation tests passed"
else
    print_error "Comprehensive SEO validation tests failed"
    E2E_SUCCESS=false
fi

# Run comprehensive user flows tests
print_status "Running comprehensive user flows tests..."
if npm run test:e2e tests/e2e/comprehensive-user-flows.spec.ts; then
    print_success "Comprehensive user flows tests passed"
else
    print_error "Comprehensive user flows tests failed"
    E2E_SUCCESS=false
fi

# Stop the server
print_status "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# 9. Security audit
print_status "Running security audit..."
if npm audit --audit-level=moderate; then
    print_success "Security audit passed"
else
    print_warning "Security audit found issues. Review and fix if necessary."
fi

# 10. Bundle analysis (optional)
if [ "$1" = "--analyze" ]; then
    print_status "Running bundle analysis..."
    npm run analyze
fi

# Final results
echo ""
echo "=================================================="
if [ "$E2E_SUCCESS" = true ]; then
    print_success "🎉 All tests completed successfully!"
    echo ""
    echo "✅ Type checking: PASSED"
    echo "✅ Linting: PASSED"
    echo "✅ Unit tests: PASSED"
    echo "✅ Build: PASSED"
    echo "✅ E2E tests: PASSED"
    echo ""
    print_status "Your application is ready for deployment!"
else
    print_error "❌ Some tests failed. Please review the output above."
    exit 1
fi