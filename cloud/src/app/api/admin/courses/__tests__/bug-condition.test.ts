/**
 * Bug Condition Exploration Test
 *
 * Property 1: Bug Condition - Courses Not Showing After Publish / No Actionable Error
 *
 * CRITICAL: This test MUST FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 *
 * This test encodes the EXPECTED behavior. It will validate the fix when it passes
 * after the fix is implemented.
 *
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { NextRequest } from 'next/server'
import { PUT } from '../[id]/publish/route'
import { getServerSession } from 'next-auth'

// Mock next/cache (not used by the fixed route, but kept to avoid import errors)
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock global.fetch so we can assert the revalidation call
const mockFetch = jest.fn().mockResolvedValue({ ok: true } as Response)
global.fetch = mockFetch

// Mock next-auth so requireAdmin passes
jest.mock('next-auth')

// Mock prisma
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

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

const mockAdminSession = {
  user: {
    id: 'admin-user-id',
    email: 'admin@test.com',
    role: 'ADMIN',
  },
}

describe('Bug Condition Exploration — Property 1', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({ ok: true } as Response)
    mockGetServerSession.mockResolvedValue(mockAdminSession as any)
    // Ensure env vars are set so the route triggers the revalidation fetch call
    process.env.WEBSITE_REVALIDATION_URL = 'http://localhost:3000'
    process.env.REVALIDATION_SECRET = 'test-secret'
  })

  /**
   * Test Case 1: Valid course (with module + lesson) → publish succeeds →
   * assert revalidatePath('/courses') was called.
   *
   * EXPECTED OUTCOME ON UNFIXED CODE: FAILS
   * Counterexample: revalidatePath is never called after publish
   */
  it('should call revalidatePath("/courses") after successfully publishing a course', async () => {
    // Arrange: course with one module and one lesson (valid for publishing)
    const courseWithContent = {
      id: 'course-abc',
      title: 'Valid Course',
      slug: 'valid-course',
      published: false,
      Module: [
        {
          id: 'mod-1',
          title: 'Module 1',
          Lesson: [
            { id: 'lesson-1', title: 'Lesson 1' },
          ],
        },
      ],
    }

    const updatedCourse = {
      id: 'course-abc',
      title: 'Valid Course',
      slug: 'valid-course',
      published: true,
      Category: null,
      Instructor: null,
      updatedAt: new Date(),
    }

    mockPrisma.course.findUnique.mockResolvedValue(courseWithContent as any)
    mockPrisma.course.update.mockResolvedValue(updatedCourse as any)
    mockPrisma.auditLog.create.mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3001/api/admin/courses/course-abc/publish', {
      method: 'PUT',
    })

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: 'course-abc' }) })
    const data = await response.json()

    // Assert: publish should succeed
    expect(response.status).toBe(200)
    expect(data.data.message).toContain('published successfully')

    // Assert: fetch MUST have been called with the revalidation URL and path '/courses'
    // The fixed route calls fetch() fire-and-forget to trigger website cache revalidation
    // COUNTEREXAMPLE ON UNFIXED CODE: fetch is never called for revalidation
    const fetchCalls = mockFetch.mock.calls
    const revalidationCall = fetchCalls.find(
      ([url]: [string]) => typeof url === 'string' && url.includes('/api/revalidate')
    )
    expect(revalidationCall).toBeDefined()
    const body = JSON.parse(revalidationCall![1].body)
    expect(body.path).toBe('/courses')
  })

  /**
   * Test Case 2: Course with no modules → publish blocked →
   * assert error message contains "Curriculum tab".
   *
   * EXPECTED OUTCOME ON UNFIXED CODE: FAILS
   * Counterexample: error message is "Cannot publish course without at least one module"
   * with no mention of "Curriculum tab" or actionable next steps
   */
  it('should return an error message containing "Curriculum tab" when course has no modules', async () => {
    // Arrange: course with no modules
    const courseWithNoModules = {
      id: 'course-xyz',
      title: 'Empty Course',
      slug: 'empty-course',
      published: false,
      Module: [],
    }

    mockPrisma.course.findUnique.mockResolvedValue(courseWithNoModules as any)

    const request = new NextRequest('http://localhost:3001/api/admin/courses/course-xyz/publish', {
      method: 'PUT',
    })

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: 'course-xyz' }) })
    const data = await response.json()

    // Assert: publish should be blocked with a 400 error
    expect(response.status).toBe(400)

    // Assert: error message MUST contain "Curriculum tab" for actionable guidance
    // COUNTEREXAMPLE ON UNFIXED CODE: message is "Cannot publish course without at least one module"
    // with no mention of "Curriculum tab"
    expect(data.error.message).toContain('Curriculum tab')
  })
})
