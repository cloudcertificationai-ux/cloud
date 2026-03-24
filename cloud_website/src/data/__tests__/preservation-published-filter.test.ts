/**
 * Preservation Property Tests — Property 2: Published Filter Unchanged
 *
 * These tests verify that the existing published-filter behavior is preserved.
 * They MUST PASS on unfixed code — passing confirms the baseline behavior to protect.
 *
 * Validates: Requirements 3.1, 3.2, 3.4
 */

import * as fc from 'fast-check'
import { DbDataService } from '../db-data-service'
import prisma from '@/lib/db'

// ─── Test data helpers ────────────────────────────────────────────────────────

const SLUG_PREFIX = 'preservation-test-'

async function createTestCategory(slug: string) {
  return prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name: slug, slug },
  })
}

async function createTestInstructor(name: string) {
  return prisma.instructor.create({ data: { name, bio: 'test' } })
}

async function createCourse(opts: {
  slug: string
  published: boolean
  categoryId: string
  instructorId: string
  level?: string
  title?: string
}) {
  return prisma.course.create({
    data: {
      title: opts.title ?? `Course ${opts.slug}`,
      slug: opts.slug,
      summary: 'test summary',
      description: 'test description',
      priceCents: 1000,
      currency: 'INR',
      published: opts.published,
      featured: false,
      level: opts.level ?? 'Beginner',
      durationMin: 60,
      rating: 4.0,
      instructorId: opts.instructorId,
      categoryId: opts.categoryId,
    },
  })
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Preservation — Property 2: Published Filter Unchanged', () => {
  let service: DbDataService
  let categoryId: string
  let instructorId: string

  // Slugs created during this suite so we can clean up
  const createdSlugs: string[] = []

  beforeAll(async () => {
    service = new DbDataService()

    // Clean up any leftover test data from previous runs
    await prisma.course.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } })
    await prisma.instructor.deleteMany({ where: { name: `${SLUG_PREFIX}instructor` } })
    await prisma.category.deleteMany({ where: { slug: `${SLUG_PREFIX}cat` } })

    // Shared category & instructor for all test courses
    const category = await createTestCategory(`${SLUG_PREFIX}cat`)
    categoryId = category.id

    const instructor = await createTestInstructor(`${SLUG_PREFIX}instructor`)
    instructorId = instructor.id

    // Seed a known mix: 3 published, 2 unpublished
    const seeds = [
      { slug: `${SLUG_PREFIX}pub-1`, published: true, level: 'Beginner' },
      { slug: `${SLUG_PREFIX}pub-2`, published: true, level: 'Intermediate' },
      { slug: `${SLUG_PREFIX}pub-3`, published: true, level: 'Advanced' },
      { slug: `${SLUG_PREFIX}unpub-1`, published: false, level: 'Beginner' },
      { slug: `${SLUG_PREFIX}unpub-2`, published: false, level: 'Intermediate' },
    ]

    for (const seed of seeds) {
      await createCourse({ ...seed, categoryId, instructorId })
      createdSlugs.push(seed.slug)
    }
  }, 60000)

  afterAll(async () => {
    // Clean up test data
    await prisma.course.deleteMany({ where: { slug: { in: createdSlugs } } })
    await prisma.instructor.deleteMany({ where: { name: `${SLUG_PREFIX}instructor` } })
    await prisma.category.deleteMany({ where: { slug: `${SLUG_PREFIX}cat` } })
  }, 30000)

  // ── Observation: baseline ──────────────────────────────────────────────────

  it('Observation: getCourses({ published: true }) returns only published courses', async () => {
    const result = await service.getCourses({ published: true })
    expect(result.courses.length).toBeGreaterThan(0)
    result.courses.forEach(course => {
      expect(course.published).toBe(true)
    })
  }, 30000)

  it('Observation: getCourses with no filter defaults to published: true', async () => {
    const result = await service.getCourses()
    result.courses.forEach(course => {
      expect(course.published).toBe(true)
    })
  }, 30000)

  it('Observation: unpublished courses are absent from getCourses results', async () => {
    const result = await service.getCourses({ published: true })
    const slugs = result.courses.map(c => c.slug)
    expect(slugs).not.toContain(`${SLUG_PREFIX}unpub-1`)
    expect(slugs).not.toContain(`${SLUG_PREFIX}unpub-2`)
  }, 30000)

  // ── Property: for any filter combination, all results have published = true ─

  /**
   * Property 2: For any combination of category/level/search filters,
   * all returned courses have published = true.
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('Property 2: For any filter combination, all returned courses have published = true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          level: fc.option(
            fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
            { nil: undefined }
          ),
          search: fc.option(
            fc.constantFrom('Course', 'preservation', 'xyz-no-match'),
            { nil: undefined }
          ),
          page: fc.integer({ min: 1, max: 3 }),
          pageSize: fc.integer({ min: 1, max: 10 }),
        }),
        async (filters) => {
          const result = await service.getCourses({
            published: true,
            level: filters.level,
            search: filters.search,
            page: filters.page,
            pageSize: filters.pageSize,
          })

          // Core property: every returned course must be published
          result.courses.forEach(course => {
            expect(course.published).toBe(true)
          })

          // Structural sanity
          expect(result.total).toBeGreaterThanOrEqual(0)
          expect(result.courses.length).toBeLessThanOrEqual(filters.pageSize)
        }
      ),
      { numRuns: 10, seed: 12345 }
    )
  }, 120000)

  /**
   * Property 2 (default): getCourses with no explicit published flag
   * also returns only published courses (default is published: true).
   *
   * **Validates: Requirements 3.1**
   */
  it('Property 2 (default filter): getCourses without explicit published flag returns only published courses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          level: fc.option(
            fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
            { nil: undefined }
          ),
          page: fc.integer({ min: 1, max: 3 }),
        }),
        async (filters) => {
          // No published flag — should default to published: true
          const result = await service.getCourses({
            level: filters.level,
            page: filters.page,
          })

          result.courses.forEach(course => {
            expect(course.published).toBe(true)
          })
        }
      ),
      { numRuns: 10, seed: 99999 }
    )
  }, 120000)
})
