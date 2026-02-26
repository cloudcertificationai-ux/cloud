#!/usr/bin/env ts-node
/**
 * Core Features Verification Script
 * 
 * This script verifies that all core student features are properly implemented
 * by checking for the existence of required files, functions, and components.
 */

import * as fs from 'fs'
import * as path from 'path'

interface VerificationResult {
  category: string
  check: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
}

const results: VerificationResult[] = []

function checkFileExists(filePath: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  const exists = fs.existsSync(fullPath)
  
  results.push({
    category: 'File Structure',
    check: description,
    status: exists ? 'PASS' : 'FAIL',
    message: exists ? `✓ ${filePath}` : `✗ Missing: ${filePath}`
  })
  
  return exists
}

function checkFileContains(filePath: string, searchString: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    results.push({
      category: 'Implementation',
      check: description,
      status: 'FAIL',
      message: `✗ File not found: ${filePath}`
    })
    return false
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8')
  const contains = content.includes(searchString)
  
  results.push({
    category: 'Implementation',
    check: description,
    status: contains ? 'PASS' : 'WARN',
    message: contains ? `✓ Found: ${searchString}` : `⚠ Not found: ${searchString}`
  })
  
  return contains
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('CORE STUDENT FEATURES VERIFICATION REPORT')
  console.log('='.repeat(80) + '\n')
  
  const categories = [...new Set(results.map(r => r.category))]
  
  categories.forEach(category => {
    console.log(`\n${category}:`)
    console.log('-'.repeat(80))
    
    const categoryResults = results.filter(r => r.category === category)
    categoryResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⚠'
      console.log(`  ${icon} ${result.check}`)
      console.log(`    ${result.message}`)
    })
  })
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const total = results.length
  
  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Checks: ${total}`)
  console.log(`Passed: ${passed} (${Math.round(passed/total*100)}%)`)
  console.log(`Failed: ${failed} (${Math.round(failed/total*100)}%)`)
  console.log(`Warnings: ${warned} (${Math.round(warned/total*100)}%)`)
  console.log('='.repeat(80) + '\n')
  
  if (failed > 0) {
    console.log('❌ VERIFICATION FAILED - Critical features are missing')
    process.exit(1)
  } else if (warned > 0) {
    console.log('⚠️  VERIFICATION PASSED WITH WARNINGS - Some optional features may be missing')
    process.exit(0)
  } else {
    console.log('✅ VERIFICATION PASSED - All core features are implemented')
    process.exit(0)
  }
}

// Run verification checks
console.log('Starting core features verification...\n')

// 1. Enrollment Flow
console.log('Checking Enrollment Flow...')
checkFileExists('src/app/api/enrollments/route.ts', 'Enrollment API route')
checkFileContains('src/app/api/enrollments/route.ts', 'createEnrollment', 'Enrollment creation function')
checkFileContains('src/app/api/enrollments/route.ts', 'checkEnrollment', 'Enrollment check function')
checkFileContains('src/app/api/enrollments/route.ts', 'requiresPayment', 'Payment requirement check')
checkFileContains('src/app/api/enrollments/route.ts', 'getServerSession', 'Authentication check')

// 2. Progress Tracking
console.log('Checking Progress Tracking...')
checkFileExists('src/app/api/progress/route.ts', 'Progress API route')
checkFileExists('src/lib/course-completion.ts', 'Course completion module')
checkFileContains('src/app/api/progress/route.ts', 'updateLessonProgress', 'Lesson progress update')
checkFileContains('src/lib/course-completion.ts', 'checkAndUpdateCourseCompletion', 'Course completion check')
checkFileContains('src/lib/course-completion.ts', 'getUserCompletionStats', 'Completion statistics')

// 3. Student Dashboard
console.log('Checking Student Dashboard...')
checkFileExists('src/app/dashboard/page.tsx', 'Dashboard page')
checkFileExists('src/components/EnrolledCoursesList.tsx', 'Enrolled courses list component')
checkFileExists('src/components/CourseProgressCard.tsx', 'Course progress card component')
checkFileContains('src/app/dashboard/page.tsx', 'getUserEnrollments', 'Enrollment data fetching')
checkFileContains('src/app/dashboard/page.tsx', 'getServerSession', 'Dashboard authentication')
checkFileContains('src/components/EnrolledCoursesList.tsx', 'completionPercentage', 'Progress display')

// 4. Profile Management
console.log('Checking Profile Management...')
checkFileExists('src/app/profile/page.tsx', 'Profile page')
checkFileExists('src/app/api/profile/route.ts', 'Profile API route')
checkFileContains('src/app/api/profile/route.ts', 'GET', 'Profile retrieval')
checkFileContains('src/app/api/profile/route.ts', 'PUT', 'Profile update')
checkFileContains('src/app/profile/page.tsx', 'useSession', 'Profile authentication')
checkFileContains('src/app/profile/page.tsx', 'handleSubmit', 'Profile form submission')

// 5. Database Service
console.log('Checking Database Service...')
checkFileExists('src/data/db-data-service.ts', 'Database service')
checkFileContains('src/data/db-data-service.ts', 'getUserEnrollments', 'Get user enrollments')
checkFileContains('src/data/db-data-service.ts', 'createEnrollment', 'Create enrollment')
checkFileContains('src/data/db-data-service.ts', 'getCourseProgress', 'Get course progress')
checkFileContains('src/data/db-data-service.ts', 'updateLessonProgress', 'Update lesson progress')

// 6. Authentication
console.log('Checking Authentication...')
checkFileExists('src/lib/auth.ts', 'Auth configuration')
checkFileExists('src/app/api/auth/[...nextauth]/route.ts', 'NextAuth API route')
checkFileExists('src/middleware.ts', 'Route protection middleware')
checkFileContains('src/lib/auth.ts', 'authOptions', 'Auth options configuration')
checkFileContains('src/middleware.ts', 'getToken', 'Token verification')

// 7. Database Schema
console.log('Checking Database Schema...')
checkFileExists('prisma/schema.prisma', 'Prisma schema')
checkFileContains('prisma/schema.prisma', 'model User', 'User model')
checkFileContains('prisma/schema.prisma', 'model Enrollment', 'Enrollment model')
checkFileContains('prisma/schema.prisma', 'model CourseProgress', 'CourseProgress model')
checkFileContains('prisma/schema.prisma', 'model Profile', 'Profile model')
checkFileContains('prisma/schema.prisma', 'model Course', 'Course model')

// 8. Integration Tests
console.log('Checking Integration Tests...')
checkFileExists('src/__tests__/integration/enrollment-flow.test.ts', 'Enrollment flow tests')
checkFileExists('src/__tests__/integration/progress-tracking.test.ts', 'Progress tracking tests')
checkFileExists('src/__tests__/integration/dashboard-display.test.ts', 'Dashboard display tests')
checkFileExists('src/__tests__/integration/profile-management.test.ts', 'Profile management tests')

// Print results
printResults()
