import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  // ── Task 1: Delete "workday" category and all its courses ────────────────
  const workday = await prisma.category.findUnique({ where: { slug: 'workday' } })
  if (workday) {
    const deleted = await prisma.course.deleteMany({ where: { categoryId: workday.id } })
    console.log(`✓ Deleted ${deleted.count} course(s) under "workday" category`)
    await prisma.category.delete({ where: { id: workday.id } })
    console.log('✓ Deleted "workday" category')
  } else {
    console.log('ℹ "workday" category not found — skipping deletion')
  }

  // ── Task 2: Rename "hello" → "IT Fundamentals" ───────────────────────────
  const hello = await prisma.category.findUnique({ where: { slug: 'hello' } })
  if (hello) {
    const updated = await prisma.category.update({
      where: { id: hello.id },
      data: { name: 'IT Fundamentals', slug: 'it-fundamentals' },
    })
    console.log(`✓ Renamed category: "${hello.name}" (${hello.slug}) → "${updated.name}" (${updated.slug})`)
    // Courses remain linked via categoryId — no extra update needed
    const courseCount = await prisma.course.count({ where: { categoryId: updated.id } })
    console.log(`  └─ ${courseCount} course(s) still linked to this category`)
  } else {
    console.log('ℹ "hello" category not found — skipping rename')
  }

  // ── Verification: print final category list ──────────────────────────────
  console.log('\n─── Final category list ───────────────────────────────────')
  const categories = await prisma.category.findMany({
    include: { _count: { select: { Course: true } } },
    orderBy: { name: 'asc' },
  })
  for (const c of categories) {
    console.log(`  ${c.name.padEnd(35)} slug: ${c.slug.padEnd(30)} courses: ${c._count.Course}`)
  }
  console.log('───────────────────────────────────────────────────────────')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
