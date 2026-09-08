import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  // Also rename workday to a proper display name
  const hello = await prisma.category.update({
    where: { slug: 'hello' },
    data: { name: 'Career Development', slug: 'career-development' },
  })
  console.log('✓ Renamed:', hello.name, '/', hello.slug)

  const workday = await prisma.category.findUnique({ where: { slug: 'workday' } })
  if (workday) {
    const updated = await prisma.category.update({
      where: { slug: 'workday' },
      data: { name: 'Workday', slug: 'workday' }, // keep slug, fix display name casing
    })
    console.log('✓ Workday category OK:', updated.name)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
