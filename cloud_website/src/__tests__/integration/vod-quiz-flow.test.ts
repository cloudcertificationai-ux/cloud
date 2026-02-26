// src/__tests__/integration/vod-quiz-flow.test.ts
/**
 * Integration test for quiz submission → grading → completion flow
 * 
 * Validates: Requirements 6.3, 6.4, 6.5, 6.6
 * 
 * This test verifies the complete quiz workflow:
 * 1. Create quiz with questions
 * 2. Submit answers
 * 3. Verify auto-grading
 * 4. Verify lesson marked complete
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'
import { QuizService } from '@/lib/quiz-service'

describe('VOD Quiz Submission → Grading → Completion Integration', () => {
  let testUser: any
  let testInstructor: any
  let testCategory: any
  let testCourse: any
  let testModule: any
  let testQuiz: any
  let testLesson: any
  let testEnrollment: any

  const quizService = new QuizService()

  beforeAll(async () => {
    // Create test instructor
    testInstructor = await prisma.instructor.create({
      data: {
        name: 'Quiz Test Instructor',
        bio: 'Test bio for quiz',
      },
    })

    // Create test category
    testCategory = await prisma.category.create({
      data: {
        name: 'Quiz Test Category',
        slug: 'quiz-test-category-integration',
      },
    })

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Quiz Integration Test Course',
        slug: 'quiz-integration-test-course',
        description: 'Test course for quiz integration',
        priceCents: 0,
        published: true,
        instructorId: testInstructor.id,
        categoryId: testCategory.id,
      },
    })

    // Create test module
    testModule = await prisma.module.create({
      data: {
        title: 'Quiz Test Module',
        order: 1,
        courseId: testCourse.id,
      },
    })

    // Create student user
    testUser = await prisma.user.create({
      data: {
        email: 'quiz-student@example.com',
        name: 'Quiz Student User',
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
    await prisma.quizAttempt.deleteMany({
      where: { userId: testUser.id },
    })
    await prisma.courseProgress.deleteMany({
      where: { userId: testUser.id },
    })
    if (testLesson) {
      await prisma.lesson.deleteMany({ where: { id: testLesson.id } })
    }
    if (testQuiz) {
      await prisma.question.deleteMany({ where: { quizId: testQuiz.id } })
      await prisma.quiz.deleteMany({ where: { id: testQuiz.id } })
    }
    if (testModule) {
      await prisma.module.deleteMany({ where: { id: testModule.id } })
    }
    if (testEnrollment) {
      await prisma.enrollment.deleteMany({ where: { id: testEnrollment.id } })
    }
    await prisma.user.deleteMany({ where: { id: testUser.id } })
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

  it('should complete quiz submission → grading → completion workflow', async () => {
    // Step 1: Create quiz with questions
    testQuiz = await quizService.createQuiz({
      title: 'Integration Test Quiz',
      description: 'Test quiz for integration testing',
      timeLimit: 30, // 30 minutes
      passingScore: 70, // 70%
      questions: [
        {
          text: 'What is 2 + 2?',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
            { id: 'c', text: '5' },
          ],
          correctAnswer: 'b',
          explanation: 'Basic arithmetic: 2 + 2 = 4',
          points: 10,
          order: 1,
        },
        {
          text: 'Select all prime numbers',
          type: 'MULTIPLE_CHOICE',
          options: [
            { id: 'a', text: '2' },
            { id: 'b', text: '3' },
            { id: 'c', text: '4' },
            { id: 'd', text: '5' },
          ],
          correctAnswer: ['a', 'b', 'd'],
          explanation: 'Prime numbers are 2, 3, and 5',
          points: 10,
          order: 2,
        },
        {
          text: 'What is the capital of France?',
          type: 'TEXT_ANSWER',
          options: [],
          correctAnswer: 'Paris',
          explanation: 'The capital of France is Paris',
          points: 10,
          order: 3,
        },
      ],
    })

    expect(testQuiz).toBeDefined()
    expect(testQuiz.id).toBeDefined()
    expect(testQuiz.title).toBe('Integration Test Quiz')
    expect(testQuiz.passingScore).toBe(70)

    // Verify questions created
    const questions = await prisma.question.findMany({
      where: { quizId: testQuiz.id },
      orderBy: { order: 'asc' },
    })
    expect(questions).toHaveLength(3)
    expect(questions[0].type).toBe('SINGLE_CHOICE')
    expect(questions[1].type).toBe('MULTIPLE_CHOICE')
    expect(questions[2].type).toBe('TEXT_ANSWER')

    // Step 2: Create lesson with quiz
    testLesson = await prisma.lesson.create({
      data: {
        title: 'Quiz Test Lesson',
        kind: 'QUIZ',
        order: 1,
        moduleId: testModule.id,
        quizId: testQuiz.id,
      },
    })

    expect(testLesson).toBeDefined()
    expect(testLesson.quizId).toBe(testQuiz.id)

    // Step 3: Submit quiz answers (all correct)
    const answers = {
      [questions[0].id]: 'b', // Correct
      [questions[1].id]: ['a', 'b', 'd'], // Correct
      [questions[2].id]: 'Paris', // Correct
    }

    const result = await quizService.submitQuiz({
      quizId: testQuiz.id,
      userId: testUser.id,
      answers,
    })

    expect(result).toBeDefined()
    expect(result.attemptId).toBeDefined()
    expect(result.score).toBe(100) // All correct = 100%
    expect(result.passed).toBe(true) // 100% > 70% passing score
    expect(result.results).toHaveLength(3)

    // Verify each question result
    expect(result.results[0].correct).toBe(true)
    expect(result.results[0].earnedPoints).toBe(10)
    expect(result.results[1].correct).toBe(true)
    expect(result.results[1].earnedPoints).toBe(10)
    expect(result.results[2].correct).toBe(true)
    expect(result.results[2].earnedPoints).toBe(10)

    // Step 4: Verify quiz attempt stored
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: result.attemptId },
    })
    expect(attempt).toBeDefined()
    expect(attempt?.userId).toBe(testUser.id)
    expect(attempt?.quizId).toBe(testQuiz.id)
    expect(attempt?.score).toBe(100)
    expect(attempt?.passed).toBe(true)

    // Step 5: Verify lesson marked complete
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: testUser.id,
          lessonId: testLesson.id,
        },
      },
    })
    expect(progress).toBeDefined()
    expect(progress?.completed).toBe(true)
    expect(progress?.completedAt).toBeDefined()
  })

  it('should handle failing quiz (score below passing threshold)', async () => {
    // Create another quiz
    const failQuiz = await quizService.createQuiz({
      title: 'Fail Test Quiz',
      description: 'Test quiz for failing scenario',
      timeLimit: 30,
      passingScore: 80, // 80% required
      questions: [
        {
          text: 'Question 1',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
          ],
          correctAnswer: 'a',
          explanation: 'Explanation',
          points: 10,
          order: 1,
        },
        {
          text: 'Question 2',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
          ],
          correctAnswer: 'b',
          explanation: 'Explanation',
          points: 10,
          order: 2,
        },
      ],
    })

    const questions = await prisma.question.findMany({
      where: { quizId: failQuiz.id },
      orderBy: { order: 'asc' },
    })

    // Submit with only 1 correct answer (50% score)
    const answers = {
      [questions[0].id]: 'a', // Correct
      [questions[1].id]: 'a', // Wrong
    }

    const result = await quizService.submitQuiz({
      quizId: failQuiz.id,
      userId: testUser.id,
      answers,
    })

    expect(result.score).toBe(50) // 1 out of 2 correct
    expect(result.passed).toBe(false) // 50% < 80% passing score
    expect(result.results[0].correct).toBe(true)
    expect(result.results[1].correct).toBe(false)

    // Clean up
    await prisma.quizAttempt.deleteMany({ where: { quizId: failQuiz.id } })
    await prisma.question.deleteMany({ where: { quizId: failQuiz.id } })
    await prisma.quiz.delete({ where: { id: failQuiz.id } })
  })

  it('should retrieve quiz attempt results', async () => {
    // Get the attempt from the first test
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: testUser.id,
        quizId: testQuiz.id,
      },
      orderBy: { submittedAt: 'desc' },
      take: 1,
    })

    expect(attempts).toHaveLength(1)

    const attempt = await quizService.getAttempt(attempts[0].id, testUser.id)

    expect(attempt).toBeDefined()
    expect(attempt.id).toBe(attempts[0].id)
    expect(attempt.score).toBe(100)
    expect(attempt.passed).toBe(true)
  })

  it('should calculate score correctly for partial credit', async () => {
    // Create quiz with different point values
    const partialQuiz = await quizService.createQuiz({
      title: 'Partial Credit Quiz',
      description: 'Test quiz for partial credit',
      timeLimit: 30,
      passingScore: 60,
      questions: [
        {
          text: 'Easy question',
          type: 'SINGLE_CHOICE',
          options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
          correctAnswer: 'a',
          explanation: 'Explanation',
          points: 5, // 5 points
          order: 1,
        },
        {
          text: 'Hard question',
          type: 'SINGLE_CHOICE',
          options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
          correctAnswer: 'b',
          explanation: 'Explanation',
          points: 15, // 15 points
          order: 2,
        },
      ],
    })

    const questions = await prisma.question.findMany({
      where: { quizId: partialQuiz.id },
      orderBy: { order: 'asc' },
    })

    // Get easy question right, hard question wrong
    const answers = {
      [questions[0].id]: 'a', // Correct (5 points)
      [questions[1].id]: 'a', // Wrong (0 points)
    }

    const result = await quizService.submitQuiz({
      quizId: partialQuiz.id,
      userId: testUser.id,
      answers,
    })

    // Score should be 5/20 = 25%
    expect(result.score).toBe(25)
    expect(result.passed).toBe(false) // 25% < 60%
    expect(result.results[0].earnedPoints).toBe(5)
    expect(result.results[1].earnedPoints).toBe(0)

    // Clean up
    await prisma.quizAttempt.deleteMany({ where: { quizId: partialQuiz.id } })
    await prisma.question.deleteMany({ where: { quizId: partialQuiz.id } })
    await prisma.quiz.delete({ where: { id: partialQuiz.id } })
  })
})
