/**
 * Create a unique instructor per published course and assign instructorId.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'
import {
  buildInstructorProfile,
  instructorIndexForSlug,
  resolveInstructorCategory,
} from '../src/lib/instructor-profiles'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      instructorId: true,
      Category: { select: { slug: true, name: true } },
    },
    orderBy: { slug: 'asc' },
  })

  const usedNames = new Set<string>()
  let created = 0
  let updated = 0

  for (const course of courses) {
    // Keep the ServiceNow pillar instructor (Satya Sharma) intact.
    if (course.slug === 'servicenow') {
      console.log(`↷ skip pillar instructor: ${course.slug}`)
      continue
    }

    const category = resolveInstructorCategory({
      slug: course.slug,
      title: course.title,
      category: course.Category,
    })

    let index = instructorIndexForSlug(course.slug)
    let profile = buildInstructorProfile({
      index,
      category,
      courseTitle: course.title,
    })

    let guard = 0
    while (usedNames.has(profile.name) && guard < 500) {
      guard++
      index = (instructorIndexForSlug(course.slug) + guard) % 10000
      profile = buildInstructorProfile({
        index,
        category,
        courseTitle: course.title,
      })
    }
    usedNames.add(profile.name)

    if (course.instructorId) {
      await prisma.instructor.update({
        where: { id: course.instructorId },
        data: {
          name: profile.name,
          bio: profile.bio,
          avatar: profile.avatar,
          company: profile.company,
        },
      })
      updated++
      console.log(`↻ ${course.slug} → ${profile.name}`)
      continue
    }

    const instructor = await prisma.instructor.create({
      data: {
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        company: profile.company,
      },
    })

    await prisma.course.update({
      where: { id: course.id },
      data: { instructorId: instructor.id },
    })

    created++
    console.log(`✓ ${course.slug} → ${profile.name}`)
  }

  console.log(`\nDone. Created ${created}, updated ${updated}. Unique names: ${usedNames.size}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
