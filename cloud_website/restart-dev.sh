#!/bin/bash

# Clean restart script for development server
# This ensures all changes are picked up properly

echo "🧹 Cleaning build cache..."
rm -rf .next

echo "✨ Starting fresh development server..."
npm run dev
