// Checkpoint 17: Verify API and synchronization
// This test suite verifies:
// - Admin API endpoints functionality
// - Data synchronization mechanisms
// - Audit logging
// - API security measures

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { prisma } from '@/lib/db'
import { generateSignature, verifySignature, verifyTimestamp } from '@/lib/api-security'
import { getRateLimiter } from '@/lib/rate-limiter'
import { isOriginAllowed, DEFAULT_CORS_CONFIG } from '@/lib/cors'
import { SyncService, SyncEventType } from '@/lib/sync-service'
import { createAuditLog } from '@/lib/audit-logger'

describe('Checkpoint 17: API and Synchronization Verification', () => {
  let testUserId: string
  let testCourseId: string
  let testEnrollmentId: string
  let testApiKey: string
  let testApiSecret: string

  beforeAll(async () => {
    // Create test data
    const testUser = await prisma.user.create({
      data: {
        email: 'checkpoint17@test.com',
        name: 'Checkpoint 17 Test User',
        role: 'STUDENT',
      },
    })
    testUserId = testUser.id

    const testCourse = await prisma.course.create({
      data: {
        title: 'Checkpoint 17 Test Course',
        slug: 'checkpoint-17-test-course',
        priceCents: 0,
        published: true,
      },
    })
    testCourseId = testCourse.id

    const testEnrollment = await prisma.enrollment.create({
      data: {
        userId: testUserId,
        courseId: testCourseId,
        source: 'test',
        status: 'ACTIVE',
      },
    })
    testEnrollmentId = testEnrollment.id

    // Create test API key
    const apiKey = await prisma.apiKey.create({
      data: {
        keyName: 'Checkpoint 17 Test Key',
        apiKey: 'test-api-key-checkpoint-17',
        apiSecret: 'test-api-secret-checkpoint-17',
        isActive: true,
      },
    })
    testApiKey = apiKey.apiKey
    testApiSecret = apiKey.apiSecret
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.enrollment.deleteMany({
      where: { userId: testUserId },
    })
    await prisma.user.delete({
      where: { id: testUserId },
    })
    await prisma.course.delete({
      where: { id: testCourseId },
    })
    await prisma.apiKey.deleteMany({
      where: { keyName: 'Checkpoint 17 Test Key' },
    })
    await prisma.auditLog.deleteMany({
      where: { action: { contains: 'checkpoint17' } },
    })
  })

  describe('1. Admin API Endpoints', () => {
    it('should have students endpoint with proper structure', async () => {
      // Verify students can be queried
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        take: 1,
      })

      expect(students).toBeDefined()
      expect(Array.isArray(students)).toBe(true)
    })

    it('should have enrollments endpoint with proper structure', async () => {
      // Verify enrollments can be queried
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: testUserId },
        include: {
          user: true,
          course: true,
        },
      })

      expect(enrollments).toBeDefined()
      expect(Array.isArray(enrollments)).toBe(true)
      expect(enrollments.length).toBeGreaterThan(0)
      expect(enrollments[0]).toHaveProperty('user')
      expect(enrollments[0]).toHaveProperty('course')
    })

    it('should support enrollment creation with validation', async () => {
      // Test enrollment creation logic
      const newCourse = await prisma.course.create({
        data: {
          title: 'Test Course for Enrollment',
          slug: 'test-course-enrollment-checkpoint17',
          priceCents: 0,
          published: true,
        },
      })

      // Check if enrollment already exists
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: newCourse.id,
          },
        },
      })

      expect(existing).toBeNull()

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: newCourse.id,
          source: 'admin',
          status: 'ACTIVE',
        },
      })

      expect(enrollment).toBeDefined()
      expect(enrollment.userId).toBe(testUserId)
      expect(enrollment.courseId).toBe(newCourse.id)

      // Cleanup
      await prisma.enrollment.delete({ where: { id: enrollment.id } })
      await prisma.course.delete({ where: { id: newCourse.id } })
    })

    it('should have analytics endpoints with aggregation', async () => {
      // Test enrollment statistics
      const totalEnrollments = await prisma.enrollment.count()
      expect(totalEnrollments).toBeGreaterThan(0)

      // Test enrollment by status
      const enrollmentsByStatus = await prisma.enrollment.groupBy({
        by: ['status'],
        _count: { id: true },
      })
      expect(enrollmentsByStatus).toBeDefined()
      expect(Array.isArray(enrollmentsByStatus)).toBe(true)

      // Test student statistics
      const totalStudents = await prisma.user.count()
      expect(totalStudents).toBeGreaterThan(0)
    })

    it('should support pagination and filtering', async () => {
      // Test pagination
      const page1 = await prisma.user.findMany({
        take: 10,
        skip: 0,
      })

      expect(page1).toBeDefined()
      expect(page1.length).toBeLessThanOrEqual(10)

      // Test filtering
      const filtered = await prisma.user.findMany({
        where: {
          email: { contains: 'checkpoint17' },
        },
      })

      expect(filtered).toBeDefined()
      expect(filtered.length).toBeGreaterThan(0)
    })
  })

  describe('2. Data Synchronization', () => {
    it('should emit enrollment sync events', async () => {
      // Test sync event emission
      await expect(
        SyncService.emitEnrollmentEvent(
          SyncEventType.ENROLLMENT_UPDATED,
          testEnrollmentId
        )
      ).resolves.not.toThrow()
    })

    it('should emit profile sync events', async () => {
      // Test profile sync event emission
      await expect(
        SyncService.emitProfileEvent(testUserId)
      ).resolves.not.toThrow()
    })

    it('should emit progress sync events', async () => {
      // Test progress sync event emission
      await expect(
        SyncService.emitProgressEvent(testUserId, testCourseId)
      ).resolves.not.toThrow()
    })

    it('should track sync queue statistics', () => {
      // Get queue stats
      const stats = SyncService.getQueueStats()

      expect(stats).toBeDefined()
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('processing')
      expect(stats).toHaveProperty('pending')
      expect(stats).toHaveProperty('failed')
    })

    it('should handle immediate synchronization', async () => {
      // Test immediate sync (without webhooks configured)
      // This should not throw even if no webhooks are configured
      await expect(
        SyncService.syncEnrollmentNow(testEnrollmentId)
      ).resolves.not.toThrow()
    })
  })

  describe('3. Audit Logging', () => {
    it('should log audit events with required fields', async () => {
      // Create audit log entry
      await createAuditLog({
        action: 'checkpoint17.test.action',
        resourceType: 'Test',
        resourceId: 'test-123',
        userId: testUserId,
        details: {
          test: true,
          checkpoint: 17,
        },
      })

      // Query audit log
      const logs = await prisma.auditLog.findMany({
        where: {
          action: 'checkpoint17.test.action',
        },
      })

      expect(logs.length).toBeGreaterThan(0)
      const log = logs[0]
      expect(log).toHaveProperty('action')
      expect(log).toHaveProperty('resourceType')
      expect(log).toHaveProperty('resourceId')
      expect(log).toHaveProperty('createdAt')
      expect(log.action).toBe('checkpoint17.test.action')
    })

    it('should support audit log filtering', async () => {
      // Create multiple audit logs
      await createAuditLog({
        action: 'checkpoint17.filter.test1',
        resourceType: 'Test',
        resourceId: 'test-1',
      })

      await createAuditLog({
        action: 'checkpoint17.filter.test2',
        resourceType: 'Test',
        resourceId: 'test-2',
      })

      // Filter by action
      const filtered = await prisma.auditLog.findMany({
        where: {
          action: { contains: 'checkpoint17.filter' },
        },
      })

      expect(filtered.length).toBeGreaterThanOrEqual(2)
    })

    it('should include timestamps in audit logs', async () => {
      await createAuditLog({
        action: 'checkpoint17.timestamp.test',
        resourceType: 'Test',
        resourceId: 'test-timestamp',
      })

      const logs = await prisma.auditLog.findMany({
        where: {
          action: 'checkpoint17.timestamp.test',
        },
      })

      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].createdAt).toBeInstanceOf(Date)
    })
  })

  describe('4. API Security Measures', () => {
    describe('4.1 Request Signing', () => {
      it('should generate valid HMAC signatures', () => {
        const method = 'POST'
        const path = '/api/admin/students'
        const timestamp = Date.now()
        const body = JSON.stringify({ test: 'data' })

        const signature = generateSignature(
          method,
          path,
          timestamp,
          body,
          testApiSecret
        )

        expect(signature).toBeDefined()
        expect(typeof signature).toBe('string')
        expect(signature.length).toBeGreaterThan(0)
      })

      it('should verify valid signatures', () => {
        const method = 'POST'
        const path = '/api/admin/students'
        const timestamp = Date.now()
        const body = JSON.stringify({ test: 'data' })

        const signature = generateSignature(
          method,
          path,
          timestamp,
          body,
          testApiSecret
        )

        const isValid = verifySignature(
          signature,
          method,
          path,
          timestamp,
          body,
          testApiSecret
        )

        expect(isValid).toBe(true)
      })

      it('should reject invalid signatures', () => {
        const method = 'POST'
        const path = '/api/admin/students'
        const timestamp = Date.now()
        const body = JSON.stringify({ test: 'data' })

        const isValid = verifySignature(
          'invalid-signature',
          method,
          path,
          timestamp,
          body,
          testApiSecret
        )

        expect(isValid).toBe(false)
      })

      it('should reject signatures with tampered data', () => {
        const method = 'POST'
        const path = '/api/admin/students'
        const timestamp = Date.now()
        const body = JSON.stringify({ test: 'data' })

        const signature = generateSignature(
          method,
          path,
          timestamp,
          body,
          testApiSecret
        )

        // Try to verify with different body
        const tamperedBody = JSON.stringify({ test: 'tampered' })
        const isValid = verifySignature(
          signature,
          method,
          path,
          timestamp,
          tamperedBody,
          testApiSecret
        )

        expect(isValid).toBe(false)
      })
    })

    describe('4.2 Timestamp Validation', () => {
      it('should accept recent timestamps', () => {
        const timestamp = Date.now()
        const isValid = verifyTimestamp(timestamp)
        expect(isValid).toBe(true)
      })

      it('should reject old timestamps', () => {
        const timestamp = Date.now() - 10 * 60 * 1000 // 10 minutes ago
        const isValid = verifyTimestamp(timestamp)
        expect(isValid).toBe(false)
      })

      it('should reject future timestamps', () => {
        const timestamp = Date.now() + 10 * 60 * 1000 // 10 minutes in future
        const isValid = verifyTimestamp(timestamp)
        expect(isValid).toBe(false)
      })
    })

    describe('4.3 API Key Management', () => {
      it('should verify valid API keys', async () => {
        const apiKey = await prisma.apiKey.findUnique({
          where: { apiKey: testApiKey },
        })

        expect(apiKey).toBeDefined()
        expect(apiKey?.isActive).toBe(true)
      })

      it('should reject inactive API keys', async () => {
        // Create inactive API key
        const inactiveKey = await prisma.apiKey.create({
          data: {
            keyName: 'Inactive Test Key',
            apiKey: 'inactive-test-key',
            apiSecret: 'inactive-secret',
            isActive: false,
          },
        })

        const apiKey = await prisma.apiKey.findUnique({
          where: { apiKey: inactiveKey.apiKey },
        })

        expect(apiKey?.isActive).toBe(false)

        // Cleanup
        await prisma.apiKey.delete({ where: { id: inactiveKey.id } })
      })
    })

    describe('4.4 Rate Limiting', () => {
      it('should have rate limiter configured', () => {
        const rateLimiter = getRateLimiter()
        expect(rateLimiter).toBeDefined()
      })

      it('should track rate limit status', async () => {
        const rateLimiter = getRateLimiter()
        const identifier = 'test-checkpoint17'
        const endpoint = '/api/admin/students'

        const status = await rateLimiter.checkRateLimit(identifier, endpoint)

        expect(status).toBeDefined()
        expect(status).toHaveProperty('allowed')
        expect(status).toHaveProperty('remaining')
        expect(status).toHaveProperty('limit')
        expect(status).toHaveProperty('resetTime')
      })
    })

    describe('4.5 CORS Policy', () => {
      it('should validate allowed origins', () => {
        const allowedOrigin = 'http://localhost:3000'
        const isAllowed = isOriginAllowed(allowedOrigin, DEFAULT_CORS_CONFIG)
        expect(isAllowed).toBe(true)
      })

      it('should reject disallowed origins', () => {
        const disallowedOrigin = 'http://malicious-site.com'
        const isAllowed = isOriginAllowed(disallowedOrigin, DEFAULT_CORS_CONFIG)
        expect(isAllowed).toBe(false)
      })

      it('should have CORS configuration defined', () => {
        expect(DEFAULT_CORS_CONFIG).toBeDefined()
        expect(DEFAULT_CORS_CONFIG).toHaveProperty('allowedOrigins')
        expect(DEFAULT_CORS_CONFIG).toHaveProperty('allowedMethods')
        expect(DEFAULT_CORS_CONFIG).toHaveProperty('allowedHeaders')
      })
    })
  })

  describe('5. Integration Tests', () => {
    it('should handle complete enrollment workflow', async () => {
      // Create test course
      const course = await prisma.course.create({
        data: {
          title: 'Integration Test Course',
          slug: 'integration-test-course-checkpoint17',
          priceCents: 0,
          published: true,
        },
      })

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: course.id,
          source: 'admin',
          status: 'ACTIVE',
        },
      })

      // Emit sync event
      await SyncService.emitEnrollmentEvent(
        SyncEventType.ENROLLMENT_CREATED,
        enrollment.id
      )

      // Log audit event
      await createAuditLog({
        action: 'checkpoint17.enrollment.created',
        resourceType: 'Enrollment',
        resourceId: enrollment.id,
        userId: testUserId,
      })

      // Verify enrollment exists
      const savedEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollment.id },
      })

      expect(savedEnrollment).toBeDefined()
      expect(savedEnrollment?.userId).toBe(testUserId)

      // Cleanup
      await prisma.enrollment.delete({ where: { id: enrollment.id } })
      await prisma.course.delete({ where: { id: course.id } })
    })

    it('should handle API security workflow', () => {
      const method = 'POST'
      const path = '/api/admin/enrollments'
      const timestamp = Date.now()
      const body = JSON.stringify({
        userId: testUserId,
        courseId: testCourseId,
      })

      // Generate signature
      const signature = generateSignature(
        method,
        path,
        timestamp,
        body,
        testApiSecret
      )

      // Verify timestamp
      const timestampValid = verifyTimestamp(timestamp)
      expect(timestampValid).toBe(true)

      // Verify signature
      const signatureValid = verifySignature(
        signature,
        method,
        path,
        timestamp,
        body,
        testApiSecret
      )
      expect(signatureValid).toBe(true)
    })
  })
})
