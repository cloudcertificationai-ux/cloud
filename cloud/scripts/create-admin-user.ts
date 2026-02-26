#!/usr/bin/env ts-node

/**
 * Script to create an admin user with email/password authentication
 * Usage: npx ts-node scripts/create-admin-user.ts
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

async function createAdminUser() {
  try {
    console.log('\n🔐 Admin User Creation Tool\n')
    console.log('This script will create a new admin user with email/password authentication.\n')

    // Get user input
    const email = await question('Enter admin email: ')
    const name = await question('Enter admin name: ')
    const password = await question('Enter password (min 8 characters): ')
    const confirmPassword = await question('Confirm password: ')

    // Validate input
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }

    if (!name) {
      console.error('❌ Name is required')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    console.log('\n🔒 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('👤 Creating admin user...')
    const user = await prisma.user.create({
      data: {
        id: createId(),
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: user.id,
        action: 'ADMIN_USER_CREATED',
        resourceType: 'User',
        resourceId: user.id,
        details: {
          email: user.email,
          name: user.name,
          createdBy: 'script'
        }
      }
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('\nUser Details:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log('\nYou can now sign in to the admin panel with these credentials.')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
    await pool.end()
  }
}

createAdminUser()
