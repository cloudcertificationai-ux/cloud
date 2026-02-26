// src/lib/assignment-service.ts
import { prisma } from '@/lib/db';
import { getR2Client } from '@/lib/r2-client';
import { progressTracker } from '@/lib/progress-tracker';
import type { Assignment, AssignmentSubmission } from '@prisma/client';

/**
 * AssignmentService handles assignment creation, submission, and grading
 * 
 * Requirements:
 * - 7.1: Store assignment details (title, description, dueDate, maxMarks, requirements)
 * - 7.2: Generate presigned URLs for assignment file uploads
 * - 7.3: Create submission records with timestamp
 * - 7.4: Detect late submissions
 * - 7.5: Store marks and feedback when grading
 * - 7.6: Mark lesson complete when graded
 * - 7.7: Retrieve submission status
 */

interface CreateAssignmentParams {
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  requirements: string;
}

interface GenerateSubmissionUploadParams {
  assignmentId: string;
  userId: string;
  fileName: string;
}

interface SubmitAssignmentParams {
  submissionId: string;
  userId: string;
}

interface GradeSubmissionParams {
  submissionId: string;
  instructorId: string;
  marks: number;
  feedback: string;
}

export class AssignmentService {
  private r2Client = getR2Client();

  /**
   * Create a new assignment
   * 
   * Requirement 7.1: Store assignment details
   */
  async createAssignment(params: CreateAssignmentParams): Promise<Assignment> {
    const { title, description, dueDate, maxMarks, requirements } = params;

    // Validate required fields
    if (!title || !description || !dueDate || !requirements) {
      throw new Error('Missing required assignment fields');
    }

    if (maxMarks <= 0) {
      throw new Error('maxMarks must be greater than 0');
    }

    // Create assignment record
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate,
        maxMarks,
        requirements,
      },
    });

    return assignment;
  }

  /**
   * Generate presigned upload URL for assignment submission
   * 
   * Requirement 7.2: Generate presigned R2 upload URL for assignment files
   */
  async generateSubmissionUpload(
    params: GenerateSubmissionUploadParams
  ): Promise<{
    uploadUrl: string;
    submissionId: string;
  }> {
    const { assignmentId, userId, fileName } = params;

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check if user already has a submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId },
      },
    });

    if (existingSubmission) {
      throw new Error('Assignment already submitted');
    }

    // Create a placeholder submission record
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        r2Key: '', // Will be updated after upload
        fileName,
        submittedAt: new Date(),
        isLate: new Date() > assignment.dueDate,
      },
    });

    // Generate R2 key with prefix: assignments/{assignmentId}/{submissionId}/{fileName}
    const r2Key = `assignments/${assignmentId}/${submission.id}/${fileName}`;

    // Update submission with R2 key
    await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: { r2Key },
    });

    // Generate presigned upload URL (15 minutes expiration)
    const uploadUrl = await this.r2Client.generatePresignedPut({
      key: r2Key,
      contentType: 'application/octet-stream',
      expiresIn: 15 * 60, // 15 minutes
    });

    return {
      uploadUrl,
      submissionId: submission.id,
    };
  }

  /**
   * Submit an assignment (confirm upload completion)
   * 
   * Requirement 7.3: Create AssignmentSubmission record with submission timestamp
   * Requirement 7.4: Mark submission as late if after due date
   */
  async submitAssignment(params: SubmitAssignmentParams): Promise<AssignmentSubmission> {
    const { submissionId, userId } = params;

    // Get submission
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Verify ownership
    if (submission.userId !== userId) {
      throw new Error('Unauthorized: submission belongs to another user');
    }

    // Submission is already created in generateSubmissionUpload
    // This method confirms the upload is complete
    // The isLate flag was already set during creation

    return submission;
  }

  /**
   * Grade an assignment submission
   * 
   * Requirement 7.5: Store marks awarded and feedback text
   * Requirement 7.6: Mark associated lesson as completed when graded
   */
  async gradeSubmission(params: GradeSubmissionParams): Promise<AssignmentSubmission> {
    const { submissionId, instructorId, marks, feedback } = params;

    // Get submission with assignment and lesson
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Validate marks
    if (marks < 0 || marks > submission.assignment.maxMarks) {
      throw new Error(
        `Marks must be between 0 and ${submission.assignment.maxMarks}`
      );
    }

    // Update submission with grading data
    const gradedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks,
        feedback,
        gradedAt: new Date(),
        gradedBy: instructorId,
      },
    });

    // Requirement 7.6: Mark lesson complete when graded
    // Find the lesson associated with this assignment
    const lesson = submission.assignment.lessons[0]; // Assuming one lesson per assignment
    if (lesson) {
      await progressTracker.markComplete(submission.userId, lesson.id);
      
      // Update course completion percentage
      const courseId = await prisma.lesson
        .findUnique({
          where: { id: lesson.id },
          include: { module: true },
        })
        .then((l) => l?.module.courseId);

      if (courseId) {
        await progressTracker.calculateCourseCompletion(
          submission.userId,
          courseId
        );
      }
    }

    return gradedSubmission;
  }

  /**
   * Get submission status for a student
   * 
   * Requirement 7.7: Display marks, feedback, and submission date
   */
  async getSubmission(
    submissionId: string,
    userId: string
  ): Promise<AssignmentSubmission | null> {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return null;
    }

    // Verify ownership or instructor access
    if (submission.userId !== userId) {
      // Check if user is instructor/admin (would need role check here)
      // For now, only allow owner to view
      throw new Error('Unauthorized: cannot view other users submissions');
    }

    return submission;
  }

  /**
   * Get submission by assignment and user
   * 
   * Helper method to retrieve submission for a specific assignment and user
   */
  async getSubmissionByAssignment(
    assignmentId: string,
    userId: string
  ): Promise<AssignmentSubmission | null> {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId },
      },
      include: {
        assignment: true,
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return submission;
  }

  /**
   * Get assignment by ID
   * 
   * Helper method to retrieve assignment details
   */
  async getAssignment(assignmentId: string): Promise<Assignment | null> {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    return assignment;
  }

  /**
   * List all submissions for an assignment (instructor view)
   * 
   * Helper method for instructors to view all submissions
   */
  async listSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return submissions;
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();
