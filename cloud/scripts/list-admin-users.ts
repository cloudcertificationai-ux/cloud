#!/usr/bin/env ts-node

/**
 * Script to list all admin users
 * Usage: npx ts-node scripts/list-admin-users.ts
 */

import 'dotenv/config'
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

async function listAdminUsers() {
  try {
    console.log('\n👥 Admin Users List\n')

    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (admins.length === 0) {
      console.log('No admin users found.')
      console.log('\nTo create an admin user, run:')
      console.log('  npx ts-node scripts/create-default-admin.ts')
      process.exit(0)
    }

    console.log(`Found ${admins.length} admin user(s):\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name || 'Unnamed'}`)
      console.log(`   Email:         ${admin.email}`)
      console.log(`   ID:            ${admin.id}`)
      console.log(`   Role:          ${admin.role}`)
      console.log(`   Created:       ${admin.createdAt.toLocaleString()}`)
      console.log(`   Last Login:    ${admin.lastLoginAt ? admin.lastLoginAt.toLocaleString() : 'Never'}`)
      console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`)
    })

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Get total user count by role
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log('\n📊 User Statistics:\n')
    roleCounts.forEach(({ role, _count }) => {
      console.log(`   ${role}: ${_count.role}`)
    })

  } catch (error) {
    console.error('\n❌ Error listing admin users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

listAdminUsers()
