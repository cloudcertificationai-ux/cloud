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
  const course = await prisma.course.findUnique({
    where: { slug: 'full-stack-web-development-bootcamp' },
    include: { Module: { include: { Lesson: true } } },
  })

  if (!course) { console.log('Course not found!'); return }

  console.log('Course:', course.title)
  console.log('Published:', course.published)
  console.log('Modules:', course.Module.length)

  if (course.Module.length === 0) {
    const moduleId = cuid()
    await prisma.module.create({ data: { id: moduleId, title: 'Getting Started', order: 1, courseId: course.id } })
    await prisma.lesson.create({ data: { id: cuid(), title: 'Welcome & Course Overview', order: 1, moduleId, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 600, content: 'Welcome!' } })
    console.log('Added module and lesson.')
  } else {
    console.log('Module exists:', course.Module[0].title, '| Lessons:', course.Module[0].Lesson.length)
  }

  if (!course.published) {
    await prisma.course.update({ where: { id: course.id }, data: { published: true } })
    console.log('Published the course.')
  }

  console.log('\nCourse URL: /courses/full-stack-web-development-bootcamp')
}

main().catch(console.error).finally(() => prisma.$disconnect())
