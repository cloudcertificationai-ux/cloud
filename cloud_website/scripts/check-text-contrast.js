#!/usr/bin/env node

/**
 * Text Contrast Checker
 * This script scans TSX files for potential text visibility issues
 */

const fs = require('fs');
const path = require('path');

// Light text colors that should NOT be used on light backgrounds
const LIGHT_TEXT_COLORS = [
  'text-white',
  'text-gray-50',
  'text-gray-100',
  'text-gray-200',
  'text-blue-50',
  'text-blue-100',
  'text-blue-200',
  'text-blue-300',
];

// Light background colors
const LIGHT_BACKGROUNDS = [
  'bg-white',
  'bg-gray-50',
  'bg-gray-100',
  'bg-blue-50',
  'bg-blue-100',
];

// Dark background colors (where light text is OK)
const DARK_BACKGROUNDS = [
  'bg-blue-900',
  'bg-blue-800',
  'bg-blue-700',
  'bg-navy-900',
  'bg-navy-800',
  'bg-navy-700',
  'bg-gray-900',
  'bg-gray-800',
  'bg-gradient',
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // Check for light text on light backgrounds
    const hasLightText = LIGHT_TEXT_COLORS.some(color => line.includes(color));
    const hasLightBg = LIGHT_BACKGROUNDS.some(bg => line.includes(bg));
    const hasDarkBg = DARK_BACKGROUNDS.some(bg => line.includes(bg));

    if (hasLightText && hasLightBg && !hasDarkBg) {
      issues.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
        issue: 'Light text on light background detected'
      });
    }

    // Check for className with multiple light colors
    if (hasLightText && !hasDarkBg) {
      const classNameMatch = line.match(/className="([^"]*)"/);
      if (classNameMatch) {
        const classes = classNameMatch[1];
        const hasParentDarkBg = DARK_BACKGROUNDS.some(bg => 
          content.substring(0, content.indexOf(line)).includes(bg)
        );
        
        if (!hasParentDarkBg && !classes.includes('bg-blue-') && !classes.includes('bg-navy-')) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            issue: 'Potentially invisible text (light color without dark background)'
          });
        }
      }
    }
  });

  return issues;
}

function scanDirectory(dir, issues = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scanDirectory(filePath, issues);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const fileIssues = scanFile(filePath);
      issues.push(...fileIssues);
    }
  });

  return issues;
}

// Main execution
console.log('🔍 Scanning for text visibility issues...\n');

const srcDir = path.join(__dirname, '..', 'src');
const issues = scanDirectory(srcDir);

if (issues.length === 0) {
  console.log('✅ No text visibility issues found!');
} else {
  console.log(`⚠️  Found ${issues.length} potential text visibility issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Code: ${issue.content}`);
    console.log('');
  });

  console.log('\n💡 Recommendations:');
  console.log('   - Use dark text colors (text-gray-900, text-gray-800) on light backgrounds');
  console.log('   - Use light text colors (text-white, text-blue-50) only on dark backgrounds');
  console.log('   - Check the global CSS for automatic color corrections');
}

console.log('\n📝 For more details, see TEXT_VISIBILITY_FIXES.md');
