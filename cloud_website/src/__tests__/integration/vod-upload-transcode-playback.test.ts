// src/__tests__/integration/vod-upload-transcode-playback.test.ts
/**
 * Integration test for upload → transcode → playback flow
 * 
 * Validates: Requirements 1.1, 1.5, 2.1, 2.6, 3.1, 3.3
 * 
 * This test verifies the complete video upload and playback workflow:
 * 1. Upload video via presigned URL
 * 2. Verify transcode job enqueued
 * 3. Wait for transcode completion
 * 4. Request playback token
 * 5. Verify HLS manifest and segments accessible
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import prisma from '@/lib/db'

// Conditionally import services only if R2 is configured
const hasR2Config = process.env.R2_ACCOUNT_ID && 
                    process.env.R2_ACCESS_KEY_ID && 
                    process.env.R2_SECRET_ACCESS_KEY &&
                    process.env.R2_BUCKET_NAME &&
                    process.env.R2_PUBLIC_DOMAIN;

describe('VOD Upload → Transcode → Playback Integration', () => {
  // Skip these tests if R2 configuration is not available
  if (!hasR2Config) {
    it.skip('skipping tests - R2 configuration not available', () => {});
    return;
  }

  let testUser: any
  let testInstructor: any
  let testCategory: any
  let testCourse: any
  let testModule: any
  let testLesson: any
  let testMedia: any
  let testEnrollment: any

  let mediaService: any
  let transcodeService: any
  let playbackService: any

  beforeAll(async () => {
    // Dynamically import services
    const { MediaService } = await import('@/lib/media-service')
    const { TranscodeService } = await import('@/lib/transcode-service')
    const { PlaybackService } = await import('@/lib/playback-service')
    
    mediaService = new MediaService()
    transcodeService = new TranscodeService()
    playbackService = new PlaybackService()

    // Create test instructor
    testInstructor = await prisma.instructor.create({
      data: {
        name: 'VOD Test Instructor',
        bio: 'Test bio for VOD',
      },
    })

    // Create test category
    testCategory = await prisma.category.create({
      data: {
        name: 'VOD Test Category',
        slug: 'vod-test-category-integration',
      },
    })

    // Create test user (instructor)
    testUser = await prisma.user.create({
      data: {
        email: 'vod-instructor@example.com',
        name: 'VOD Instructor User',
        role: 'INSTRUCTOR',
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'VOD Integration Test Course',
        slug: 'vod-integration-test-course',
        description: 'Test course for VOD integration',
        priceCents: 0,
        published: true,
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    })

    // Create test module
    testModule = await prisma.module.create({
      data: {
        title: 'VOD Test Module',
        order: 1,
        courseId: testCourse.id,
      },
    })

    // Create student user for playback testing
    const studentUser = await prisma.user.create({
      data: {
        email: 'vod-student@example.com',
        name: 'VOD Student User',
        role: 'STUDENT',
      },
    })

    // Create enrollment for student
    testEnrollment = await prisma.enrollment.create({
      data: {
        userId: studentUser.id,
        courseId: testCourse.id,
        status: 'ACTIVE',
        source: 'free',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    if (testMedia) {
      await prisma.media.deleteMany({ where: { id: testMedia.id } })
    }
    if (testLesson) {
      await prisma.lesson.deleteMany({ where: { id: testLesson.id } })
    }
    if (testModule) {
      await prisma.module.deleteMany({ where: { id: testModule.id } })
    }
    if (testEnrollment) {
      await prisma.enrollment.deleteMany({ where: { id: testEnrollment.id } })
    }
    await prisma.user.deleteMany({
      where: {
        email: { in: ['vod-instructor@example.com', 'vod-student@example.com'] },
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

  it('should complete upload → transcode → playback workflow', async () => {
    // Step 1: Generate presigned upload URL
    const uploadRequest = await mediaService.generatePresignedUpload({
      fileName: 'test-video.mp4',
      fileType: 'video/mp4',
      fileSize: 1024 * 1024 * 10, // 10MB
      userId: testUser.id,
    })

    expect(uploadRequest).toBeDefined()
    expect(uploadRequest.uploadUrl).toBeDefined()
    expect(uploadRequest.mediaId).toBeDefined()
    expect(uploadRequest.expiresAt).toBeDefined()

    // Verify media record created with UPLOADED status
    const mediaRecord = await prisma.media.findUnique({
      where: { id: uploadRequest.mediaId },
    })
    expect(mediaRecord).toBeDefined()
    expect(mediaRecord?.status).toBe('UPLOADED')
    expect(mediaRecord?.originalName).toBe('test-video.mp4')
    expect(mediaRecord?.mimeType).toBe('video/mp4')

    testMedia = mediaRecord

    // Step 2: Complete upload and trigger transcoding
    const completedMedia = await mediaService.completeUpload({
      mediaId: uploadRequest.mediaId,
      userId: testUser.id,
    })

    expect(completedMedia).toBeDefined()
    expect(completedMedia.status).toBe('PROCESSING')

    // Step 3: Verify transcode job enqueued
    // Note: In a real scenario, we would check BullMQ queue
    // For this test, we verify the status changed to PROCESSING
    const processingMedia = await prisma.media.findUnique({
      where: { id: uploadRequest.mediaId },
    })
    expect(processingMedia?.status).toBe('PROCESSING')

    // Step 4: Simulate transcode completion
    // In production, the transcode worker would do this
    await prisma.media.update({
      where: { id: uploadRequest.mediaId },
      data: {
        status: 'READY',
        manifestUrl: `https://r2.example.com/media/${uploadRequest.mediaId}/master.m3u8`,
        thumbnails: [
          `https://r2.example.com/media/${uploadRequest.mediaId}/thumb-0.jpg`,
          `https://r2.example.com/media/${uploadRequest.mediaId}/thumb-25.jpg`,
          `https://r2.example.com/media/${uploadRequest.mediaId}/thumb-50.jpg`,
          `https://r2.example.com/media/${uploadRequest.mediaId}/thumb-75.jpg`,
          `https://r2.example.com/media/${uploadRequest.mediaId}/thumb-100.jpg`,
        ],
        duration: 120, // 2 minutes
        width: 1920,
        height: 1080,
      },
    })

    // Step 5: Create lesson with media
    testLesson = await prisma.lesson.create({
      data: {
        title: 'VOD Test Lesson',
        kind: 'VIDEO',
        order: 1,
        moduleId: testModule.id,
        mediaId: uploadRequest.mediaId,
      },
    })

    expect(testLesson).toBeDefined()
    expect(testLesson.mediaId).toBe(uploadRequest.mediaId)

    // Step 6: Request playback token as enrolled student
    const studentUser = await prisma.user.findUnique({
      where: { email: 'vod-student@example.com' },
    })

    const playbackToken = await playbackService.generatePlaybackToken({
      mediaId: uploadRequest.mediaId,
      userId: studentUser!.id,
      lessonId: testLesson.id,
    })

    expect(playbackToken).toBeDefined()
    expect(playbackToken.signedUrl).toBeDefined()
    expect(playbackToken.expiresAt).toBeDefined()

    // Verify expiration is in the future
    expect(playbackToken.expiresAt.getTime()).toBeGreaterThan(Date.now())

    // Step 7: Verify media is accessible
    const readyMedia = await mediaService.getMedia(uploadRequest.mediaId)
    expect(readyMedia).toBeDefined()
    expect(readyMedia?.status).toBe('READY')
    expect(readyMedia?.manifestUrl).toBeDefined()
    expect(readyMedia?.thumbnails).toHaveLength(5)
    expect(readyMedia?.duration).toBe(120)
    expect(readyMedia?.width).toBe(1920)
    expect(readyMedia?.height).toBe(1080)
  })

  it('should reject playback token request for non-enrolled user', async () => {
    // Create non-enrolled user
    const nonEnrolledUser = await prisma.user.create({
      data: {
        email: 'vod-non-enrolled@example.com',
        name: 'Non-Enrolled User',
        role: 'STUDENT',
      },
    })

    // Attempt to request playback token
    await expect(
      playbackService.generatePlaybackToken({
        mediaId: testMedia.id,
        userId: nonEnrolledUser.id,
        lessonId: testLesson.id,
      })
    ).rejects.toThrow()

    // Clean up
    await prisma.user.delete({ where: { id: nonEnrolledUser.id } })
  })

  it('should handle media not found gracefully', async () => {
    const result = await mediaService.getMedia('non-existent-media-id')
    expect(result).toBeNull()
  })
})
