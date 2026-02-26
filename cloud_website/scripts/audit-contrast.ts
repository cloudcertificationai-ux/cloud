/**
 * Contrast Audit Script
 * 
 * Audits all student app pages for WCAG 2.1 Level AA contrast compliance
 * Requirements: 5.1, 5.2, 5.3, 5.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { checkContrast } from '../src/lib/contrast-checker';

interface ContrastIssue {
  page: string;
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  severity: 'critical' | 'warning';
  fix: string;
}

const issues: ContrastIssue[] = [];

// Helper to add issue
function addIssue(
  page: string,
  element: string,
  fg: string,
  bg: string,
  isLargeText: boolean,
  fix: string
) {
  const result = checkContrast(fg, bg);
  const required = isLargeText ? 3.0 : 4.5;
  const passes = isLargeText ? result.passes.aaLarge : result.passes.aa;
  
  if (!passes) {
    issues.push({
      page,
      element,
      foreground: fg,
      background: bg,
      ratio: result.ratio,
      required,
      severity: result.ratio < 3.0 ? 'critical' : 'warning',
      fix
    });
  }
}

console.log('🔍 Auditing Student App Pages for Contrast Issues...\n');

// ============================================================================
// HOME PAGE (/)
// ============================================================================
console.log('📄 Auditing Home Page (/)...');

// HeroSection - gradient background with white text
addIssue(
  'Home Page',
  'Hero headline (h1) - white text on blue gradient',
  '#ffffff',
  '#1e40af', // blue-800 (darkest part of gradient)
  true, // large text
  'Current contrast is acceptable for large text'
);

addIssue(
  'Home Page',
  'Hero subheadline - white text on blue gradient',
  '#ffffff',
  '#1e40af',
  false, // normal text
  'Current contrast is acceptable'
);

// Category cards - gray text on white
addIssue(
  'Home Page',
  'Category card description - gray-600 on white',
  '#4b5563', // gray-600
  '#ffffff',
  false,
  'Current contrast is acceptable'
);

// ============================================================================
// COURSES PAGE (/courses)
// ============================================================================
console.log('📄 Auditing Courses Page (/courses)...');

// Hero section gradient
addIssue(
  'Courses Page',
  'Hero heading - gray-900 on gradient (blue-50 to indigo-100)',
  '#111827', // gray-900
  '#e0e7ff', // indigo-100 (lighter part)
  true,
  'Current contrast is acceptable'
);

addIssue(
  'Courses Page',
  'Hero description - gray-600 on gradient',
  '#4b5563', // gray-600
  '#e0e7ff',
  false,
  'Current contrast is acceptable'
);

// Category filter buttons
addIssue(
  'Courses Page',
  'Active category button - white on blue-600',
  '#ffffff',
  '#2563eb', // blue-600
  false,
  'Current contrast is acceptable'
);

addIssue(
  'Courses Page',
  'Inactive category button - gray-700 on white',
  '#374151', // gray-700
  '#ffffff',
  false,
  'Current contrast is acceptable'
);

// ============================================================================
// DASHBOARD PAGE (/dashboard)
// ============================================================================
console.log('📄 Auditing Dashboard Page (/dashboard)...');

// Header section
addIssue(
  'Dashboard Page',
  'Welcome heading - navy-800 on white',
  '#1e3a8a', // navy-800 (custom color, using blue-900 as proxy)
  '#ffffff',
  true,
  'Current contrast is acceptable'
);

addIssue(
  'Dashboard Page',
  'Subtitle - neutral-600 on white',
  '#525252', // neutral-600
  '#ffffff',
  false,
  'Current contrast is acceptable'
);

// Stats cards
addIssue(
  'Dashboard Page',
  'Stat label - neutral-600 on white',
  '#525252',
  '#ffffff',
  false,
  'Current contrast is acceptable'
);

addIssue(
  'Dashboard Page',
  'Stat value - navy-800 on white',
  '#1e3a8a',
  '#ffffff',
  true,
  'Current contrast is acceptable'
);

// Icon backgrounds
addIssue(
  'Dashboard Page',
  'Primary icon - primary-600 on primary-100',
  '#2563eb', // primary-600 (blue-600)
  '#dbeafe', // primary-100 (blue-100)
  false,
  'ISSUE: Blue-600 on blue-100 may have insufficient contrast. Use darker icon color'
);

// ============================================================================
// COURSE DETAIL PAGE (/courses/[slug])
// ============================================================================
console.log('📄 Auditing Course Detail Page (/courses/[slug])...');

// Breadcrumb
addIssue(
  'Course Detail Page',
  'Breadcrumb text - gray-600 on gray-50',
  '#4b5563',
  '#f9fafb',
  false,
  'Current contrast is acceptable'
);

// Course hero section (assuming similar to courses page)
addIssue(
  'Course Detail Page',
  'Course title - gray-900 on white',
  '#111827',
  '#ffffff',
  true,
  'Current contrast is acceptable'
);

// ============================================================================
// LESSON VIEWER PAGE (/courses/[slug]/learn)
// ============================================================================
console.log('📄 Auditing Lesson Viewer Page (/courses/[slug]/learn)...');

// Note: This page is dynamically loaded, checking common patterns
addIssue(
  'Lesson Viewer Page',
  'Lesson title - gray-900 on white',
  '#111827',
  '#ffffff',
  true,
  'Current contrast is acceptable'
);

// ============================================================================
// AUTHENTICATION PAGES (/auth/signin, /auth/error)
// ============================================================================
console.log('📄 Auditing Authentication Pages...');

// Sign in page
addIssue(
  'Sign In Page',
  'Page heading - gray-900 on gray-50',
  '#111827',
  '#f9fafb',
  true,
  'Current contrast is acceptable'
);

addIssue(
  'Sign In Page',
  'Subtitle - gray-600 on gray-50',
  '#4b5563',
  '#f9fafb',
  false,
  'Current contrast is acceptable'
);

addIssue(
  'Sign In Page',
  'Primary button - white on blue-600',
  '#ffffff',
  '#2563eb',
  false,
  'Current contrast is acceptable'
);

addIssue(
  'Sign In Page',
  'Footer text - gray-500 on gray-50',
  '#6b7280', // gray-500
  '#f9fafb',
  false,
  'ISSUE: Gray-500 on gray-50 has low contrast (3.5:1). Use gray-600 or darker'
);

addIssue(
  'Sign In Page',
  'Link text - blue-600 on gray-50',
  '#2563eb',
  '#f9fafb',
  false,
  'Current contrast is acceptable'
);

// Error page
addIssue(
  'Auth Error Page',
  'Error heading - gray-900 on gray-50',
  '#111827',
  '#f9fafb',
  true,
  'Current contrast is acceptable'
);

addIssue(
  'Auth Error Page',
  'Error description - gray-600 on gray-50',
  '#4b5563',
  '#f9fafb',
  false,
  'Current contrast is acceptable'
);

// ============================================================================
// REPORT RESULTS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('📊 CONTRAST AUDIT RESULTS');
console.log('='.repeat(80) + '\n');

const criticalIssues = issues.filter(i => i.severity === 'critical');
const warningIssues = issues.filter(i => i.severity === 'warning');

if (issues.length === 0) {
  console.log('✅ No contrast issues found! All text meets WCAG 2.1 Level AA standards.\n');
} else {
  console.log(`Found ${issues.length} contrast issue(s):\n`);
  
  if (criticalIssues.length > 0) {
    console.log(`🔴 CRITICAL ISSUES (${criticalIssues.length}):`);
    console.log('These fail WCAG 2.1 Level AA for both normal and large text\n');
    
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.page} - ${issue.element}`);
      console.log(`   Foreground: ${issue.foreground}`);
      console.log(`   Background: ${issue.background}`);
      console.log(`   Ratio: ${issue.ratio}:1 (Required: ${issue.required}:1)`);
      console.log(`   Fix: ${issue.fix}\n`);
    });
  }
  
  if (warningIssues.length > 0) {
    console.log(`⚠️  WARNING ISSUES (${warningIssues.length}):`);
    console.log('These pass for large text but fail for normal text\n');
    
    warningIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.page} - ${issue.element}`);
      console.log(`   Foreground: ${issue.foreground}`);
      console.log(`   Background: ${issue.background}`);
      console.log(`   Ratio: ${issue.ratio}:1 (Required: ${issue.required}:1)`);
      console.log(`   Fix: ${issue.fix}\n`);
    });
  }
}

console.log('='.repeat(80));
console.log('Audit complete!');
console.log('='.repeat(80) + '\n');

// Exit with error code if critical issues found
if (criticalIssues.length > 0) {
  process.exit(1);
}
