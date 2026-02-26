#!/usr/bin/env node

/**
 * Script to find and report text visibility issues
 * This script scans all TSX files for light text colors on light backgrounds
 */

const fs = require('fs');
const path = require('path');

// Problematic text color classes that are hard to see on light backgrounds
const LIGHT_TEXT_COLORS = [
  'text-white',
  'text-gray-50',
  'text-gray-100',
  'text-gray-200',
  'text-blue-50',
  'text-blue-100',
  'text-blue-200',
  'text-teal-50',
  'text-teal-100',
  'text-teal-200',
];

// Light background classes
const LIGHT_BACKGROUNDS = [
  'bg-white',
  'bg-gray-50',
  'bg-gray-100',
  'bg-blue-50',
  'bg-blue-100',
];

// Dark background classes (where light text is OK)
const DARK_BACKGROUNDS = [
  'bg-blue-600',
  'bg-blue-700',
  'bg-blue-800',
  'bg-blue-900',
  'bg-gray-800',
  'bg-gray-900',
  'bg-navy-800',
  'bg-navy-900',
  'bg-gradient',
  'from-blue-900',
  'from-blue-800',
];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDirectory(filePath, results);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      scanFile(filePath, results);
    }
  });

  return results;
}

function scanFile(filePath, results) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for light text colors
    LIGHT_TEXT_COLORS.forEach(textColor => {
      if (line.includes(textColor)) {
        // Check if it's in a dark background context
        const hasDarkBg = DARK_BACKGROUNDS.some(bg => line.includes(bg));
        
        // Check if it's in a light background context
        const hasLightBg = LIGHT_BACKGROUNDS.some(bg => line.includes(bg));

        if (!hasDarkBg || hasLightBg) {
          results.push({
            file: filePath.replace(process.cwd() + '/', ''),
            line: index + 1,
            content: line.trim(),
            issue: `Potentially invisible ${textColor} on light background`,
          });
        }
      }
    });
  });
}

// Main execution
console.log('🔍 Scanning for text visibility issues...\n');

const srcDir = path.join(process.cwd(), 'src');
const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log('✅ No text visibility issues found!');
} else {
  console.log(`⚠️  Found ${results.length} potential text visibility issues:\n`);
  
  // Group by file
  const byFile = {};
  results.forEach(result => {
    if (!byFile[result.file]) {
      byFile[result.file] = [];
    }
    byFile[result.file].push(result);
  });

  Object.keys(byFile).forEach(file => {
    console.log(`\n📄 ${file}`);
    byFile[file].forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.issue}`);
      console.log(`   ${issue.content.substring(0, 100)}...`);
    });
  });

  console.log(`\n\n📊 Summary: ${results.length} issues found in ${Object.keys(byFile).length} files`);
  console.log('\n💡 Recommendations:');
  console.log('   - Replace text-white with text-gray-900 on light backgrounds');
  console.log('   - Replace text-blue-50/100 with text-blue-600/700 on light backgrounds');
  console.log('   - Replace text-gray-50/100 with text-gray-700/800 on light backgrounds');
  console.log('   - Ensure text colors have sufficient contrast (WCAG AA: 4.5:1 minimum)');
}

process.exit(results.length > 0 ? 1 : 0);
