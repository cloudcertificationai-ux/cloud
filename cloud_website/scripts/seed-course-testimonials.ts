/**
 * Seed student testimonials for courses that have none.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const TEMPLATES = [
  {
    author: 'Rahul Sharma',
    message:
      'Practical and job-focused. The labs matched what my team actually does at work. I cleared my interview round within weeks of finishing.',
  },
  {
    author: 'Ananya Iyer',
    message:
      'Clear explanations and real scenarios. I finally understood how to apply these skills on live projects instead of only theory.',
  },
  {
    author: 'Vikram Patel',
    message:
      'Best investment in my upskilling this year. Mentors were responsive and the curriculum is aligned with current hiring needs.',
  },
  {
    author: 'Sneha Kapoor',
    message:
      'Went from confused beginner to confident practitioner. The projects helped me build a portfolio I could show in interviews.',
  },
  {
    author: 'Mohammed Farooq',
    message:
      'Structured modules, useful assignments, and good support. Already using what I learned in my current role.',
  },
  {
    author: 'Divya Reddy',
    message:
      'Highly recommend for working professionals. Content is concise, modern, and focused on outcomes rather than fluff.',
  },
]

async function main() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      _count: { select: { Testimonial: true } },
    },
  })

  let seeded = 0
  for (const course of courses) {
    if (course._count.Testimonial > 0) continue

    // Pick 4–6 templates in a stable rotation per course
    const start = course.slug.length % TEMPLATES.length
    const pick = Array.from({ length: 5 }, (_, i) => TEMPLATES[(start + i) % TEMPLATES.length])

    await prisma.testimonial.createMany({
      data: pick.map((t) => ({
        courseId: course.id,
        author: t.author,
        message: `${t.message} (${course.title})`,
      })),
    })
    seeded++
    console.log(`✓ ${course.slug} — 5 testimonials`)
  }

  console.log(`\nDone. Seeded testimonials for ${seeded} courses.`)
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
