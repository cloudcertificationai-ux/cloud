#!/usr/bin/env ts-node

/**
 * Script to reset an admin user's password
 * Usage: npx ts-node scripts/reset-admin-password.ts
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'
import { createId } from '@paralleldrive/cuid2'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})

// Create adapter
const adapter = new PrismaPg(pool)

// Create Prisma client
const prisma = new PrismaClient({ adapter })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function resetAdminPassword() {
  try {
    console.log('\n🔐 Admin Password Reset Tool\n')

    // Get user email
    const email = await question('Enter admin email to reset: ')

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    if (user.role !== 'ADMIN') {
      console.error(`❌ User ${email} is not an admin (role: ${user.role})`)
      const proceed = await question('Do you want to proceed anyway? (yes/no): ')
      if (proceed.toLowerCase() !== 'yes') {
        console.log('Operation cancelled')
        process.exit(0)
      }
    }

    console.log(`\nFound user: ${user.name} (${user.email})`)
    console.log(`Role: ${user.role}`)

    // Get new password
    const newPassword = await question('\nEnter new password (min 8 characters): ')
    const confirmPassword = await question('Confirm new password: ')

    // Validate password
    if (newPassword.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    if (newPassword !== confirmPassword) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    // Hash password
    console.log('\n🔒 Hashing new password...')
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    console.log('💾 Updating password...')
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: user.id,
        action: 'PASSWORD_RESET',
        resourceType: 'User',
        resourceId: user.id,
        details: {
          email: user.email,
          resetBy: 'script',
          timestamp: new Date().toISOString()
        }
      }
    })

    console.log('\n✅ Password reset successfully!')
    console.log('\n📋 Updated Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Email:    ${user.email}`)
    console.log(`  Password: ${newPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nYou can now sign in with the new password.')

  } catch (error) {
    console.error('\n❌ Error resetting password:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
    await pool.end()
  }
}

resetAdminPassword()
