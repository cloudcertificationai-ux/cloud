#!/usr/bin/env ts-node

/**
 * Script to create a default admin user for quick setup
 * Usage: npx ts-node scripts/create-default-admin.ts
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
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

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@anywheredoor.com',
  name: 'Admin User',
  password: 'Admin@123456', // Change this after first login!
}

async function createDefaultAdmin() {
  try {
    console.log('\n🔐 Creating Default Admin User\n')
    console.log('Default Credentials:')
    console.log(`  Email: ${DEFAULT_ADMIN.email}`)
    console.log(`  Password: ${DEFAULT_ADMIN.password}`)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN.email }
    })

    if (existingUser) {
      console.log(`ℹ️  Admin user already exists with email: ${DEFAULT_ADMIN.email}`)
      console.log(`   User ID: ${existingUser.id}`)
      console.log(`   Role: ${existingUser.role}`)
      
      if (existingUser.role !== 'ADMIN') {
        console.log('\n⚠️  Warning: Existing user is not an admin. Updating role...')
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' }
        })
        console.log('✅ User role updated to ADMIN')
      }
      
      console.log('\nYou can sign in with the existing credentials.')
      process.exit(0)
    }

    // Hash password
    console.log('🔒 Hashing password...')
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12)

    // Create user
    console.log('👤 Creating admin user...')
    const user = await prisma.user.create({
      data: {
        id: createId(),
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
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
          createdBy: 'default-admin-script'
        }
      }
    })

    console.log('\n✅ Default admin user created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`  Email:    ${user.email}`)
    console.log(`  Password: ${DEFAULT_ADMIN.password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🔗 Admin Panel URL: http://localhost:3001')
    console.log('\n⚠️  SECURITY REMINDER:')
    console.log('   1. Change the default password immediately after first login')
    console.log('   2. Never use these credentials in production')
    console.log('   3. Create unique admin accounts for each administrator')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

createDefaultAdmin()
