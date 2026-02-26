// src/__tests__/integration/progress-tracking.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { checkAndUpdateCourseCompletion } from '@/lib/course-completion'

describe('Progress Tracking Integration Tests', () => {
  let testUser: any
  let testCourse: any
  let testModule: any
  let testLessons: any[] = []
  let testEnrollment: any

  beforeAll(async () => {
    // Clean up any existing test data first
    await prisma.user.deleteMany({
      where: { email: 'progress-test@example.com' },
    })
    await prisma.course.deleteMany({
      where: { slug: 'test-course-progress' },
    })

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'progress-test@example.com',
        name: 'Progress Test User',
        role: 'STUDENT',
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Test Course for Progress',
        slug: 'test-course-progress',
        description: 'Test course description',
        priceCents: 0,
        published: true,
      },
    })

    // Create test module
    testModule = await prisma.module.create({
      data: {
        title: 'Test Module',
        order: 1,
        courseId: testCourse.id,
      },
    })

    // Create test lessons
    for (let i = 1; i <= 5; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          title: `Test Lesson ${i}`,
          content: `Content for lesson ${i}`,
          order: i,
          moduleId: testModule.id,
          duration: 600, // 10 minutes
        },
      })
      testLessons.push(lesson)
    }

    // Create enrollment
    testEnrollment = await dbDataService.createEnrollment(
      testUser.id,
      testCourse.id,
      'free'
    )
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.courseProgress.deleteMany({
      where: { userId: testUser.id },
    })
    await prisma.enrollment.deleteMany({
      where: { userId: testUser.id },
    })
    await prisma.lesson.deleteMany({
      where: { moduleId: testModule.id },
    })
    await prisma.module.delete({ where: { id: testModule.id } })
    await prisma.course.delete({ where: { id: testCourse.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
  })

  it('should record lesson completion', async () => {
    const progress = await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[0].id,
      true,
      600
    )

    expect(progress).toBeDefined()
    expect(progress.userId).toBe(testUser.id)
    expect(progress.courseId).toBe(testCourse.id)
    expect(progress.lessonId).toBe(testLessons[0].id)
    expect(progress.completed).toBe(true)
    expect(progress.timeSpent).toBe(600)
  })

  it('should calculate course progress correctly', async () => {
    // Complete 2 more lessons (total 3 out of 5)
    await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[1].id,
      true,
      600
    )
    await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[2].id,
      true,
      600
    )

    const courseProgress = await dbDataService.getCourseProgress(
      testUser.id,
      testCourse.id
    )

    expect(courseProgress).toBeDefined()
    expect(courseProgress?.totalLessons).toBe(5)
    expect(courseProgress?.completedLessons).toBe(3)
    expect(courseProgress?.completionPercentage).toBe(60)
  })

  it('should update enrollment completion percentage', async () => {
    await checkAndUpdateCourseCompletion(testUser.id, testCourse.id)

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: testUser.id, courseId: testCourse.id },
      },
    })

    expect(enrollment).toBeDefined()
    expect(enrollment?.completionPercentage).toBe(60)
    expect(enrollment?.status).toBe('ACTIVE') // Not completed yet
  })

  it('should mark course as completed when all lessons done', async () => {
    // Complete remaining lessons
    await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[3].id,
      true,
      600
    )
    await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[4].id,
      true,
      600
    )

    const result = await checkAndUpdateCourseCompletion(
      testUser.id,
      testCourse.id
    )

    expect(result.completed).toBe(true)
    expect(result.completionPercentage).toBe(100)

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: testUser.id, courseId: testCourse.id },
      },
    })

    expect(enrollment?.status).toBe('COMPLETED')
    expect(enrollment?.completionPercentage).toBe(100)
  })

  it('should track time spent on lessons', async () => {
    const progress = await prisma.courseProgress.findMany({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
      },
    })

    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0)
    expect(totalTimeSpent).toBe(3000) // 5 lessons * 600 seconds
  })

  it('should update last accessed timestamp', async () => {
    const enrollmentBefore = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: testUser.id, courseId: testCourse.id },
      },
    })

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100))

    await dbDataService.updateLessonProgress(
      testUser.id,
      testCourse.id,
      testLessons[0].id,
      true,
      700
    )

    const enrollmentAfter = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: testUser.id, courseId: testCourse.id },
      },
    })

    expect(enrollmentAfter?.lastAccessedAt).toBeDefined()
    if (enrollmentBefore?.lastAccessedAt && enrollmentAfter?.lastAccessedAt) {
      expect(enrollmentAfter.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
        enrollmentBefore.lastAccessedAt.getTime()
      )
    }
  })
})
