import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DIRECT_DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function cuid() { return Math.random().toString(36).slice(2, 27) }

async function main() {
  const mod = await prisma.module.findFirst({ where: { Course: { slug: 'full-stack-web-development-bootcamp' } } })
  if (!mod) { console.log('Module not found'); return }
  console.log('Module id:', mod.id)

  // Use raw SQL because Prisma schema is out of sync with DB (missing updatedAt, kind columns)
  const lessonId = cuid()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Lesson" (id, title, "order", "moduleId", "videoUrl", duration, content, kind, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, 'VIDEO', NOW())`,
    lessonId, 'Welcome & Course Overview', 1, mod.id, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 'Welcome to the Full Stack Web Development Bootcamp!'
  )
  console.log('Created lesson id:', lessonId)
}

main().catch(console.error).finally(() => prisma.$disconnect())
