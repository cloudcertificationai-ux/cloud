#!/bin/bash

# Course CRUD API Test Script
# This script tests all course CRUD endpoints using curl
# Usage: ./scripts/test-course-apis.sh

set -e

BASE_URL="http://localhost:3001/api/admin/courses"
COURSE_ID=""

echo "🚀 Starting Course CRUD API Tests"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    local test_name="$1"
    local expected_status="$2"
    local actual_status="$3"
    
    if [ "$expected_status" -eq "$actual_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name (Status: $actual_status)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name (Expected: $expected_status, Got: $actual_status)"
        ((FAILED++))
    fi
}

echo "📝 Test 1: Create course with valid data"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course API Verification",
    "slug": "test-course-api-verification",
    "summary": "A test course for API verification",
    "priceCents": 9900,
    "currency": "INR",
    "level": "Beginner",
    "durationMin": 120
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
print_result "Create course with valid data" 201 "$STATUS"

# Extract course ID from response
if [ "$STATUS" -eq 201 ]; then
    COURSE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Course ID: $COURSE_ID"
fi

echo ""
echo "📝 Test 2: Create course without slug (auto-generate)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Auto Slug Test Course",
    "priceCents": 9900
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Auto-generate slug from title" 201 "$STATUS"

echo ""
echo "📝 Test 3: Create course with duplicate slug"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Duplicate Slug Course",
    "slug": "test-course-api-verification",
    "priceCents": 9900
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Reject duplicate slug" 409 "$STATUS"

echo ""
echo "📝 Test 4: Create course with missing required fields"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "incomplete-course"
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Reject missing required fields" 400 "$STATUS"

echo ""
echo "📝 Test 5: Create course with invalid price"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invalid Price Course",
    "priceCents": -500
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Reject negative price" 400 "$STATUS"

if [ -z "$COURSE_ID" ]; then
    echo ""
    echo -e "${RED}❌ Cannot continue tests - no course ID available${NC}"
    exit 1
fi

echo ""
echo "📖 Test 6: Get course by ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/$COURSE_ID")
STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Get course by ID" 200 "$STATUS"

echo ""
echo "📖 Test 7: Get nonexistent course"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/nonexistent-id-12345")
STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Get nonexistent course returns 404" 404 "$STATUS"

echo ""
echo "✏️ Test 8: Update course metadata"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Course Title",
    "summary": "Updated summary",
    "priceCents": 12900
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Update course metadata" 200 "$STATUS"

echo ""
echo "✏️ Test 9: Update nonexistent course"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/nonexistent-id-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }')

STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Update nonexistent course returns 404" 404 "$STATUS"

echo ""
echo "🗑️ Test 10: Delete course"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/$COURSE_ID")
STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Delete course" 200 "$STATUS"

echo ""
echo "🗑️ Test 11: Delete nonexistent course"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/nonexistent-id-12345")
STATUS=$(echo "$RESPONSE" | tail -n1)
print_result "Delete nonexistent course returns 404" 404 "$STATUS"

echo ""
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
