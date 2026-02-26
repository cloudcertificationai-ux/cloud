#!/usr/bin/env ts-node
/**
 * Admin Authentication Setup Verification Script
 * 
 * This script verifies that the admin authentication setup is complete and working.
 * Run with: npx ts-node scripts/verify-admin-auth.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

const results: CheckResult[] = []

async function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ]

  const optionalVars = [
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'AUTH0_ISSUER',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'APPLE_ID',
    'APPLE_SECRET',
  ]

  let allRequired = true
  let hasAtLeastOneProvider = false

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      results.push({
        name: `Environment Variable: ${varName}`,
        status: 'fail',
        message: `Missing required environment variable: ${varName}`,
      })
      allRequired = false
    } else {
      results.push({
        name: `Environment Variable: ${varName}`,
        status: 'pass',
        message: `${varName} is set`,
      })
    }
  }

  // Check if at least one auth provider is configured
  if (process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_ISSUER) {
    hasAtLeastOneProvider = true
    results.push({
      name: 'Auth Provider: Auth0',
      status: 'pass',
      message: 'Auth0 is configured',
    })
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    hasAtLeastOneProvider = true
    results.push({
      name: 'Auth Provider: Google',
      status: 'pass',
      message: 'Google OAuth is configured',
    })
  }

  if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
    hasAtLeastOneProvider = true
    results.push({
      name: 'Auth Provider: Apple',
      status: 'pass',
      message: 'Apple Sign In is configured',
    })
  }

  if (!hasAtLeastOneProvider) {
    results.push({
      name: 'Auth Providers',
      status: 'fail',
      message: 'No authentication providers configured. Configure at least one: Auth0, Google, or Apple',
    })
  }

  return allRequired && hasAtLeastOneProvider
}

async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    results.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database',
    })
    return true
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return false
  }
}

async function checkPrismaModels() {
  try {
    // Check if User model exists and has role field
    const userCount = await prisma.user.count()
    results.push({
      name: 'Prisma Model: User',
      status: 'pass',
      message: `User model exists (${userCount} users in database)`,
    })

    // Check if Account model exists (NextAuth)
    const accountCount = await prisma.account.count()
    results.push({
      name: 'Prisma Model: Account',
      status: 'pass',
      message: `Account model exists (${accountCount} accounts in database)`,
    })

    // Check if Session model exists (NextAuth)
    const sessionCount = await prisma.session.count()
    results.push({
      name: 'Prisma Model: Session',
      status: 'pass',
      message: `Session model exists (${sessionCount} active sessions)`,
    })

    // Check if AuditLog model exists
    const auditLogCount = await prisma.auditLog.count()
    results.push({
      name: 'Prisma Model: AuditLog',
      status: 'pass',
      message: `AuditLog model exists (${auditLogCount} audit logs)`,
    })

    return true
  } catch (error) {
    results.push({
      name: 'Prisma Models',
      status: 'fail',
      message: `Failed to query Prisma models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return false
  }
}

async function checkAdminUsers() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (adminUsers.length === 0) {
      results.push({
        name: 'Admin Users',
        status: 'warning',
        message: 'No admin users found. Create at least one admin user to test authentication.',
      })
    } else {
      results.push({
        name: 'Admin Users',
        status: 'pass',
        message: `Found ${adminUsers.length} admin user(s): ${adminUsers.map(u => u.email).join(', ')}`,
      })
    }

    return true
  } catch (error) {
    results.push({
      name: 'Admin Users',
      status: 'fail',
      message: `Failed to query admin users: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return false
  }
}

async function checkAuthFiles() {
  const fs = require('fs')
  const path = require('path')

  const requiredFiles = [
    'src/lib/auth.ts',
    'src/lib/role-management.ts',
    'src/app/api/auth/[...nextauth]/route.ts',
    'src/app/auth/signin/page.tsx',
    'src/app/auth/error/page.tsx',
    'src/middleware.ts',
  ]

  let allFilesExist = true

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      results.push({
        name: `File: ${file}`,
        status: 'pass',
        message: `File exists`,
      })
    } else {
      results.push({
        name: `File: ${file}`,
        status: 'fail',
        message: `File not found: ${file}`,
      })
      allFilesExist = false
    }
  }

  return allFilesExist
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('Admin Authentication Setup Verification')
  console.log('='.repeat(80) + '\n')

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}\n`)
  }

  console.log('='.repeat(80))
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`)
  console.log('='.repeat(80) + '\n')

  if (failed > 0) {
    console.log('❌ Verification failed. Please fix the issues above.\n')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('⚠️  Verification passed with warnings. Review the warnings above.\n')
    process.exit(0)
  } else {
    console.log('✅ All checks passed! Admin authentication is properly configured.\n')
    console.log('Next steps:')
    console.log('1. Start the admin panel: npm run dev')
    console.log('2. Navigate to http://localhost:3001/auth/signin')
    console.log('3. Sign in with an admin account\n')
    process.exit(0)
  }
}

async function main() {
  console.log('Starting verification...\n')

  await checkEnvironmentVariables()
  const dbConnected = await checkDatabaseConnection()

  if (dbConnected) {
    await checkPrismaModels()
    await checkAdminUsers()
  }

  checkAuthFiles()

  printResults()
}

main()
  .catch((error) => {
    console.error('Verification failed with error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
