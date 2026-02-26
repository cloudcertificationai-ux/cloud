// src/types/course.ts
/**
 * Shared TypeScript types for Course Management System
 * These types align with the Prisma schema and are used across the admin panel
 */

import { Course, Module, Lesson, Instructor, Category } from '@prisma/client'

/**
 * Lesson type discriminator (legacy)
 */
export type LessonType = 'video' | 'article' | 'quiz' | 'ar'

/**
 * Lesson kind (new - matches Prisma LessonKind enum)
 */
export type LessonKind = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MCQ' | 'ASSIGNMENT' | 'AR' | 'LIVE'

/**
 * Course form data for creation and updates
 */
export interface CourseFormData {
  title: string
  slug: string
  summary?: string
  description?: string
  priceCents: number
  currency: string
  level?: string
  durationMin?: number
  thumbnailUrl?: string
  categoryId?: string
  instructorId?: string
}

/**
 * Course with full curriculum (modules and lessons)
 */
export interface CourseWithCurriculum extends Course {
  instructor?: Instructor | null
  category?: Category | null
  modules: ModuleWithLessons[]
}

/**
 * Module with its lessons
 */
export interface ModuleWithLessons extends Module {
  lessons: LessonWithType[]
}

/**
 * Lesson with computed type
 */
export interface LessonWithType extends Lesson {
  type: LessonType
}

/**
 * Curriculum module for drag-and-drop interface
 */
export interface CurriculumModule {
  id: string
  title: string
  order: number
  lessons: CurriculumLesson[]
}

/**
 * Curriculum lesson for drag-and-drop interface
 */
export interface CurriculumLesson {
  id: string
  title: string
  order: number
  moduleId: string
  type: LessonType
  duration?: number
}

/**
 * Lesson data for creation and updates
 */
export interface LessonData {
  title: string
  type?: LessonType // Legacy field for backward compatibility
  kind?: LessonKind // New field
  content?: string
  videoUrl?: string
  duration?: number
  mediaId?: string
  quizId?: string
  assignmentId?: string
  order: number
  moduleId: string
}

/**
 * Module data for creation and updates
 */
export interface ModuleData {
  title: string
  order: number
  courseId: string
}

/**
 * Reorder operation for curriculum
 */
export interface ReorderUpdate {
  type: 'module' | 'lesson'
  id: string
  order: number
  moduleId?: string // For lessons moved between modules
}

/**
 * Quiz content structure
 */
export interface QuizContent {
  questions: QuizQuestion[]
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

/**
 * AR/Interactive content structure
 */
export interface ARContent {
  modelUrl: string
  thumbnailUrl?: string
  instructions?: string
  interactionType: 'rotate' | 'scale' | 'animate'
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  url: string
  type: MediaType
  size: number
  duration?: number // For videos
}

/**
 * Media type discriminator
 */
export type MediaType = 'video' | 'pdf' | 'image' | '3d-model'

/**
 * Course summary for list views
 */
export interface CourseSummary {
  id: string
  title: string
  slug: string
  summary?: string
  priceCents: number
  currency: string
  published: boolean
  featured: boolean
  level?: string
  durationMin?: number
  rating?: number
  thumbnailUrl?: string
  instructor?: {
    name: string
    avatar?: string
  }
  category?: {
    name: string
    slug: string
  }
  enrollmentCount?: number
}

/**
 * Helper function to determine lesson type from lesson data
 */
export function getLessonType(lesson: Lesson): LessonType {
  if (lesson.videoUrl) return 'video'
  if (lesson.content) {
    try {
      const parsed = JSON.parse(lesson.content)
      if (parsed.questions) return 'quiz'
      if (parsed.modelUrl) return 'ar'
    } catch {
      // Not JSON, treat as article
    }
  }
  return 'article'
}

/**
 * Helper function to add type to lesson
 */
export function addLessonType(lesson: Lesson): LessonWithType {
  return {
    ...lesson,
    type: getLessonType(lesson),
  }
}
