/**
 * Preservation Property Tests — Property 2: Publish Validation Unchanged
 *
 * These tests verify that the existing publish-validation behavior is preserved.
 * They MUST PASS on unfixed code — passing confirms the baseline behavior to protect.
 *
 * Validates: Requirements 3.2, 3.3
 */

import * as fc from 'fast-check'
import { NextRequest } from 'next/server'
import { PUT } from '../[id]/publish/route'
import { getServerSession } from 'next-auth'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-auth')

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    course: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

// next/cache may or may not exist on unfixed code — mock it so the import doesn't fail
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import prisma from '@/lib/db'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

const mockAdminSession = {
  user: { id: 'admin-user-id', email: 'admin@test.com', role: 'ADMIN' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCourseWithModulesAndLessons(moduleCount: number, lessonsPerModule: number) {
  return {
    id: 'course-valid',
    title: 'Valid Course',
    slug: 'valid-course',
    published: false,
    Module: Array.from({ length: moduleCount }, (_, mi) => ({
      id: `mod-${mi}`,
      title: `Module ${mi}`,
      Lesson: Array.from({ length: lessonsPerModule }, (_, li) => ({
        id: `lesson-${mi}-${li}`,
        title: `Lesson ${li}`,
      })),
    })),
  }
}

function makeCourseWithNoModules() {
  return {
    id: 'course-no-modules',
    title: 'Empty Course',
    slug: 'empty-course',
    published: false,
    Module: [],
  }
}

function makeCourseWithModulesButNoLessons(moduleCount: number) {
  return {
    id: 'course-no-lessons',
    title: 'No Lessons Course',
    slug: 'no-lessons-course',
    published: false,
    Module: Array.from({ length: moduleCount }, (_, mi) => ({
      id: `mod-${mi}`,
      title: `Module ${mi}`,
      Lesson: [],
    })),
  }
}

function makePublishRequest(courseId: string) {
  return new NextRequest(
    `http://localhost:3001/api/admin/courses/${courseId}/publish`,
    { method: 'PUT' }
  )
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Preservation — Property 2: Publish Validation Unchanged', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue(mockAdminSession as any)
    mockPrisma.auditLog.create.mockResolvedValue({} as any)
  })

  // ── Observations ──────────────────────────────────────────────────────────

  it('Observation: publish succeeds (200) for a course with 1 module and 1 lesson', async () => {
    const course = makeCourseWithModulesAndLessons(1, 1)
    const updatedCourse = { ...course, published: true, Category: null, Instructor: null, updatedAt: new Date() }

    mockPrisma.course.findUnique.mockResolvedValue(course as any)
    mockPrisma.course.update.mockResolvedValue(updatedCourse as any)

    const response = await PUT(makePublishRequest(course.id), {
      params: Promise.resolve({ id: course.id }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.course.published).toBe(true)
  })

  it('Observation: publish returns 400 for a course with no modules', async () => {
    const course = makeCourseWithNoModules()
    mockPrisma.course.findUnique.mockResolvedValue(course as any)

    const response = await PUT(makePublishRequest(course.id), {
      params: Promise.resolve({ id: course.id }),
    })

    expect(response.status).toBe(400)
  })

  it('Observation: publish returns 400 for a course with modules but no lessons', async () => {
    const course = makeCourseWithModulesButNoLessons(2)
    mockPrisma.course.findUnique.mockResolvedValue(course as any)

    const response = await PUT(makePublishRequest(course.id), {
      params: Promise.resolve({ id: course.id }),
    })

    expect(response.status).toBe(400)
  })

  // ── Property: valid courses always publish successfully ────────────────────

  /**
   * Property 2: For any course state where module + lesson conditions ARE met,
   * publish succeeds with published = true.
   *
   * **Validates: Requirements 3.3**
   */
  it('Property 2a: For any course with ≥1 module and ≥1 lesson, publish succeeds with published = true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),  // moduleCount
        fc.integer({ min: 1, max: 5 }),  // lessonsPerModule
        async (moduleCount, lessonsPerModule) => {
          jest.clearAllMocks()
          mockGetServerSession.mockResolvedValue(mockAdminSession as any)
          mockPrisma.auditLog.create.mockResolvedValue({} as any)

          const course = makeCourseWithModulesAndLessons(moduleCount, lessonsPerModule)
          const updatedCourse = {
            ...course,
            published: true,
            Category: null,
            Instructor: null,
            updatedAt: new Date(),
          }

          mockPrisma.course.findUnique.mockResolvedValue(course as any)
          mockPrisma.course.update.mockResolvedValue(updatedCourse as any)

          const response = await PUT(makePublishRequest(course.id), {
            params: Promise.resolve({ id: course.id }),
          })
          const data = await response.json()

          expect(response.status).toBe(200)
          expect(data.data.course.published).toBe(true)
        }
      ),
      { numRuns: 30, seed: 42 }
    )
  })

  /**
   * Property 2b: For any course state where module + lesson conditions are NOT met,
   * publish returns an error (validation logic preserved).
   *
   * **Validates: Requirements 3.2, 3.3**
   */
  it('Property 2b: For any course without required modules/lessons, publish returns a 400 error', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid course states: either no modules, or modules with no lessons
        fc.oneof(
          // Case A: no modules at all
          fc.constant({ type: 'no-modules' as const }),
          // Case B: 1-5 modules but all empty
          fc.integer({ min: 1, max: 5 }).map(n => ({ type: 'no-lessons' as const, moduleCount: n }))
        ),
        async (invalidState) => {
          jest.clearAllMocks()
          mockGetServerSession.mockResolvedValue(mockAdminSession as any)

          const course =
            invalidState.type === 'no-modules'
              ? makeCourseWithNoModules()
              : makeCourseWithModulesButNoLessons(invalidState.moduleCount)

          mockPrisma.course.findUnique.mockResolvedValue(course as any)

          const response = await PUT(makePublishRequest(course.id), {
            params: Promise.resolve({ id: course.id }),
          })

          // Core property: must be a 4xx error
          expect(response.status).toBeGreaterThanOrEqual(400)
          expect(response.status).toBeLessThan(500)
        }
      ),
      { numRuns: 40, seed: 7777 }
    )
  })
})
