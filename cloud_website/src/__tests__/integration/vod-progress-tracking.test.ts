// src/__tests__/integration/vod-progress-tracking.test.ts
/**
 * Integration test for progress tracking flow
 * 
 * Validates: Requirements 4.2, 4.3, 4.4
 * 
 * This test verifies the complete progress tracking workflow:
 * 1. Start video playback
 * 2. Send heartbeats
 * 3. Verify progress updates
 * 4. Reach 90% threshold
 * 5. Verify lesson completion
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'
import { ProgressTracker } from '@/lib/progress-tracker'

describe('VOD Progress Tracking Integration', () => {
  let testUser: any
  let testInstructor: any
  let testCategory: any
  let testCourse: any
  let testModule: any
  let testMedia: any
  let testLesson: any
  let testEnrollment: any

  const progressTracker = new ProgressTracker()

  beforeAll(async () => {
    // Create test instructor
    testInstructor = await prisma.instructor.create({
      data: {
        name: 'Progress Test Instructor',
        bio: 'Test bio for progress',
      },
    })

    // Create test category
    testCategory = await prisma.category.create({
      data: {
        name: `Progress Test Category ${Date.now()}`,
        slug: `progress-test-category-integration-${Date.now()}`,
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Progress Integration Test Course',
        slug: `progress-integration-test-course-${Date.now()}`,
        description: 'Test course for progress integration',
        priceCents: 0,
        published: true,
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    })

    // Create test module
    testModule = await prisma.module.create({
      data: {
        title: 'Progress Test Module',
        order: 1,
        courseId: testCourse.id,
      },
    })

    // Create instructor user for media upload
    const mediaUploader = await prisma.user.create({
      data: {
        email: 'progress-media-uploader@example.com',
        name: 'Media Uploader',
        role: 'INSTRUCTOR',
      },
    })

    // Create test media
    testMedia = await prisma.media.create({
      data: {
        originalName: 'progress-test-video.mp4',
        r2Key: 'media/progress-test/video.mp4',
        manifestUrl: 'https://r2.example.com/media/progress-test/master.m3u8',
        thumbnails: ['thumb1.jpg', 'thumb2.jpg'],
        duration: 120, // 2 minutes (120 seconds)
        width: 1920,
        height: 1080,
        fileSize: BigInt(1024 * 1024 * 50),
        mimeType: 'video/mp4',
        status: 'READY',
        uploadedBy: mediaUploader.id,
      },
    })

    // Create test lesson
    testLesson = await prisma.lesson.create({
      data: {
        title: 'Progress Test Lesson',
        kind: 'VIDEO',
        order: 1,
        moduleId: testModule.id,
        mediaId: testMedia.id,
        duration: 120, // 2 minutes
      },
    })

    // Create student user
    testUser = await prisma.user.create({
      data: {
        email: 'progress-student@example.com',
        name: 'Progress Student User',
        role: 'STUDENT',
      },
    })

    // Create enrollment
    testEnrollment = await prisma.enrollment.create({
      data: {
        userId: testUser.id,
        courseId: testCourse.id,
        status: 'ACTIVE',
        source: 'free',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await prisma.courseProgress.deleteMany({
        where: { userId: testUser.id },
      })
    }
    if (testLesson) {
      await prisma.lesson.deleteMany({ where: { id: testLesson.id } })
    }
    if (testMedia) {
      await prisma.media.deleteMany({ where: { id: testMedia.id } })
    }
    if (testModule) {
      await prisma.module.deleteMany({ where: { id: testModule.id } })
    }
    if (testEnrollment) {
      await prisma.enrollment.deleteMany({ where: { id: testEnrollment.id } })
    }
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['progress-student@example.com', 'progress-media-uploader@example.com'],
        },
      },
    })
    if (testCourse) {
      await prisma.course.deleteMany({ where: { id: testCourse.id } })
    }
    if (testInstructor) {
      await prisma.instructor.deleteMany({ where: { id: testInstructor.id } })
    }
    if (testCategory) {
      await prisma.category.deleteMany({ where: { id: testCategory.id } })
    }
  })

  it('should track progress through heartbeats and complete at 90% threshold', async () => {
    const duration = 120 // 2 minutes

    // Step 1: Start playback - send first heartbeat at position 0
    let progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 0,
      duration,
    })

    expect(progress).toBeDefined()
    expect(progress.lastPosition).toBe(0)
    expect(progress.watchedSec).toBe(0)
    expect(progress.completionPercentage).toBe(0)
    expect(progress.isCompleted).toBe(false)

    // Step 2: Send heartbeat at 10 seconds (forward progress)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 10,
      duration,
    })

    expect(progress.lastPosition).toBe(10)
    expect(progress.watchedSec).toBe(10) // Watched 10 seconds
    expect(progress.completionPercentage).toBeCloseTo(8.33, 1) // 10/120 * 100
    expect(progress.isCompleted).toBe(false)

    // Step 3: Send heartbeat at 30 seconds
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 30,
      duration,
    })

    expect(progress.lastPosition).toBe(30)
    expect(progress.watchedSec).toBe(30) // Watched 30 seconds total
    expect(progress.completionPercentage).toBe(25) // 30/120 * 100
    expect(progress.isCompleted).toBe(false)

    // Step 4: Send heartbeat at 60 seconds (50% watched)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 60,
      duration,
    })

    expect(progress.lastPosition).toBe(60)
    expect(progress.watchedSec).toBe(60)
    expect(progress.completionPercentage).toBe(50)
    expect(progress.isCompleted).toBe(false)

    // Step 5: Send heartbeat at 90 seconds (75% watched)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 90,
      duration,
    })

    expect(progress.lastPosition).toBe(90)
    expect(progress.watchedSec).toBe(90)
    expect(progress.completionPercentage).toBe(75)
    expect(progress.isCompleted).toBe(false) // Not yet at 90%

    // Step 6: Send heartbeat at 108 seconds (90% watched - completion threshold)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 108,
      duration,
    })

    expect(progress.lastPosition).toBe(108)
    expect(progress.watchedSec).toBe(108)
    expect(progress.completionPercentage).toBe(90)
    expect(progress.isCompleted).toBe(true) // Completed at 90%

    // Step 7: Verify lesson marked complete in database
    const dbProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: testUser.id,
          lessonId: testLesson.id,
        },
      },
    })

    expect(dbProgress).toBeDefined()
    expect(dbProgress?.completed).toBe(true)
    expect(dbProgress?.completedAt).toBeDefined()
    expect(dbProgress?.watchedSec).toBe(108)
    expect(dbProgress?.lastPosition).toBe(108)

    // Step 8: Continue watching to end (should remain completed)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: testLesson.id,
      currentPosition: 120,
      duration,
    })

    expect(progress.isCompleted).toBe(true)
    expect(progress.watchedSec).toBe(120)
    expect(progress.completionPercentage).toBe(100)
  })

  it('should handle backward seeks correctly (no negative progress)', async () => {
    // Create new lesson for this test
    const seekLesson = await prisma.lesson.create({
      data: {
        title: 'Seek Test Lesson',
        kind: 'VIDEO',
        order: 2,
        moduleId: testModule.id,
        mediaId: testMedia.id,
        duration: 100,
      },
    })

    const duration = 100

    // Watch to position 50
    let progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: seekLesson.id,
      currentPosition: 50,
      duration,
    })

    expect(progress.watchedSec).toBe(50)
    expect(progress.lastPosition).toBe(50)

    // Seek backward to position 20
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: seekLesson.id,
      currentPosition: 20,
      duration,
    })

    // watchedSec should not decrease
    expect(progress.watchedSec).toBe(50) // Stays at 50
    expect(progress.lastPosition).toBe(20) // Position updated

    // Watch forward from 20 to 30
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: seekLesson.id,
      currentPosition: 30,
      duration,
    })

    // Should add 10 seconds (30 - 20)
    expect(progress.watchedSec).toBe(60) // 50 + 10
    expect(progress.lastPosition).toBe(30)

    // Clean up
    await prisma.courseProgress.deleteMany({
      where: { lessonId: seekLesson.id },
    })
    await prisma.lesson.delete({ where: { id: seekLesson.id } })
  })

  it('should handle idempotent heartbeats (same position multiple times)', async () => {
    // Create new lesson for this test
    const idempotentLesson = await prisma.lesson.create({
      data: {
        title: 'Idempotent Test Lesson',
        kind: 'VIDEO',
        order: 3,
        moduleId: testModule.id,
        mediaId: testMedia.id,
        duration: 100,
      },
    })

    const duration = 100

    // Send heartbeat at position 30
    let progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: idempotentLesson.id,
      currentPosition: 30,
      duration,
    })

    expect(progress.watchedSec).toBe(30)

    // Send same heartbeat again (network retry scenario)
    progress = await progressTracker.updateProgress({
      userId: testUser.id,
      lessonId: idempotentLesson.id,
      currentPosition: 30,
      duration,
    })

    // watchedSec should not increase
    expect(progress.watchedSec).toBe(30)
    expect(progress.lastPosition).toBe(30)

    // Clean up
    await prisma.courseProgress.deleteMany({
      where: { lessonId: idempotentLesson.id },
    })
    await prisma.lesson.delete({ where: { id: idempotentLesson.id } })
  })

  it('should retrieve saved progress position for resume', async () => {
    // Get progress for the first test lesson
    const progress = await progressTracker.getProgress(testUser.id, testLesson.id)

    expect(progress).toBeDefined()
    expect(progress.lastPosition).toBe(120) // Last position from first test
    expect(progress.watchedSec).toBe(120)
    expect(progress.isCompleted).toBe(true)
    expect(progress.completionPercentage).toBe(100)
  })

  it('should calculate course completion percentage', async () => {
    // Create additional lessons
    const lesson2 = await prisma.lesson.create({
      data: {
        title: 'Lesson 2',
        kind: 'ARTICLE',
        order: 2,
        moduleId: testModule.id,
        content: 'Article content',
      },
    })

    const lesson3 = await prisma.lesson.create({
      data: {
        title: 'Lesson 3',
        kind: 'ARTICLE',
        order: 3,
        moduleId: testModule.id,
        content: 'Article content',
      },
    })

    // Mark lesson2 as complete
    await progressTracker.markComplete(testUser.id, lesson2.id)

    // Calculate course completion
    // We have 3 lessons total: testLesson (complete), lesson2 (complete), lesson3 (incomplete)
    const completion = await progressTracker.calculateCourseCompletion(
      testUser.id,
      testCourse.id
    )

    // 2 out of 3 lessons complete = 66.67%
    expect(completion).toBeCloseTo(66.67, 1)

    // Clean up
    await prisma.courseProgress.deleteMany({
      where: { lessonId: { in: [lesson2.id, lesson3.id] } },
    })
    await prisma.lesson.deleteMany({
      where: { id: { in: [lesson2.id, lesson3.id] } },
    })
  })

  it('should handle progress for lessons without duration', async () => {
    // Create article lesson (no duration)
    const articleLesson = await prisma.lesson.create({
      data: {
        title: 'Article Lesson',
        kind: 'ARTICLE',
        order: 4,
        moduleId: testModule.id,
        content: 'Article content here',
      },
    })

    // Mark as complete directly (articles don't have progress tracking)
    await progressTracker.markComplete(testUser.id, articleLesson.id)

    const progress = await progressTracker.getProgress(testUser.id, articleLesson.id)

    expect(progress.isCompleted).toBe(true)
    // For lessons without duration/progress tracking, completion percentage may be 0 or 100
    // depending on implementation
    expect([0, 100]).toContain(progress.completionPercentage)

    // Clean up
    await prisma.courseProgress.deleteMany({
      where: { lessonId: articleLesson.id },
    })
    await prisma.lesson.delete({ where: { id: articleLesson.id } })
  })
})
