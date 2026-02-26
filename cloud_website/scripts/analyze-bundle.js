#!/usr/bin/env node

/**
 * Bundle analysis script for performance optimization
 * Analyzes the Next.js build output and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.join(__dirname, '../.next');
const STATIC_DIR = path.join(BUILD_DIR, 'static');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dir, extensions = ['.js', '.css']) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push({
          name: path.relative(BUILD_DIR, fullPath),
          size: stat.size,
          type: path.extname(item),
        });
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
  
  return files;
}

function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');
  
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const files = analyzeDirectory(STATIC_DIR);
  
  // Group by type
  const byType = files.reduce((acc, file) => {
    if (!acc[file.type]) acc[file.type] = [];
    acc[file.type].push(file);
    return acc;
  }, {});
  
  // Calculate totals
  const totals = Object.keys(byType).reduce((acc, type) => {
    acc[type] = byType[type].reduce((sum, file) => sum + file.size, 0);
    return acc;
  }, {});
  
  const totalSize = Object.values(totals).reduce((sum, size) => sum + size, 0);
  
  console.log('📊 Bundle Size Analysis');
  console.log('========================\n');
  
  // Show totals by type
  Object.entries(totals).forEach(([type, size]) => {
    const percentage = ((size / totalSize) * 100).toFixed(1);
    console.log(`${type.toUpperCase().padEnd(4)} ${formatBytes(size).padStart(10)} (${percentage}%)`);
  });
  
  console.log(`${'TOTAL'.padEnd(4)} ${formatBytes(totalSize).padStart(10)} (100%)\n`);
  
  // Show largest files
  const largestFiles = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  console.log('📈 Largest Files');
  console.log('=================\n');
  
  largestFiles.forEach((file, index) => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    console.log(`${(index + 1).toString().padStart(2)}. ${file.name}`);
    console.log(`    ${formatBytes(file.size)} (${percentage}%)\n`);
  });
  
  // Performance recommendations
  console.log('💡 Optimization Recommendations');
  console.log('================================\n');
  
  const jsSize = totals['.js'] || 0;
  const cssSize = totals['.css'] || 0;
  
  if (jsSize > 500 * 1024) { // 500KB
    console.log('⚠️  JavaScript bundle is large (>500KB)');
    console.log('   Consider code splitting and lazy loading\n');
  }
  
  if (cssSize > 100 * 1024) { // 100KB
    console.log('⚠️  CSS bundle is large (>100KB)');
    console.log('   Consider CSS optimization and purging unused styles\n');
  }
  
  const largeJSFiles = files
    .filter(f => f.type === '.js' && f.size > 100 * 1024)
    .length;
  
  if (largeJSFiles > 3) {
    console.log('⚠️  Multiple large JavaScript files detected');
    console.log('   Consider dynamic imports for non-critical code\n');
  }
  
  if (totalSize < 1024 * 1024) { // 1MB
    console.log('✅ Bundle size is within recommended limits');
  } else if (totalSize < 2 * 1024 * 1024) { // 2MB
    console.log('⚠️  Bundle size is getting large, monitor closely');
  } else {
    console.log('❌ Bundle size is too large, optimization needed');
  }
  
  console.log('\n🎯 Performance Targets');
  console.log('=======================');
  console.log('• Total bundle: < 1MB (ideal), < 2MB (acceptable)');
  console.log('• JavaScript: < 500KB');
  console.log('• CSS: < 100KB');
  console.log('• Individual files: < 100KB\n');
}

function runBundleAnalyzer() {
  console.log('🚀 Starting bundle analyzer...\n');
  
  try {
    // Set environment variable and run build with analyzer
    process.env.ANALYZE = 'true';
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to run bundle analyzer:', error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'analyze':
      runBundleAnalyzer();
      break;
    case 'size':
    default:
      analyzeBundleSize();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  runBundleAnalyzer,
  formatBytes,
};