// src/lib/quiz-service.ts
import { prisma } from '@/lib/db';
import { progressTracker } from '@/lib/progress-tracker';
import type { QuestionType } from '@prisma/client';

/**
 * QuizService handles quiz creation, submission, and grading
 * 
 * Requirements:
 * - 6.1: Store quiz with questions, answers, time limits, passing scores
 * - 6.2: Support question types: single choice, multiple choice, text answer
 * - 6.3: Create QuizAttempt record with submission timestamp
 * - 6.4: Auto-grade MCQ questions
 * - 6.5: Calculate total score and pass/fail status
 * - 6.6: Mark lesson complete when quiz passed
 * - 6.7: Display results with correct answers and explanations
 */

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionInput {
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: any;
  explanation?: string;
  points?: number;
  order: number;
}

interface CreateQuizParams {
  title: string;
  description: string;
  timeLimit: number; // minutes
  passingScore: number; // percentage (0-100)
  questions: QuestionInput[];
}

interface SubmitQuizParams {
  quizId: string;
  userId: string;
  answers: Record<string, any>; // questionId -> answer
}

interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer: any;
  correctAnswer: any;
  explanation: string | null;
  points: number;
  earnedPoints: number;
}

interface QuizSubmissionResult {
  attemptId: string;
  score: number;
  passed: boolean;
  results: QuestionResult[];
}

export class QuizService {
  /**
   * Create a new quiz with questions
   * 
   * Requirement 6.1: Store quiz with questions, answer options, time limits, passing scores
   * Requirement 6.2: Support question types
   */
  async createQuiz(params: CreateQuizParams): Promise<any> {
    const { title, description, timeLimit, passingScore, questions } = params;

    // Validate inputs
    if (!title || title.trim().length === 0) {
      throw new Error('Quiz title is required');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Quiz description is required');
    }
    if (timeLimit <= 0) {
      throw new Error('Time limit must be positive');
    }
    if (passingScore < 0 || passingScore > 100) {
      throw new Error('Passing score must be between 0 and 100');
    }
    if (!questions || questions.length === 0) {
      throw new Error('Quiz must have at least one question');
    }

    // Validate question types
    const validTypes: QuestionType[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT_ANSWER'];
    for (const question of questions) {
      if (!validTypes.includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        passingScore,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options as any,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            points: q.points || 1,
            order: q.order,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return quiz;
  }

  /**
   * Submit quiz answers and grade them
   * 
   * Requirement 6.3: Create QuizAttempt record with submission timestamp
   * Requirement 6.4: Auto-grade MCQ questions
   * Requirement 6.5: Calculate total score and pass/fail status
   * Requirement 6.6: Mark lesson complete when quiz passed
   */
  async submitQuiz(params: SubmitQuizParams): Promise<QuizSubmissionResult> {
    const { quizId, userId, answers } = params;

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Grade the attempt
    const results = await this.gradeAnswers(quiz.questions, answers);

    // Calculate total score
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = results.reduce((sum, r) => sum + r.earnedPoints, 0);
    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScore;

    // Create quiz attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers,
        score: scorePercentage,
        passed,
      },
    });

    // Requirement 6.6: Mark lesson complete if quiz passed
    if (passed) {
      // Find the lesson associated with this quiz
      const lesson = await prisma.lesson.findFirst({
        where: { quizId },
      });

      if (lesson) {
        await progressTracker.markComplete(userId, lesson.id);
        
        // Update course completion percentage
        const module = await prisma.module.findUnique({
          where: { id: lesson.moduleId },
        });
        if (module) {
          await progressTracker.calculateCourseCompletion(userId, module.courseId);
        }
      }
    }

    return {
      attemptId: attempt.id,
      score: scorePercentage,
      passed,
      results,
    };
  }

  /**
   * Grade quiz answers
   * 
   * Requirement 6.4: Auto-grade MCQ questions by comparing answers
   * Requirement 6.5: Calculate score
   */
  private async gradeAnswers(
    questions: any[],
    answers: Record<string, any>
  ): Promise<QuestionResult[]> {
    const results: QuestionResult[] = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;
      let correct = false;

      // Grade based on question type
      if (question.type === 'SINGLE_CHOICE') {
        // For single choice, compare the selected option ID
        correct = userAnswer === correctAnswer;
      } else if (question.type === 'MULTIPLE_CHOICE') {
        // For multiple choice, compare arrays (order doesn't matter)
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSet = new Set(userAnswer);
          const correctSet = new Set(correctAnswer);
          correct =
            userSet.size === correctSet.size &&
            [...userSet].every((item) => correctSet.has(item));
        } else {
          correct = false;
        }
      } else if (question.type === 'TEXT_ANSWER') {
        // For text answers, do case-insensitive comparison
        const userText = String(userAnswer || '').trim().toLowerCase();
        const correctText = String(correctAnswer || '').trim().toLowerCase();
        correct = userText === correctText;
      }

      results.push({
        questionId: question.id,
        correct,
        userAnswer,
        correctAnswer,
        explanation: question.explanation,
        points: question.points,
        earnedPoints: correct ? question.points : 0,
      });
    }

    return results;
  }

  /**
   * Grade a quiz attempt (can be called separately if needed)
   * 
   * Requirement 6.4: Auto-grade MCQ questions
   * Requirement 6.5: Calculate score and pass/fail
   */
  async gradeAttempt(attemptId: string): Promise<{
    score: number;
    passed: boolean;
    results: QuestionResult[];
  }> {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error('Quiz attempt not found');
    }

    const results = await this.gradeAnswers(
      attempt.quiz.questions,
      attempt.answers as Record<string, any>
    );

    return {
      score: attempt.score,
      passed: attempt.passed,
      results,
    };
  }

  /**
   * Get quiz attempt with results
   * 
   * Requirement 6.7: Display results with correct answers and explanations
   */
  async getAttempt(attemptId: string, userId: string): Promise<any> {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error('Quiz attempt not found');
    }

    // Verify the attempt belongs to the user
    if (attempt.userId !== userId) {
      throw new Error('Unauthorized access to quiz attempt');
    }

    // Grade the attempt to get detailed results
    const results = await this.gradeAnswers(
      attempt.quiz.questions,
      attempt.answers as Record<string, any>
    );

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
      results,
      quiz: {
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        passingScore: attempt.quiz.passingScore,
      },
    };
  }
}

// Export singleton instance
export const quizService = new QuizService();
