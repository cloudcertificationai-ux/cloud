// scripts/seed-dummy-course.mjs
// Creates a fully populated dummy course for testing
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DIRECT_DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function cuid() {
  return Math.random().toString(36).slice(2, 27)
}

async function main() {
  // Get or create a category
  let category = await prisma.category.findFirst()
  if (!category) {
    category = await prisma.category.create({
      data: { id: cuid(), name: 'Technology', slug: 'technology' },
    })
    console.log('Created category:', category.name)
  } else {
    console.log('Using existing category:', category.name)
  }

  const slug = 'full-stack-web-development-bootcamp'

  // Check if dummy course already exists
  const existing = await prisma.course.findUnique({ where: { slug }, include: { Module: true } })
  if (existing) {
    console.log('Dummy course already exists, id:', existing.id)
    // Make sure it's published
    if (!existing.published) {
      await prisma.course.update({ where: { id: existing.id }, data: { published: true } })
      console.log('Course published.')
    }
    // Add module/lesson if missing
    if (!existing.Module || existing.Module.length === 0) {
      const moduleId = cuid()
      await prisma.module.create({ data: { id: moduleId, title: 'Getting Started', order: 1, courseId: existing.id } })
      await prisma.lesson.create({ data: { id: cuid(), title: 'Welcome & Course Overview', order: 1, moduleId, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600, content: 'Welcome!' } })
      console.log('Added module and lesson.')
    }
    await prisma.$disconnect()
    return
  }

  const courseId = cuid()

  const course = await prisma.course.create({
    data: {
      id: courseId,
      title: 'Full Stack Web Development Bootcamp',
      slug,
      summary: 'Master modern web development from frontend to backend with hands-on projects.',
      description: `<p>This comprehensive bootcamp takes you from zero to full-stack developer. You'll learn HTML, CSS, JavaScript, React, Node.js, and PostgreSQL through real-world projects.</p><p>By the end of this course, you'll have built 5 production-ready applications and have the skills to land your first developer job.</p>`,
      priceCents: 999900,
      currency: 'INR',
      published: true,
      featured: true,
      level: 'Beginner',
      durationMin: 4800,
      rating: 4.8,
      thumbnailUrl: 'https://pub-4d620ea0c6324b51995d1a6c696ab8e6.r2.dev/media/cmn44t5ru0000q8ouj0ti2ltz/medium-shot-people-travel-agency.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      language: 'English',
      categoryId: category.id,
      learningOutcomes: [
        'Build full-stack web applications from scratch',
        'Master React and modern JavaScript (ES6+)',
        'Create RESTful APIs with Node.js and Express',
        'Work with PostgreSQL databases using Prisma ORM',
        'Deploy applications to production',
        'Implement authentication and authorization',
      ],
      handsOnProjects: [
        { title: 'E-Commerce Platform', description: 'Build a full-featured online store', skills: ['React', 'Node.js', 'PostgreSQL'], duration: '2 weeks' },
        { title: 'Social Media App', description: 'Create a Twitter-like social platform', skills: ['Next.js', 'Prisma', 'Auth'], duration: '2 weeks' },
      ],
      caseStudies: [
        { company: 'TechStartup Inc', industry: 'SaaS', challenge: 'Needed a scalable web platform', solution: 'Built with Next.js and PostgreSQL', outcome: '10x performance improvement' },
      ],
      courseFeatures: [
        '80+ hours of video content',
        'Lifetime access',
        'Certificate of completion',
        'Community Discord access',
        '1-on-1 mentorship sessions',
      ],
      requirements: [
        'Basic computer skills',
        'No prior programming experience needed',
        'A computer with internet access',
      ],
      certifications: [
        { title: 'Full Stack Developer Certificate', issuer: 'CloudCertification', description: 'Industry-recognized certificate upon course completion' },
      ],
      updatedAt: new Date(),
    },
  })

  console.log('Created course:', course.title, '| id:', course.id)

  // Add a module with a lesson so the course is complete
  const moduleId = cuid()
  await prisma.module.create({
    data: {
      id: moduleId,
      title: 'Getting Started',
      order: 1,
      courseId: course.id,
    },
  })

  await prisma.lesson.create({
    data: {
      id: cuid(),
      title: 'Welcome & Course Overview',
      order: 1,
      moduleId,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 600,
      content: 'Welcome to the Full Stack Web Development Bootcamp!',
    },
  })

  console.log('Added module and lesson.')
  console.log('\nDone! Course is published and visible at /courses/' + slug)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
