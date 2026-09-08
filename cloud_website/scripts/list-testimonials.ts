import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const n = await prisma.testimonial.count()
  console.log('count', n)
  const rows = await prisma.testimonial.findMany({ take: 3 })
  console.log(JSON.stringify(rows, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
