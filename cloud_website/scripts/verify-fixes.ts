/**
 * Verify Contrast Fixes
 * 
 * Verifies that the contrast fixes meet WCAG 2.1 Level AA standards
 */

import { checkContrast } from '../src/lib/contrast-checker';

console.log('🔍 Verifying Contrast Fixes...\n');

// Dashboard icons - changed from -600 to -700
const fixes = [
  {
    name: 'Primary icon (blue-700 on blue-100)',
    fg: '#1d4ed8', // blue-700
    bg: '#dbeafe', // blue-100
    isLargeText: false
  },
  {
    name: 'Success icon (green-700 on green-100)',
    fg: '#15803d', // green-700
    bg: '#dcfce7', // green-100
    isLargeText: false
  },
  {
    name: 'Accent icon (amber-700 on amber-100)',
    fg: '#b45309', // amber-700
    bg: '#fef3c7', // amber-100
    isLargeText: false
  }
];

let allPass = true;

fixes.forEach(fix => {
  const result = checkContrast(fix.fg, fix.bg);
  const passes = fix.isLargeText ? result.passes.aaLarge : result.passes.aa;
  const required = fix.isLargeText ? 3.0 : 4.5;
  
  console.log(`${fix.name}:`);
  console.log(`  Foreground: ${fix.fg}`);
  console.log(`  Background: ${fix.bg}`);
  console.log(`  Ratio: ${result.ratio}:1 (Required: ${required}:1)`);
  console.log(`  Status: ${passes ? '✅ PASS' : '❌ FAIL'}\n`);
  
  if (!passes) {
    allPass = false;
  }
});

if (allPass) {
  console.log('✅ All fixes meet WCAG 2.1 Level AA standards!');
  process.exit(0);
} else {
  console.log('❌ Some fixes still fail WCAG 2.1 Level AA standards');
  process.exit(1);
}
