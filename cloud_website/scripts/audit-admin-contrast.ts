/**
 * Admin Panel Contrast Audit Script
 * 
 * Audits all admin panel pages for WCAG 2.1 Level AA contrast compliance.
 * Checks text colors against their backgrounds and reports issues.
 */

import { checkContrast } from '../src/lib/contrast-checker';

interface ContrastIssue {
  page: string;
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
  severity: 'critical' | 'warning';
  location: string;
}

const issues: ContrastIssue[] = [];

// Helper to add issue
function addIssue(
  page: string,
  element: string,
  fg: string,
  bg: string,
  location: string,
  isLargeText = false
) {
  const result = checkContrast(fg, bg);
  const passes = isLargeText ? result.passes.aaLarge : result.passes.aa;
  
  if (!passes) {
    issues.push({
      page,
      element,
      foreground: fg,
      background: bg,
      ratio: result.ratio,
      passes,
      severity: result.ratio < 3.0 ? 'critical' : 'warning',
      location,
    });
  }
}

// Audit Dashboard Page
function auditDashboard() {
  const page = 'Admin Dashboard (/admin/dashboard)';
  
  // Check text-navy-600 on white background
  addIssue(page, 'Description text', '#475569', '#ffffff', 'Welcome message description');
  
  // Check text-navy-500 on white background
  addIssue(page, 'Live data indicator text', '#64748b', '#ffffff', 'Live data status text');
  
  // Check text-navy-700 on white background
  addIssue(page, 'Stat card labels', '#334155', '#ffffff', 'Stat card name labels');
  
  // Check text-navy-800 on white background
  addIssue(page, 'Stat card values', '#1e293b', '#ffffff', 'Stat card value text');
  
  // Check text-navy-500 on white background
  addIssue(page, 'Stat card comparison text', '#64748b', '#ffffff', '"vs last month" text');
  
  // Check text-navy-600 on white background (FIXED: was navy-400)
  addIssue(page, 'Icon colors', '#475569', '#ffffff', 'EyeIcon in chart header');
}

// Audit Courses Page
function auditCoursesPage() {
  const page = 'Course Management (/admin/courses)';
  
  // Check text-navy-700 on white background (table headers)
  addIssue(page, 'Table header text', '#334155', '#ffffff', 'Table column headers');
  
  // Check text-navy-800 on white background (table data)
  addIssue(page, 'Table data text', '#1e293b', '#ffffff', 'Course title and price');
  
  // Check text-navy-500 on white background (summary text)
  addIssue(page, 'Course summary text', '#64748b', '#ffffff', 'Course summary in table');
  
  // Check text-navy-600 on white background (FIXED: was navy-400)
  addIssue(page, 'Action icon colors', '#475569', '#ffffff', 'Edit/Delete/View icons');
}

// Audit Students Page
function auditStudentsPage() {
  const page = 'Student Management (/admin/students)';
  
  // Most text uses standard gray colors which should pass
  // Check any custom navy colors
  addIssue(page, 'Table header text', '#6b7280', '#f9fafb', 'Table headers on gray-50 background');
}

// Audit Analytics Page
function auditAnalyticsPage() {
  const page = 'Analytics (/admin/analytics)';
  
  // Check text-gray-600 on white background
  addIssue(page, 'Stat card labels', '#4b5563', '#ffffff', 'Stat card name labels');
  
  // Check text-gray-900 on white background
  addIssue(page, 'Stat card values', '#111827', '#ffffff', 'Stat card value text');
  
  // Check text-gray-500 on white background
  addIssue(page, 'Stat card sublabels', '#6b7280', '#ffffff', 'Stat card sublabel text');
}

// Audit Curriculum Builder
function auditCurriculumBuilder() {
  const page = 'Curriculum Builder (Component)';
  
  // Check text-gray-900 on white background
  addIssue(page, 'Module title text', '#111827', '#ffffff', 'Module title in header');
  
  // Check text-gray-600 on white background
  addIssue(page, 'Description text', '#4b5563', '#ffffff', 'Drag and drop instruction');
  
  // Check text-gray-500 on white background
  addIssue(page, 'Lesson count text', '#6b7280', '#ffffff', 'Lesson count in module header');
  
  // Check text-gray-600 on white background (FIXED: was gray-400)
  addIssue(page, 'Drag handle icons', '#4b5563', '#ffffff', 'Bars3Icon drag handles');
  
  // Check text-gray-600 on gray-50 background (lesson icons)
  addIssue(page, 'Lesson type icons', '#4b5563', '#f9fafb', 'Video/Article/Quiz icons');
}

// Audit Media Manager
function auditMediaManager() {
  const page = 'Media Manager (Component)';
  
  // Check text-gray-900 on white background
  addIssue(page, 'Section heading', '#111827', '#ffffff', 'Media Library heading');
  
  // Check text-gray-700 on gray-200 background (filter buttons)
  addIssue(page, 'Filter button text', '#374151', '#e5e7eb', 'Inactive filter buttons');
  
  // Check text-gray-600 on white background
  addIssue(page, 'Filename text', '#4b5563', '#ffffff', 'Media filename in grid');
  
  // Check text-gray-500 on white background
  addIssue(page, 'Date text', '#6b7280', '#ffffff', 'Upload date in media grid');
}

// Run all audits
auditDashboard();
auditCoursesPage();
auditStudentsPage();
auditAnalyticsPage();
auditCurriculumBuilder();
auditMediaManager();

// Report results
console.log('\n=== ADMIN PANEL CONTRAST AUDIT RESULTS ===\n');

if (issues.length === 0) {
  console.log('✅ No contrast issues found! All text meets WCAG 2.1 Level AA standards.\n');
} else {
  console.log(`❌ Found ${issues.length} contrast issues:\n`);
  
  // Group by page
  const byPage = issues.reduce((acc, issue) => {
    if (!acc[issue.page]) acc[issue.page] = [];
    acc[issue.page].push(issue);
    return acc;
  }, {} as Record<string, ContrastIssue[]>);
  
  Object.entries(byPage).forEach(([page, pageIssues]) => {
    console.log(`\n📄 ${page}`);
    console.log('─'.repeat(80));
    
    pageIssues.forEach((issue, idx) => {
      const icon = issue.severity === 'critical' ? '🔴' : '⚠️';
      console.log(`\n${icon} Issue ${idx + 1}: ${issue.element}`);
      console.log(`   Location: ${issue.location}`);
      console.log(`   Foreground: ${issue.foreground}`);
      console.log(`   Background: ${issue.background}`);
      console.log(`   Contrast Ratio: ${issue.ratio}:1 (needs 4.5:1)`);
      console.log(`   Severity: ${issue.severity.toUpperCase()}`);
    });
  });
  
  console.log('\n\n=== SUMMARY ===');
  console.log(`Total Issues: ${issues.length}`);
  console.log(`Critical: ${issues.filter(i => i.severity === 'critical').length}`);
  console.log(`Warnings: ${issues.filter(i => i.severity === 'warning').length}`);
}

console.log('\n');
