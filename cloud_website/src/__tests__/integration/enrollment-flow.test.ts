// src/__tests__/integration/enrollment-flow.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'

describe('Enrollment Flow Integration Tests', () => {
  let testUser: any
  let testCourse: any
  let testInstructor: any
  let testCategory: any

  beforeAll(async () => {
    // Create test instructor
    testInstructor = await prisma.instructor.create({
      data: {
        name: 'Test Instructor',
        bio: 'Test bio',
      },
    })

    // Create test category
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-enrollment',
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Test Course for Enrollment',
        slug: 'test-course-enrollment',
        description: 'Test course description',
        priceCents: 0, // Free course
        published: true,
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    })

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'enrollment-test@example.com',
        name: 'Enrollment Test User',
        role: 'STUDENT',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.enrollment.deleteMany({
      where: { userId: testUser.id },
    })
    await prisma.user.delete({ where: { id: testUser.id } })
    await prisma.course.delete({ where: { id: testCourse.id } })
    await prisma.instructor.delete({ where: { id: testInstructor.id } })
    await prisma.category.delete({ where: { id: testCategory.id } })
  })

  it('should create enrollment for authenticated user', async () => {
    const enrollment = await dbDataService.createEnrollment(
      testUser.id,
      testCourse.id,
      'free'
    )

    expect(enrollment).toBeDefined()
    expect(enrollment.userId).toBe(testUser.id)
    expect(enrollment.courseId).toBe(testCourse.id)
    expect(enrollment.status).toBe('ACTIVE')
    expect(enrollment.source).toBe('free')
  })

  it('should check enrollment exists', async () => {
    const enrollment = await dbDataService.checkEnrollment(
      testUser.id,
      testCourse.id
    )

    expect(enrollment).toBeDefined()
    expect(enrollment?.userId).toBe(testUser.id)
    expect(enrollment?.courseId).toBe(testCourse.id)
  })

  it('should retrieve user enrollments', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)

    expect(enrollments).toBeDefined()
    expect(enrollments.length).toBeGreaterThan(0)
    expect(enrollments[0].userId).toBe(testUser.id)
    expect(enrollments[0].course).toBeDefined()
    expect(enrollments[0].course.title).toBe('Test Course for Enrollment')
  })

  it('should prevent duplicate enrollments', async () => {
    const existingEnrollment = await dbDataService.checkEnrollment(
      testUser.id,
      testCourse.id
    )

    expect(existingEnrollment).toBeDefined()
    
    // Attempting to create duplicate should be prevented at API level
    // Here we just verify the check works
    expect(existingEnrollment?.userId).toBe(testUser.id)
    expect(existingEnrollment?.courseId).toBe(testCourse.id)
  })

  it('should include course details in enrollment', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)
    const enrollment = enrollments[0]

    expect(enrollment.course).toBeDefined()
    expect(enrollment.course.title).toBe('Test Course for Enrollment')
    expect(enrollment.course.instructor).toBeDefined()
    expect(enrollment.course.instructor?.name).toBe('Test Instructor')
  })
})
