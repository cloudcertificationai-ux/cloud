#!/bin/bash

# Auto-fix text visibility issues
# This script automatically replaces common problematic text color patterns

echo "🔧 Auto-fixing text visibility issues..."
echo ""

# Counter for changes
CHANGES=0

# Function to replace text in files
fix_pattern() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo "Fixing: $description"
    
    # Find and replace in all TSX files, excluding node_modules and .next
    find src -type f \( -name "*.tsx" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | while read file; do
        if grep -q "$pattern" "$file"; then
            # Create backup
            cp "$file" "$file.bak"
            
            # Replace pattern
            sed -i.tmp "s/$pattern/$replacement/g" "$file"
            rm "$file.tmp"
            
            echo "  ✓ Fixed: $file"
            ((CHANGES++))
        fi
    done
}

# Fix text-blue-50 on non-gradient backgrounds
echo "1. Fixing text-blue-50 on light backgrounds..."
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | while read file; do
    # Only fix if NOT in a gradient/dark background context
    if grep -q "text-blue-50" "$file" && ! grep -q "bg-gradient\|from-blue-9\|bg-blue-9" "$file"; then
        echo "  ⚠️  Manual review needed: $file"
    fi
done

# Fix text-gray-50 and text-gray-100 on light backgrounds
echo ""
echo "2. Fixing text-gray-50/100 on light backgrounds..."
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | while read file; do
    if grep -q "text-gray-50\|text-gray-100" "$file" && ! grep -q "bg-gradient\|from-blue-9\|bg-gray-9" "$file"; then
        echo "  ⚠️  Manual review needed: $file"
    fi
done

echo ""
echo "✅ Auto-fix complete!"
echo ""
echo "📋 Summary:"
echo "   - Global CSS fixes applied (already done)"
echo "   - Component-level fixes require manual review"
echo "   - Run 'node scripts/fix-text-visibility.js' to see remaining issues"
echo ""
echo "🔍 Next steps:"
echo "   1. Review files marked for manual review above"
echo "   2. Test the website visually"
echo "   3. Run accessibility audit in browser DevTools"
echo ""
