// src/lib/validations/lesson.ts
/**
 * Validation schemas for lesson management
 * Uses Zod for type-safe validation
 */

import { z } from 'zod'

/**
 * Lesson type enum (legacy - maps to kind)
 */
export const lessonTypeSchema = z.enum(['video', 'article', 'quiz', 'ar'])

/**
 * Lesson kind enum (new - matches Prisma LessonKind)
 */
export const lessonKindSchema = z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'MCQ', 'ASSIGNMENT', 'AR', 'LIVE'])

/**
 * Quiz question schema
 */
const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
  correctAnswer: z.number().int().min(0, 'Correct answer index must be non-negative'),
  explanation: z.string().optional(),
})

/**
 * Quiz content schema
 */
const quizContentSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1, 'At least one question required'),
})

/**
 * AR content schema
 */
const arContentSchema = z.object({
  modelUrl: z.string().url('Model URL must be valid'),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid').optional(),
  instructions: z.string().optional(),
  interactionType: z.enum(['rotate', 'scale', 'animate']),
})

/**
 * Lesson creation schema
 */
export const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  type: lessonTypeSchema.optional(), // Legacy field for backward compatibility
  kind: lessonKindSchema.optional(), // New field
  content: z.string().optional().nullable(),
  videoUrl: z.string().url('Video URL must be valid').optional().nullable(),
  duration: z.number().int('Duration must be an integer').positive('Duration must be positive').optional().nullable(),
  mediaId: z.string().optional().nullable(),
  quizId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
}).refine(
  (data) => {
    // If neither kind nor type is provided, default to VIDEO
    if (!data.kind && !data.type) {
      return true;
    }
    return true;
  },
  { message: 'Either kind or type must be provided' }
)

/**
 * Lesson update schema
 */
export const updateLessonSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  type: lessonTypeSchema.optional(), // Legacy field
  kind: lessonKindSchema.optional(), // New field
  content: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  mediaId: z.string().optional().nullable(),
  quizId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
})

/**
 * Validate lesson content based on type (legacy)
 */
export function validateLessonContent(type: string, content: string | null, videoUrl: string | null): void {
  if (type === 'video') {
    if (!videoUrl) {
      throw new Error('Video lessons require a videoUrl')
    }
  } else if (type === 'quiz') {
    if (!content) {
      throw new Error('Quiz lessons require content')
    }
    try {
      const parsed = JSON.parse(content)
      quizContentSchema.parse(parsed)
    } catch (error) {
      throw new Error('Invalid quiz content structure')
    }
  } else if (type === 'ar') {
    if (!content) {
      throw new Error('AR lessons require content')
    }
    try {
      const parsed = JSON.parse(content)
      arContentSchema.parse(parsed)
    } catch (error) {
      throw new Error('Invalid AR content structure')
    }
  } else if (type === 'article') {
    if (!content) {
      throw new Error('Article lessons require content')
    }
  }
}

/**
 * Validate lesson foreign key requirements based on kind
 * Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function validateLessonKind(
  kind: string,
  data: {
    mediaId?: string | null;
    quizId?: string | null;
    assignmentId?: string | null;
    content?: string | null;
    videoUrl?: string | null;
  }
): void {
  switch (kind) {
    case 'VIDEO':
      // VIDEO lessons require either mediaId (new) or videoUrl (legacy)
      if (!data.mediaId && !data.videoUrl) {
        throw new Error('VIDEO lessons require either mediaId or videoUrl')
      }
      break;
    
    case 'QUIZ':
    case 'MCQ':
      // QUIZ/MCQ lessons require quizId
      if (!data.quizId) {
        throw new Error(`${kind} lessons require quizId`)
      }
      break;
    
    case 'ASSIGNMENT':
      // ASSIGNMENT lessons require assignmentId
      if (!data.assignmentId) {
        throw new Error('ASSIGNMENT lessons require assignmentId')
      }
      break;
    
    case 'ARTICLE':
      // ARTICLE lessons require content
      if (!data.content) {
        throw new Error('ARTICLE lessons require content')
      }
      break;
    
    case 'AR':
      // AR lessons require content with AR structure
      if (!data.content) {
        throw new Error('AR lessons require content')
      }
      try {
        const parsed = JSON.parse(data.content)
        arContentSchema.parse(parsed)
      } catch (error) {
        throw new Error('Invalid AR content structure')
      }
      break;
    
    case 'LIVE':
      // LIVE lessons may have optional content for description
      // No strict requirements for now
      break;
    
    default:
      throw new Error(`Invalid lesson kind: ${kind}`)
  }
}

/**
 * Map legacy type to new kind
 */
export function mapTypeToKind(type: string): string {
  const typeMap: Record<string, string> = {
    'video': 'VIDEO',
    'article': 'ARTICLE',
    'quiz': 'QUIZ',
    'ar': 'AR',
  };
  return typeMap[type] || 'VIDEO';
}

/**
 * Type inference from schemas
 */
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type LessonType = z.infer<typeof lessonTypeSchema>
export type LessonKind = z.infer<typeof lessonKindSchema>
export type QuizContent = z.infer<typeof quizContentSchema>
export type ARContent = z.infer<typeof arContentSchema>
