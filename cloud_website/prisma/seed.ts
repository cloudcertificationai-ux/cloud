// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})

// Create the adapter
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting production database seed...')

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Clearing existing data...')
    await prisma.testimonial.deleteMany()
    await prisma.courseProgress.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.purchase.deleteMany()
    await prisma.review.deleteMany()
    await prisma.lesson.deleteMany()
    await prisma.module.deleteMany()
    await prisma.course.deleteMany()
    await prisma.category.deleteMany()
    await prisma.instructor.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create essential categories
  console.log('Creating essential categories...')
  const categories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
  ]

  for (const category of categories) {
    await prisma.category.create({ data: category })
    console.log(`  ✓ Created category: ${category.name}`)
  }

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME || 'System Administrator'
  
  if (adminEmail) {
    console.log('Creating admin user...')
    try {
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          role: 'ADMIN',
        },
      })
      console.log(`  ✓ Created admin user: ${adminUser.email}`)
    } catch (error) {
      console.log(`  ⚠ Admin user may already exist: ${adminEmail}`)
    }
  } else {
    console.log('  ⚠ ADMIN_EMAIL not set - skipping admin user creation')
    console.log('  ℹ Set ADMIN_EMAIL in .env to create an admin user')
  }

  console.log('\n✓ Production database seeded successfully!')
  console.log('Summary:')
  console.log(`  - Categories: ${categories.length}`)
  console.log(`  - Admin users: ${adminEmail ? '1' : '0'}`)
  console.log('  - Courses: 0 (ready for content creation)')
  console.log('  - Students: 0 (ready for user registration)')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
