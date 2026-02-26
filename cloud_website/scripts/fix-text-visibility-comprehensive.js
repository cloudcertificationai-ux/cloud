#!/usr/bin/env node

/**
 * Comprehensive Text Visibility Fix Script
 * Scans all pages and components for text visibility issues
 * and generates a detailed report with fixes
 */

const fs = require('fs');
const path = require('path');

// Text color patterns that may cause visibility issues
const PROBLEMATIC_PATTERNS = [
  // Light text on potentially light backgrounds
  { pattern: /className="[^"]*text-white[^"]*"/g, context: 'text-white', severity: 'high' },
  { pattern: /className="[^"]*text-gray-50[^"]*"/g, context: 'text-gray-50', severity: 'high' },
  { pattern: /className="[^"]*text-gray-100[^"]*"/g, context: 'text-gray-100', severity: 'high' },
  { pattern: /className="[^"]*text-blue-50[^"]*"/g, context: 'text-blue-50', severity: 'medium' },
  { pattern: /className="[^"]*text-blue-100[^"]*"/g, context: 'text-blue-100', severity: 'medium' },
  { pattern: /className="[^"]*text-blue-200[^"]*"/g, context: 'text-blue-200', severity: 'medium' },
  
  // Very light grays that may not have enough contrast
  { pattern: /className="[^"]*text-gray-300[^"]*"/g, context: 'text-gray-300', severity: 'low' },
  { pattern: /className="[^"]*text-gray-400[^"]*"/g, context: 'text-gray-400', severity: 'low' },
];

// Recommended replacements for better contrast
const CONTRAST_FIXES = {
  'text-white': {
    onLight: 'text-gray-900',
    onDark: 'text-white',
    description: 'White text should only be used on dark backgrounds'
  },
  'text-gray-50': {
    onLight: 'text-gray-900',
    onDark: 'text-gray-50',
    description: 'Very light gray - use dark text on light backgrounds'
  },
  'text-gray-100': {
    onLight: 'text-gray-900',
    onDark: 'text-gray-100',
    description: 'Light gray - use dark text on light backgrounds'
  },
  'text-blue-50': {
    onLight: 'text-blue-900',
    onDark: 'text-blue-50',
    description: 'Light blue - needs dark alternative for light backgrounds'
  },
  'text-blue-100': {
    onLight: 'text-blue-900',
    onDark: 'text-blue-100',
    description: 'Light blue - needs dark alternative for light backgrounds'
  },
  'text-gray-300': {
    onLight: 'text-gray-700',
    onDark: 'text-gray-300',
    description: 'Light gray - may need darker shade for better contrast'
  },
  'text-gray-400': {
    onLight: 'text-gray-600',
    onDark: 'text-gray-400',
    description: 'Medium gray - consider darker shade for better contrast'
  }
};

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath, results);
      }
    } else if (file.match(/\.(tsx|jsx|ts|js)$/)) {
      scanFile(filePath, results);
    }
  }
  
  return results;
}

function scanFile(filePath, results) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  PROBLEMATIC_PATTERNS.forEach(({ pattern, context, severity }) => {
    const matches = content.match(pattern);
    
    if (matches) {
      matches.forEach(match => {
        // Find line number
        let lineNumber = 0;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (content.indexOf(match) < charCount) {
            lineNumber = i + 1;
            break;
          }
        }
        
        // Check if it's on a dark background (heuristic)
        const lineContent = lines[lineNumber - 1] || '';
        const isDarkBackground = lineContent.match(/bg-(blue|navy|gray|black|slate)-(700|800|900|950)/);
        const isGradientBackground = lineContent.match(/bg-gradient/);
        
        results.push({
          file: filePath.replace(process.cwd(), ''),
          line: lineNumber,
          context,
          severity,
          match,
          lineContent: lineContent.trim(),
          isDarkBackground: !!(isDarkBackground || isGradientBackground),
          fix: CONTRAST_FIXES[context]
        });
      });
    }
  });
}

function generateReport(results) {
  console.log('\n='.repeat(80));
  console.log('TEXT VISIBILITY ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal issues found: ${results.length}\n`);
  
  // Group by severity
  const bySeverity = {
    high: results.filter(r => r.severity === 'high'),
    medium: results.filter(r => r.severity === 'medium'),
    low: results.filter(r => r.severity === 'low')
  };
  
  console.log(`🔴 High Priority: ${bySeverity.high.length}`);
  console.log(`🟡 Medium Priority: ${bySeverity.medium.length}`);
  console.log(`🟢 Low Priority: ${bySeverity.low.length}\n`);
  
  // Detailed report
  ['high', 'medium', 'low'].forEach(severity => {
    if (bySeverity[severity].length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${severity.toUpperCase()} PRIORITY ISSUES`);
      console.log('='.repeat(80));
      
      bySeverity[severity].forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}:${issue.line}`);
        console.log(`   Context: ${issue.context}`);
        console.log(`   Dark Background: ${issue.isDarkBackground ? 'Yes ✓' : 'No ✗'}`);
        console.log(`   Line: ${issue.lineContent.substring(0, 100)}${issue.lineContent.length > 100 ? '...' : ''}`);
        
        if (issue.fix) {
          console.log(`   Recommendation:`);
          console.log(`     - ${issue.fix.description}`);
          if (!issue.isDarkBackground) {
            console.log(`     - Replace with: ${issue.fix.onLight}`);
          } else {
            console.log(`     - Current usage is appropriate for dark background`);
          }
        }
      });
    }
  });
  
  // Summary by file
  console.log(`\n${'='.repeat(80)}`);
  console.log('ISSUES BY FILE');
  console.log('='.repeat(80));
  
  const byFile = {};
  results.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([file, issues]) => {
      console.log(`\n${file}: ${issues.length} issue(s)`);
      issues.forEach(issue => {
        console.log(`  - Line ${issue.line}: ${issue.context} ${!issue.isDarkBackground ? '⚠️  NEEDS FIX' : '✓'}`);
      });
    });
  
  // Generate JSON report
  const reportPath = path.join(process.cwd(), 'text-visibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalIssues: results.length,
    bySeverity: {
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length
    },
    issues: results
  }, null, 2));
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Full report saved to: ${reportPath}`);
  console.log('='.repeat(80));
}

// Run the scan
console.log('Scanning for text visibility issues...\n');
const srcPath = path.join(process.cwd(), 'src');
const results = scanDirectory(srcPath);
generateReport(results);

// Exit with error code if high priority issues found
const highPriorityIssues = results.filter(r => r.severity === 'high' && !r.isDarkBackground);
if (highPriorityIssues.length > 0) {
  console.log(`\n⚠️  Found ${highPriorityIssues.length} high priority text visibility issues that need fixing!`);
  process.exit(1);
} else {
  console.log('\n✓ No critical text visibility issues found!');
  process.exit(0);
}
