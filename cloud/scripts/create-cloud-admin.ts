#!/usr/bin/env ts-node

/**
 * Script to create admin user with specified credentials
 * Usage: npx tsx scripts/create-cloud-admin.ts
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Admin credentials
const ADMIN_EMAIL = 'Admin@cloudcertification.ai'
const ADMIN_NAME = 'Cloud Certification Admin'
const ADMIN_PASSWORD = 'Cloudcertification@2026'

async function createAdminUser() {
  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  })

  // Create adapter
  const adapter = new PrismaPg(pool)

  // Create Prisma client
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('\n🔐 Creating Cloud Certification Admin User\n')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })

    if (existingUser) {
      console.log(`✅ User with email ${ADMIN_EMAIL} already exists`)
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Role: ${existingUser.role}`)
      
      if (existingUser.role !== 'ADMIN') {
        console.log('\n⚠️  Updating user role to ADMIN...')
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' }
        })
        console.log('✅ User role updated to ADMIN')
      }
      
      // Update password
      console.log('\n🔒 Updating password...')
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Password updated')
      
      return
    }

    // Hash password
    console.log('🔒 Hashing password...')
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

    // Create user
    console.log('👤 Creating admin user...')
    const user = await prisma.user.create({
      data: {
        id: createId(),
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
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
    console.log('\n📋 Login Credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('\n🌐 Admin Panel: http://localhost:3001')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

createAdminUser()
