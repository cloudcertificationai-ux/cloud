#!/usr/bin/env tsx
// scripts/reset-database.ts
/**
 * Database Reset Script for Development
 * 
 * This script safely resets the database to a clean state by:
 * 1. Checking environment to prevent production resets
 * 2. Deleting all demo/development data
 * 3. Preserving admin users
 * 4. Preserving database schema and migrations
 * 5. Re-seeding essential production data
 * 
 * Usage:
 *   npm run db:reset:dev
 *   npx tsx scripts/reset-database.ts
 *   npx tsx scripts/reset-database.ts --confirm
 * 
 * Safety:
 *   - Requires explicit confirmation unless --confirm flag is used
 *   - Blocks execution in production environment
 *   - Preserves admin users (ADMIN role)
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as readline from 'readline'
import 'dotenv/config'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})

// Create the adapter
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL_ENV === 'production' ||
         process.env.DATABASE_URL?.includes('prod')
}

/**
 * Prompt user for confirmation
 */
async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  This will DELETE all courses, modules, lessons, enrollments, and demo users.\n' +
      '   Admin users will be preserved.\n\n' +
      '   Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'yes')
      }
    )
  })
}

/**
 * Get all admin user IDs to preserve them
 */
async function getAdminUserIds(): Promise<string[]> {
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true },
  })

  console.log(`\nFound ${adminUsers.length} admin user(s) to preserve:`)
  adminUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.name})`)
  })

  return adminUsers.map(user => user.id)
}

/**
 * Delete all demo/development data
 */
async function deleteData(adminUserIds: string[]): Promise<void> {
  console.log('\n🗑️  Deleting data...')

  // Delete in correct order to respect foreign key constraints
  
  // 1. Delete course-related data
  console.log('  - Deleting testimonials...')
  await prisma.testimonial.deleteMany()
  
  console.log('  - Deleting reviews...')
  await prisma.review.deleteMany()
  
  console.log('  - Deleting course progress...')
  await prisma.courseProgress.deleteMany()
  
  console.log('  - Deleting enrollments...')
  await prisma.enrollment.deleteMany()
  
  console.log('  - Deleting purchases...')
  await prisma.purchase.deleteMany()
  
  console.log('  - Deleting lessons...')
  await prisma.lesson.deleteMany()
  
  console.log('  - Deleting modules...')
  await prisma.module.deleteMany()
  
  console.log('  - Deleting courses...')
  await prisma.course.deleteMany()
  
  console.log('  - Deleting instructors...')
  await prisma.instructor.deleteMany()

  // 2. Delete quiz and assignment data
  console.log('  - Deleting quiz attempts...')
  await prisma.quizAttempt.deleteMany()
  
  console.log('  - Deleting assignment submissions...')
  await prisma.assignmentSubmission.deleteMany()
  
  console.log('  - Deleting questions...')
  await prisma.question.deleteMany()
  
  console.log('  - Deleting quizzes...')
  await prisma.quiz.deleteMany()
  
  console.log('  - Deleting assignments...')
  await prisma.assignment.deleteMany()

  // 3. Delete media data
  console.log('  - Deleting media...')
  await prisma.media.deleteMany()

  // 4. Delete monitoring/analytics data
  console.log('  - Deleting transcode job logs...')
  await prisma.transcodeJobLog.deleteMany()
  
  console.log('  - Deleting playback sessions...')
  await prisma.playbackSession.deleteMany()
  
  console.log('  - Deleting API error logs...')
  await prisma.aPIErrorLog.deleteMany()
  
  console.log('  - Deleting API performance logs...')
  await prisma.aPIPerformanceLog.deleteMany()
  
  console.log('  - Deleting daily statistics...')
  await prisma.dailyStatistics.deleteMany()

  // 5. Delete user-related data (except admins)
  console.log('  - Deleting audit logs...')
  await prisma.auditLog.deleteMany({
    where: {
      userId: { notIn: adminUserIds },
    },
  })
  
  console.log('  - Deleting sessions...')
  await prisma.session.deleteMany({
    where: {
      userId: { notIn: adminUserIds },
    },
  })
  
  console.log('  - Deleting accounts...')
  await prisma.account.deleteMany({
    where: {
      userId: { notIn: adminUserIds },
    },
  })
  
  console.log('  - Deleting profiles...')
  await prisma.profile.deleteMany({
    where: {
      userId: { notIn: adminUserIds },
    },
  })
  
  console.log('  - Deleting demo users (preserving admins)...')
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { notIn: adminUserIds },
    },
  })
  console.log(`    Deleted ${deletedUsers.count} demo user(s)`)

  console.log('\n✓ Data deletion complete')
}

/**
 * Re-seed essential production data
 */
async function reseedData(): Promise<void> {
  console.log('\n🌱 Re-seeding essential data...')

  // Create essential categories
  const categories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
  ]

  console.log('  - Creating categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
  console.log(`    Created ${categories.length} categories`)

  // Ensure admin user exists
  const adminEmail = process.env.ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME || 'System Administrator'
  
  if (adminEmail) {
    console.log('  - Ensuring admin user exists...')
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: adminName,
        role: 'ADMIN',
      },
    })
    console.log(`    Admin user: ${adminEmail}`)
  } else {
    console.log('  ⚠ ADMIN_EMAIL not set - skipping admin user creation')
  }

  console.log('\n✓ Re-seeding complete')
}

/**
 * Display summary statistics
 */
async function displaySummary(): Promise<void> {
  console.log('\n📊 Database Summary:')
  
  const [
    userCount,
    adminCount,
    categoryCount,
    courseCount,
    enrollmentCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.category.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
  ])

  console.log(`  - Users: ${userCount} (${adminCount} admin)`)
  console.log(`  - Categories: ${categoryCount}`)
  console.log(`  - Courses: ${courseCount}`)
  console.log(`  - Enrollments: ${enrollmentCount}`)
  console.log('')
}

/**
 * Main execution function
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Database Reset Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Safety check: Prevent production resets
  if (isProduction()) {
    console.error('\n❌ ERROR: Cannot reset database in production environment!')
    console.error('   This script is for development use only.')
    console.error('')
    process.exit(1)
  }

  console.log('\n✓ Environment check passed (not production)')

  // Check for --confirm flag
  const hasConfirmFlag = process.argv.includes('--confirm')

  if (!hasConfirmFlag) {
    const confirmed = await confirmReset()
    if (!confirmed) {
      console.log('\n❌ Reset cancelled by user')
      process.exit(0)
    }
  } else {
    console.log('\n✓ Auto-confirmed via --confirm flag')
  }

  try {
    // Get admin users to preserve
    const adminUserIds = await getAdminUserIds()

    if (adminUserIds.length === 0) {
      console.log('\n⚠️  Warning: No admin users found to preserve')
      console.log('   Consider setting ADMIN_EMAIL in .env before resetting')
    }

    // Delete all data except admins
    await deleteData(adminUserIds)

    // Re-seed essential data
    await reseedData()

    // Display summary
    await displaySummary()

    console.log('✅ Database reset complete!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Start the application: npm run dev')
    console.log('  2. Create courses via the admin panel')
    console.log('  3. Test with fresh data')
    console.log('')

  } catch (error) {
    console.error('\n❌ Error during database reset:', error)
    process.exit(1)
  }
}

// Execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
