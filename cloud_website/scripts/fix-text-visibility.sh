#!/bin/bash

# Script to fix text visibility issues across the website
# This script will identify and report files with potential text visibility issues

echo "🔍 Scanning for text visibility issues..."
echo "=========================================="

# Find files with light text on potentially light backgrounds
echo ""
echo "Files with text-gray-100, text-gray-50, or text-white on light backgrounds:"
grep -r "text-gray-100\|text-gray-50" anywheredoor/src/app --include="*.tsx" --include="*.jsx" | grep -v "bg-blue\|bg-navy\|bg-gradient\|bg-gray-800\|bg-gray-900" | wc -l

echo ""
echo "Files with text-blue-100 or text-blue-200:"
grep -r "text-blue-100\|text-blue-200" anywheredoor/src/app --include="*.tsx" --include="*.jsx" | wc -l

echo ""
echo "✅ Scan complete. Check the output above for issues."
