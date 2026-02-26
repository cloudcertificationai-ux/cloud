#!/usr/bin/env tsx
/**
 * Authentication System Verification Script
 * 
 * This script verifies the authentication system setup without requiring
 * actual OAuth credentials or a running application.
 * 
 * Usage: npx tsx scripts/verify-auth-setup.ts
 */

import fs from 'fs'
import path from 'path'

interface VerificationResult {
  category: string
  test: string
  passed: boolean
  message: string
  details?: string
}

const results: VerificationResult[] = []

function addResult(category: string, test: string, passed: boolean, message: string, details?: string) {
  results.push({ category, test, passed, message, details })
}

function checkFileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function checkFileContains(filePath: string, searchString: string): boolean {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
    return content.includes(searchString)
  } catch {
    return false
  }
}

function checkEnvVariable(varName: string): boolean {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return false
  
  const content = fs.readFileSync(envPath, 'utf-8')
  return content.includes(`${varName}=`)
}

console.log('🔍 Authentication System Verification\n')
console.log('=' .repeat(60))

// Category 1: File Structure
console.log('\n📁 Checking File Structure...')

const requiredFiles = [
  'src/lib/auth.ts',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/middleware.ts',
  'src/app/auth/signin/page.tsx',
  'src/components/SessionProvider.tsx',
  'prisma/schema.prisma',
  '.env',
]

requiredFiles.forEach(file => {
  const exists = checkFileExists(file)
  addResult(
    'File Structure',
    `File exists: ${file}`,
    exists,
    exists ? '✅ Found' : '❌ Missing'
  )
})

// Category 2: Authentication Configuration
console.log('\n🔐 Checking Authentication Configuration...')

const authChecks = [
  {
    file: 'src/lib/auth.ts',
    checks: [
      { name: 'NextAuthOptions', search: 'NextAuthOptions' },
      { name: 'PrismaAdapter', search: 'PrismaAdapter' },
      { name: 'GoogleProvider', search: 'GoogleProvider' },
      { name: 'AppleProvider', search: 'AppleProvider' },
      { name: 'Auth0Provider', search: 'Auth0Provider' },
      { name: 'Session strategy', search: "strategy: 'database'" },
      { name: 'Session maxAge', search: 'maxAge: 24 * 60 * 60' },
      { name: 'JWT callback', search: 'async jwt(' },
      { name: 'Session callback', search: 'async session(' },
      { name: 'SignIn callback', search: 'async signIn(' },
    ]
  },
  {
    file: 'src/middleware.ts',
    checks: [
      { name: 'Protected routes', search: 'PROTECTED_ROUTES' },
      { name: 'Admin routes', search: 'ADMIN_ROUTES' },
      { name: 'Inactivity timeout', search: 'INACTIVITY_TIMEOUT' },
      { name: 'getToken', search: 'getToken' },
      { name: 'Role check', search: 'userRole' },
    ]
  },
  {
    file: 'src/app/auth/signin/page.tsx',
    checks: [
      { name: 'Google sign in', search: "signIn('google'" },
      { name: 'Apple sign in', search: "signIn('apple'" },
      { name: 'Auth0 sign in', search: "signIn('auth0'" },
      { name: 'Error handling', search: 'error' },
      { name: 'Loading states', search: 'isLoading' },
    ]
  }
]

authChecks.forEach(({ file, checks }) => {
  checks.forEach(({ name, search }) => {
    const found = checkFileContains(file, search)
    addResult(
      'Authentication Config',
      `${file}: ${name}`,
      found,
      found ? '✅ Configured' : '❌ Missing'
    )
  })
})

// Category 3: Environment Variables
console.log('\n🌍 Checking Environment Variables...')

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_ISSUER',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'APPLE_ID',
  'APPLE_SECRET',
]

requiredEnvVars.forEach(varName => {
  const exists = checkEnvVariable(varName)
  addResult(
    'Environment Variables',
    varName,
    exists,
    exists ? '✅ Defined' : '⚠️  Not defined (may need configuration)'
  )
})

// Category 4: Database Schema
console.log('\n🗄️  Checking Database Schema...')

const schemaChecks = [
  { name: 'User model', search: 'model User {' },
  { name: 'Account model', search: 'model Account {' },
  { name: 'Session model', search: 'model Session {' },
  { name: 'VerificationToken model', search: 'model VerificationToken {' },
  { name: 'Profile model', search: 'model Profile {' },
  { name: 'UserRole enum', search: 'enum UserRole {' },
  { name: 'lastLoginAt field', search: 'lastLoginAt' },
  { name: 'lastActivity field', search: 'lastActivity' },
  { name: 'PrismaAdapter models', search: '@next-auth/prisma-adapter' },
]

schemaChecks.forEach(({ name, search }) => {
  const found = checkFileContains('prisma/schema.prisma', search)
  addResult(
    'Database Schema',
    name,
    found,
    found ? '✅ Defined' : '❌ Missing'
  )
})

// Category 5: Session Provider
console.log('\n🔄 Checking Session Provider Setup...')

const sessionProviderChecks = [
  {
    file: 'src/components/SessionProvider.tsx',
    name: 'SessionProvider component',
    search: 'SessionProvider'
  },
  {
    file: 'src/app/layout.tsx',
    name: 'SessionProvider in layout',
    search: '<SessionProvider>'
  },
]

sessionProviderChecks.forEach(({ file, name, search }) => {
  const found = checkFileContains(file, search)
  addResult(
    'Session Provider',
    name,
    found,
    found ? '✅ Configured' : '❌ Missing'
  )
})

// Category 6: Route Protection
console.log('\n🛡️  Checking Route Protection...')

const protectionChecks = [
  { name: 'Middleware exports', search: 'export async function middleware' },
  { name: 'Middleware config', search: 'export const config' },
  { name: 'Dashboard protection', search: '/dashboard' },
  { name: 'Profile protection', search: '/profile' },
  { name: 'Admin protection', search: '/admin' },
  { name: 'Redirect to signin', search: '/auth/signin' },
  { name: 'Callback URL', search: 'callbackUrl' },
]

protectionChecks.forEach(({ name, search }) => {
  const found = checkFileContains('src/middleware.ts', search)
  addResult(
    'Route Protection',
    name,
    found,
    found ? '✅ Implemented' : '❌ Missing'
  )
})

// Print Results
console.log('\n' + '='.repeat(60))
console.log('\n📊 Verification Results\n')

const categories = [...new Set(results.map(r => r.category))]

categories.forEach(category => {
  const categoryResults = results.filter(r => r.category === category)
  const passed = categoryResults.filter(r => r.passed).length
  const total = categoryResults.length
  const percentage = Math.round((passed / total) * 100)
  
  console.log(`\n${category}: ${passed}/${total} (${percentage}%)`)
  console.log('-'.repeat(60))
  
  categoryResults.forEach(result => {
    console.log(`  ${result.message} ${result.test}`)
    if (result.details) {
      console.log(`    ${result.details}`)
    }
  })
})

// Summary
const totalPassed = results.filter(r => r.passed).length
const totalTests = results.length
const overallPercentage = Math.round((totalPassed / totalTests) * 100)

console.log('\n' + '='.repeat(60))
console.log('\n📈 Overall Summary\n')
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${totalPassed}`)
console.log(`Failed: ${totalTests - totalPassed}`)
console.log(`Success Rate: ${overallPercentage}%`)

if (overallPercentage === 100) {
  console.log('\n✅ All verification checks passed!')
  console.log('\n📝 Next Steps:')
  console.log('   1. Ensure database is running (PostgreSQL)')
  console.log('   2. Run: npx prisma db push')
  console.log('   3. Configure OAuth credentials in .env')
  console.log('   4. Start dev server: npm run dev')
  console.log('   5. Test authentication manually using the checklist')
  console.log('   6. See: AUTHENTICATION_VERIFICATION_CHECKLIST.md')
} else if (overallPercentage >= 80) {
  console.log('\n⚠️  Most checks passed, but some items need attention')
  console.log('\n📝 Review failed checks above and address any missing components')
} else {
  console.log('\n❌ Several checks failed - authentication system needs work')
  console.log('\n📝 Review the failed checks above and implement missing components')
}

console.log('\n' + '='.repeat(60))

// Exit with appropriate code
process.exit(overallPercentage === 100 ? 0 : 1)
