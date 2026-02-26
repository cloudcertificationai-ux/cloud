// src/lib/quiz-service.test.ts
import { QuizService } from './quiz-service';
import { prisma } from './db';
import { progressTracker } from './progress-tracker';

// Mock Prisma and ProgressTracker
jest.mock('./db', () => ({
  prisma: {
    quiz: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    quizAttempt: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    lesson: {
      findFirst: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('./progress-tracker', () => ({
  progressTracker: {
    markComplete: jest.fn(),
    calculateCourseCompletion: jest.fn(),
  },
}));

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(() => {
    service = new QuizService();
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create quiz with questions', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Test Quiz',
        description: 'A test quiz',
        timeLimit: 30,
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'What is 2+2?',
            type: 'SINGLE_CHOICE',
            options: [
              { id: 'a', text: '3' },
              { id: 'b', text: '4' },
            ],
            correctAnswer: 'b',
            explanation: 'Basic math',
            points: 1,
            order: 0,
          },
        ],
      };

      (prisma.quiz.create as jest.Mock).mockResolvedValue(mockQuiz);

      const result = await service.createQuiz({
        title: 'Test Quiz',
        description: 'A test quiz',
        timeLimit: 30,
        passingScore: 70,
        questions: [
          {
            text: 'What is 2+2?',
            type: 'SINGLE_CHOICE',
            options: [
              { id: 'a', text: '3' },
              { id: 'b', text: '4' },
            ],
            correctAnswer: 'b',
            explanation: 'Basic math',
            points: 1,
            order: 0,
          },
        ],
      });

      expect(result.id).toBe('quiz-1');
      expect(result.questions).toHaveLength(1);
    });

    it('should reject quiz with empty title', async () => {
      await expect(
        service.createQuiz({
          title: '',
          description: 'Test',
          timeLimit: 30,
          passingScore: 70,
          questions: [],
        })
      ).rejects.toThrow('Quiz title is required');
    });

    it('should reject quiz with no questions', async () => {
      await expect(
        service.createQuiz({
          title: 'Test',
          description: 'Test',
          timeLimit: 30,
          passingScore: 70,
          questions: [],
        })
      ).rejects.toThrow('Quiz must have at least one question');
    });

    it('should reject invalid passing score', async () => {
      await expect(
        service.createQuiz({
          title: 'Test',
          description: 'Test',
          timeLimit: 30,
          passingScore: 150,
          questions: [
            {
              text: 'Q1',
              type: 'SINGLE_CHOICE',
              options: [],
              correctAnswer: 'a',
              order: 0,
            },
          ],
        })
      ).rejects.toThrow('Passing score must be between 0 and 100');
    });
  });

  describe('submitQuiz', () => {
    it('should grade single choice questions correctly', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'What is 2+2?',
            type: 'SINGLE_CHOICE',
            options: [
              { id: 'a', text: '3' },
              { id: 'b', text: '4' },
            ],
            correctAnswer: 'b',
            explanation: 'Basic math',
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        score: 100,
        passed: true,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue({
        id: 'lesson-1',
        moduleId: 'module-1',
      });
      (prisma.module.findUnique as jest.Mock).mockResolvedValue({
        id: 'module-1',
        courseId: 'course-1',
      });

      const result = await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: 'b' },
      });

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.results[0].correct).toBe(true);
      expect(result.results[0].earnedPoints).toBe(10);
    });

    it('should grade multiple choice questions correctly', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'Select all even numbers',
            type: 'MULTIPLE_CHOICE',
            options: [
              { id: 'a', text: '1' },
              { id: 'b', text: '2' },
              { id: 'c', text: '3' },
              { id: 'd', text: '4' },
            ],
            correctAnswer: ['b', 'd'],
            explanation: 'Even numbers',
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        score: 100,
        passed: true,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: ['b', 'd'] },
      });

      expect(result.score).toBe(100);
      expect(result.results[0].correct).toBe(true);
    });

    it('should fail multiple choice with partial answer', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'Select all even numbers',
            type: 'MULTIPLE_CHOICE',
            correctAnswer: ['b', 'd'],
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        score: 0,
        passed: false,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: ['b'] }, // Missing 'd'
      });

      expect(result.score).toBe(0);
      expect(result.results[0].correct).toBe(false);
    });

    it('should grade text answers with case insensitivity', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'What is the capital of France?',
            type: 'TEXT_ANSWER',
            correctAnswer: 'Paris',
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        score: 100,
        passed: true,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: 'paris' }, // lowercase
      });

      expect(result.score).toBe(100);
      expect(result.results[0].correct).toBe(true);
    });

    it('should calculate score correctly with multiple questions', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            type: 'SINGLE_CHOICE',
            correctAnswer: 'a',
            points: 5,
          },
          {
            id: 'q2',
            type: 'SINGLE_CHOICE',
            correctAnswer: 'b',
            points: 5,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        score: 50,
        passed: false,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: 'a', q2: 'wrong' }, // 1 correct, 1 wrong
      });

      expect(result.score).toBe(50); // 5/10 * 100 = 50%
      expect(result.passed).toBe(false);
    });

    it('should mark lesson complete when quiz passed', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            type: 'SINGLE_CHOICE',
            correctAnswer: 'a',
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        score: 100,
        passed: true,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue({
        id: 'lesson-1',
        moduleId: 'module-1',
      });
      (prisma.module.findUnique as jest.Mock).mockResolvedValue({
        id: 'module-1',
        courseId: 'course-1',
      });

      await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: 'a' },
      });

      expect(progressTracker.markComplete).toHaveBeenCalledWith('user-1', 'lesson-1');
      expect(progressTracker.calculateCourseCompletion).toHaveBeenCalledWith('user-1', 'course-1');
    });

    it('should not mark lesson complete when quiz failed', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            type: 'SINGLE_CHOICE',
            correctAnswer: 'a',
            points: 10,
          },
        ],
      };

      const mockAttempt = {
        id: 'attempt-1',
        score: 0,
        passed: false,
      };

      (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz);
      (prisma.quizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);
      (prisma.lesson.findFirst as jest.Mock).mockResolvedValue({
        id: 'lesson-1',
        moduleId: 'module-1',
      });

      await service.submitQuiz({
        quizId: 'quiz-1',
        userId: 'user-1',
        answers: { q1: 'wrong' },
      });

      expect(progressTracker.markComplete).not.toHaveBeenCalled();
    });
  });

  describe('gradeAttempt', () => {
    it('should grade existing attempt', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        score: 100,
        passed: true,
        answers: { q1: 'b' },
        quiz: {
          questions: [
            {
              id: 'q1',
              type: 'SINGLE_CHOICE',
              correctAnswer: 'b',
              explanation: 'Test',
              points: 10,
            },
          ],
        },
      };

      (prisma.quizAttempt.findUnique as jest.Mock).mockResolvedValue(mockAttempt);

      const result = await service.gradeAttempt('attempt-1');

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.results[0].correct).toBe(true);
    });

    it('should throw error for non-existent attempt', async () => {
      (prisma.quizAttempt.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.gradeAttempt('invalid-id')).rejects.toThrow('Quiz attempt not found');
    });
  });

  describe('getAttempt', () => {
    it('should return attempt with results', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        score: 100,
        passed: true,
        submittedAt: new Date(),
        answers: { q1: 'b' },
        quiz: {
          title: 'Test Quiz',
          description: 'A test',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              type: 'SINGLE_CHOICE',
              correctAnswer: 'b',
              explanation: 'Test',
              points: 10,
            },
          ],
        },
      };

      (prisma.quizAttempt.findUnique as jest.Mock).mockResolvedValue(mockAttempt);

      const result = await service.getAttempt('attempt-1', 'user-1');

      expect(result.id).toBe('attempt-1');
      expect(result.score).toBe(100);
      expect(result.results).toHaveLength(1);
      expect(result.quiz.title).toBe('Test Quiz');
    });

    it('should throw error for unauthorized access', async () => {
      const mockAttempt = {
        id: 'attempt-1',
        userId: 'user-1',
        quiz: { questions: [] },
      };

      (prisma.quizAttempt.findUnique as jest.Mock).mockResolvedValue(mockAttempt);

      await expect(service.getAttempt('attempt-1', 'user-2')).rejects.toThrow(
        'Unauthorized access to quiz attempt'
      );
    });
  });
});
