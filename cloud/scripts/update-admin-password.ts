#!/usr/bin/env tsx

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createId } from '@paralleldrive/cuid2'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function updateAdminPassword() {
  try {
    const email = 'admin@anywheredoor.com'
    const password = 'admin123'

    console.log('🔒 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('👤 Updating admin user...')
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      }
    })

    console.log('✅ Admin password updated successfully!')
    console.log('\nCredentials:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log('\nYou can now sign in to the admin panel at http://localhost:3001')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

updateAdminPassword()
