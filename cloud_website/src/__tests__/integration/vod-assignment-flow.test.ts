// src/__tests__/integration/vod-assignment-flow.test.ts
/**
 * Integration test for assignment upload → submission → grading flow
 * 
 * Validates: Requirements 7.2, 7.3, 7.5, 7.6
 * 
 * This test verifies the complete assignment workflow:
 * 1. Create assignment
 * 2. Upload file via presigned URL
 * 3. Submit assignment
 * 4. Grade submission
 * 5. Verify lesson marked complete
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'

// Conditionally import services only if R2 is configured
const hasR2Config = process.env.R2_ACCOUNT_ID && 
                    process.env.R2_ACCESS_KEY_ID && 
                    process.env.R2_SECRET_ACCESS_KEY &&
                    process.env.R2_BUCKET_NAME &&
                    process.env.R2_PUBLIC_DOMAIN;

describe('VOD Assignment Upload → Submission → Grading Integration', () => {
  // Skip these tests if R2 configuration is not available
  if (!hasR2Config) {
    it.skip('skipping tests - R2 configuration not available', () => {});
    return;
  }

  let testStudent: any
  let testInstructor: any
  let testCategory: any
  let testCourse: any
  let testModule: any
  let testAssignment: any
  let testLesson: any
  let testEnrollment: any
  let instructorUser: any

  let assignmentService: any

  beforeAll(async () => {
    // Dynamically import service
    const { AssignmentService } = await import('@/lib/assignment-service')
    assignmentService = new AssignmentService()

    // Create test instructor
    testInstructor = await prisma.instructor.create({
      data: {
        name: 'Assignment Test Instructor',
        bio: 'Test bio for assignment',
      },
    })

    // Create instructor user
    instructorUser = await prisma.user.create({
      data: {
        email: 'assignment-instructor@example.com',
        name: 'Assignment Instructor User',
        role: 'INSTRUCTOR',
      },
    })

    // Create test category
    testCategory = await prisma.category.create({
      data: {
        name: 'Assignment Test Category',
        slug: 'assignment-test-category-integration',
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Assignment Integration Test Course',
        slug: 'assignment-integration-test-course',
        description: 'Test course for assignment integration',
        priceCents: 0,
        published: true,
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    })

    // Create test module
    testModule = await prisma.module.create({
      data: {
        title: 'Assignment Test Module',
        order: 1,
        courseId: testCourse.id,
      },
    })

    // Create student user
    testStudent = await prisma.user.create({
      data: {
        email: 'assignment-student@example.com',
        name: 'Assignment Student User',
        role: 'STUDENT',
      },
    })

    // Create enrollment
    testEnrollment = await prisma.enrollment.create({
      data: {
        userId: testStudent.id,
        courseId: testCourse.id,
        status: 'ACTIVE',
        source: 'free',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.assignmentSubmission.deleteMany({
      where: { userId: testStudent.id },
    })
    await prisma.courseProgress.deleteMany({
      where: { userId: testStudent.id },
    })
    if (testLesson) {
      await prisma.lesson.deleteMany({ where: { id: testLesson.id } })
    }
    if (testAssignment) {
      await prisma.assignment.deleteMany({ where: { id: testAssignment.id } })
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
          in: ['assignment-student@example.com', 'assignment-instructor@example.com'],
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

  it('should complete assignment upload → submission → grading workflow', async () => {
    // Step 1: Create assignment
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7) // Due in 7 days

    testAssignment = await assignmentService.createAssignment({
      title: 'Integration Test Assignment',
      description: 'Complete the project and submit your code',
      dueDate,
      maxMarks: 100,
      requirements: 'Submit a ZIP file containing your project code',
    })

    expect(testAssignment).toBeDefined()
    expect(testAssignment.id).toBeDefined()
    expect(testAssignment.title).toBe('Integration Test Assignment')
    expect(testAssignment.maxMarks).toBe(100)
    expect(testAssignment.dueDate).toEqual(dueDate)

    // Step 2: Create lesson with assignment
    testLesson = await prisma.lesson.create({
      data: {
        title: 'Assignment Test Lesson',
        kind: 'ASSIGNMENT',
        order: 1,
        moduleId: testModule.id,
        assignmentId: testAssignment.id,
      },
    })

    expect(testLesson).toBeDefined()
    expect(testLesson.assignmentId).toBe(testAssignment.id)

    // Step 3: Generate presigned upload URL for submission
    const uploadRequest = await assignmentService.generateSubmissionUpload({
      assignmentId: testAssignment.id,
      userId: testStudent.id,
      fileName: 'project-submission.zip',
    })

    expect(uploadRequest).toBeDefined()
    expect(uploadRequest.uploadUrl).toBeDefined()
    expect(uploadRequest.submissionId).toBeDefined()

    // Verify submission record created with pending status
    const pendingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: uploadRequest.submissionId },
    })
    expect(pendingSubmission).toBeDefined()
    expect(pendingSubmission?.userId).toBe(testStudent.id)
    expect(pendingSubmission?.assignmentId).toBe(testAssignment.id)
    expect(pendingSubmission?.fileName).toBe('project-submission.zip')
    expect(pendingSubmission?.marks).toBeNull() // Not graded yet

    // Step 4: Submit assignment (simulate file upload completion)
    const submission = await assignmentService.submitAssignment({
      submissionId: uploadRequest.submissionId,
      userId: testStudent.id,
    })

    expect(submission).toBeDefined()
    expect(submission.id).toBe(uploadRequest.submissionId)
    expect(submission.submittedAt).toBeDefined()
    expect(submission.isLate).toBe(false) // Submitted before due date

    // Step 5: Grade submission
    const gradedSubmission = await assignmentService.gradeSubmission({
      submissionId: uploadRequest.submissionId,
      instructorId: instructorUser.id,
      marks: 85,
      feedback: 'Great work! Well-structured code with good documentation.',
    })

    expect(gradedSubmission).toBeDefined()
    expect(gradedSubmission.marks).toBe(85)
    expect(gradedSubmission.feedback).toBe(
      'Great work! Well-structured code with good documentation.'
    )
    expect(gradedSubmission.gradedAt).toBeDefined()
    expect(gradedSubmission.gradedBy).toBe(instructorUser.id)

    // Step 6: Verify lesson marked complete after grading
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: testStudent.id,
          lessonId: testLesson.id,
        },
      },
    })
    expect(progress).toBeDefined()
    expect(progress?.completed).toBe(true)
    expect(progress?.completedAt).toBeDefined()

    // Step 7: Retrieve submission to verify all data
    const retrievedSubmission = await assignmentService.getSubmission(
      uploadRequest.submissionId,
      testStudent.id
    )

    expect(retrievedSubmission).toBeDefined()
    expect(retrievedSubmission.marks).toBe(85)
    expect(retrievedSubmission.feedback).toBe(
      'Great work! Well-structured code with good documentation.'
    )
    expect(retrievedSubmission.isLate).toBe(false)
  })

  it('should detect late submissions', async () => {
    // Create assignment with past due date
    const pastDueDate = new Date()
    pastDueDate.setDate(pastDueDate.getDate() - 1) // Due yesterday

    const lateAssignment = await assignmentService.createAssignment({
      title: 'Late Test Assignment',
      description: 'Test assignment for late submission',
      dueDate: pastDueDate,
      maxMarks: 50,
      requirements: 'Submit before due date',
    })

    // Generate upload URL
    const uploadRequest = await assignmentService.generateSubmissionUpload({
      assignmentId: lateAssignment.id,
      userId: testStudent.id,
      fileName: 'late-submission.pdf',
    })

    // Submit assignment (after due date)
    const submission = await assignmentService.submitAssignment({
      submissionId: uploadRequest.submissionId,
      userId: testStudent.id,
    })

    expect(submission.isLate).toBe(true) // Submitted after due date

    // Clean up
    await prisma.assignmentSubmission.deleteMany({
      where: { assignmentId: lateAssignment.id },
    })
    await prisma.assignment.delete({ where: { id: lateAssignment.id } })
  })

  it('should prevent duplicate submissions for same assignment', async () => {
    // Try to create another submission for the same assignment
    await expect(
      assignmentService.generateSubmissionUpload({
        assignmentId: testAssignment.id,
        userId: testStudent.id,
        fileName: 'duplicate-submission.zip',
      })
    ).rejects.toThrow() // Should fail due to unique constraint
  })

  it('should handle assignment without grading', async () => {
    // Create new assignment
    const ungradedAssignment = await assignmentService.createAssignment({
      title: 'Ungraded Assignment',
      description: 'Test assignment without grading',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      requirements: 'Submit your work',
    })

    // Create new student for this test
    const newStudent = await prisma.user.create({
      data: {
        email: 'ungraded-student@example.com',
        name: 'Ungraded Student',
        role: 'STUDENT',
      },
    })

    // Generate upload and submit
    const uploadRequest = await assignmentService.generateSubmissionUpload({
      assignmentId: ungradedAssignment.id,
      userId: newStudent.id,
      fileName: 'ungraded-submission.pdf',
    })

    const submission = await assignmentService.submitAssignment({
      submissionId: uploadRequest.submissionId,
      userId: newStudent.id,
    })

    // Retrieve submission - should show as not graded
    const retrievedSubmission = await assignmentService.getSubmission(
      uploadRequest.submissionId,
      newStudent.id
    )

    expect(retrievedSubmission.marks).toBeNull()
    expect(retrievedSubmission.feedback).toBeNull()
    expect(retrievedSubmission.gradedAt).toBeNull()
    expect(retrievedSubmission.gradedBy).toBeNull()

    // Clean up
    await prisma.assignmentSubmission.deleteMany({
      where: { assignmentId: ungradedAssignment.id },
    })
    await prisma.user.delete({ where: { id: newStudent.id } })
    await prisma.assignment.delete({ where: { id: ungradedAssignment.id } })
  })

  it('should store complete grading information', async () => {
    // Get the graded submission from the first test
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        userId: testStudent.id,
        assignmentId: testAssignment.id,
      },
    })

    expect(submissions).toHaveLength(1)
    const submission = submissions[0]

    // Verify all grading fields are populated
    expect(submission.marks).toBe(85)
    expect(submission.feedback).toBe(
      'Great work! Well-structured code with good documentation.'
    )
    expect(submission.gradedAt).toBeDefined()
    expect(submission.gradedBy).toBe(instructorUser.id)

    // Verify timestamps
    expect(submission.submittedAt).toBeDefined()
    expect(submission.gradedAt!.getTime()).toBeGreaterThanOrEqual(
      submission.submittedAt.getTime()
    )
  })
})
