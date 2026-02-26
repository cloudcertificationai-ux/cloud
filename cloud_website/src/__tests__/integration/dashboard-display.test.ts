// src/__tests__/integration/dashboard-display.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { getUserCompletionStats } from '@/lib/course-completion'

describe('Dashboard Display Integration Tests', () => {
  let testUser: any
  let testCourses: any[] = []
  let testEnrollments: any[] = []

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'dashboard-test@example.com',
        name: 'Dashboard Test User',
        role: 'STUDENT',
      },
    })

    // Create multiple test courses
    for (let i = 1; i <= 3; i++) {
      const course = await prisma.course.create({
        data: {
          title: `Dashboard Test Course ${i}`,
          slug: `dashboard-test-course-${i}`,
          description: `Test course ${i} description`,
          priceCents: 0,
          published: true,
        },
      })
      testCourses.push(course)

      // Create module and lessons for each course
      const module = await prisma.module.create({
        data: {
          title: `Module ${i}`,
          order: 1,
          courseId: course.id,
        },
      })

      for (let j = 1; j <= 3; j++) {
        await prisma.lesson.create({
          data: {
            title: `Lesson ${j}`,
            content: `Content ${j}`,
            order: j,
            moduleId: module.id,
          },
        })
      }

      // Create enrollment
      const enrollment = await dbDataService.createEnrollment(
        testUser.id,
        course.id,
        'free'
      )
      testEnrollments.push(enrollment)
    }
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.courseProgress.deleteMany({
      where: { userId: testUser.id },
    })
    await prisma.enrollment.deleteMany({
      where: { userId: testUser.id },
    })

    for (const course of testCourses) {
      const modules = await prisma.module.findMany({
        where: { courseId: course.id },
      })
      for (const module of modules) {
        await prisma.lesson.deleteMany({
          where: { moduleId: module.id },
        })
      }
      await prisma.module.deleteMany({
        where: { courseId: course.id },
      })
      await prisma.course.delete({ where: { id: course.id } })
    }

    await prisma.user.delete({ where: { id: testUser.id } })
  })

  it('should display all enrolled courses', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)

    expect(enrollments).toBeDefined()
    expect(enrollments.length).toBe(3)
    
    enrollments.forEach((enrollment, index) => {
      expect(enrollment.userId).toBe(testUser.id)
      expect(enrollment.course).toBeDefined()
      expect(enrollment.course.title).toContain('Dashboard Test Course')
    })
  })

  it('should include course details in dashboard data', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)

    enrollments.forEach(enrollment => {
      expect(enrollment.course.title).toBeDefined()
      expect(enrollment.course.slug).toBeDefined()
      expect(enrollment.course.description).toBeDefined()
      expect(enrollment.enrolledAt).toBeDefined()
    })
  })

  it('should show completion percentage for each course', async () => {
    // Complete some lessons in first course
    const firstCourse = testCourses[0]
    const modules = await prisma.module.findMany({
      where: { courseId: firstCourse.id },
      include: { lessons: true },
    })
    const lessons = modules[0].lessons

    // Complete 2 out of 3 lessons
    await dbDataService.updateLessonProgress(
      testUser.id,
      firstCourse.id,
      lessons[0].id,
      true,
      300
    )
    await dbDataService.updateLessonProgress(
      testUser.id,
      firstCourse.id,
      lessons[1].id,
      true,
      300
    )

    // Update enrollment completion percentage
    const courseProgress = await dbDataService.getCourseProgress(
      testUser.id,
      firstCourse.id
    )
    
    await prisma.enrollment.update({
      where: {
        userId_courseId: { userId: testUser.id, courseId: firstCourse.id },
      },
      data: {
        completionPercentage: courseProgress?.completionPercentage || 0,
      },
    })

    const enrollments = await dbDataService.getUserEnrollments(testUser.id)
    const firstEnrollment = enrollments.find(
      e => e.courseId === firstCourse.id
    )

    expect(firstEnrollment?.completionPercentage).toBeCloseTo(66.67, 1)
  })

  it('should calculate completion statistics', async () => {
    const stats = await getUserCompletionStats(testUser.id)

    expect(stats).toBeDefined()
    expect(stats.totalEnrollments).toBe(3)
    expect(stats.inProgressCourses).toBeGreaterThan(0)
    expect(stats.averageCompletion).toBeGreaterThan(0)
  })

  it('should show enrollment date for each course', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)

    enrollments.forEach(enrollment => {
      expect(enrollment.enrolledAt).toBeDefined()
      expect(enrollment.enrolledAt).toBeInstanceOf(Date)
    })
  })

  it('should display empty state when no enrollments', async () => {
    // Create a new user with no enrollments
    const emptyUser = await prisma.user.create({
      data: {
        email: 'empty-dashboard@example.com',
        name: 'Empty Dashboard User',
        role: 'STUDENT',
      },
    })

    const enrollments = await dbDataService.getUserEnrollments(emptyUser.id)

    expect(enrollments).toBeDefined()
    expect(enrollments.length).toBe(0)

    // Clean up
    await prisma.user.delete({ where: { id: emptyUser.id } })
  })

  it('should include instructor information', async () => {
    // Add instructor to first course
    const instructor = await prisma.instructor.create({
      data: {
        name: 'Dashboard Test Instructor',
        bio: 'Test instructor bio',
      },
    })

    await prisma.course.update({
      where: { id: testCourses[0].id },
      data: { instructorId: instructor.id },
    })

    const enrollments = await dbDataService.getUserEnrollments(testUser.id)
    const firstEnrollment = enrollments.find(
      e => e.courseId === testCourses[0].id
    )

    expect(firstEnrollment?.course.instructor).toBeDefined()
    expect(firstEnrollment?.course.instructor?.name).toBe(
      'Dashboard Test Instructor'
    )

    // Clean up
    await prisma.course.update({
      where: { id: testCourses[0].id },
      data: { instructorId: null },
    })
    await prisma.instructor.delete({ where: { id: instructor.id } })
  })

  it('should order enrollments by enrollment date', async () => {
    const enrollments = await dbDataService.getUserEnrollments(testUser.id)

    // Verify enrollments are ordered by enrolledAt descending
    for (let i = 0; i < enrollments.length - 1; i++) {
      expect(
        enrollments[i].enrolledAt.getTime()
      ).toBeGreaterThanOrEqual(
        enrollments[i + 1].enrolledAt.getTime()
      )
    }
  })
})
