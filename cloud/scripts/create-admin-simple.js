// Simple script to create admin user
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
})

// Create the adapter
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter })

async function createAdmin() {
  try {
    // Admin credentials
    const email = 'admin@anywheredoor.com'
    const password = 'Admin@123456'
    const name = 'Admin User'

    console.log('\n🔐 Creating Admin User...\n')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`❌ User with email ${email} already exists`)
      console.log(`   User ID: ${existingUser.id}`)
      console.log(`   Role: ${existingUser.role}`)
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      console.log('\n✅ Updated existing user with new password and ADMIN role')
    } else {
      // Hash password
      console.log('🔒 Hashing password...')
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      console.log('👤 Creating admin user...')
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
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
    }

    console.log('\n📋 Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Email:    ${email}`)
    console.log(`   Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🌐 Sign in at: http://localhost:3001/auth/signin\n')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
