import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { Course: true } } },
    orderBy: { name: 'asc' },
  })
  for (const c of cats) {
    console.log(`${c.name} (${c.slug}): ${c._count.Course} courses`)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
