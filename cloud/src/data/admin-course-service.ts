// src/data/admin-course-service.ts
/**
 * Admin Course Data Service
 * Provides data access methods for course management in the admin panel
 * Follows the same pattern as frontend's db-data-service.ts
 */

import prisma from '@/lib/db'
import { Course, Module, Lesson, Prisma } from '@prisma/client'
import { getLessonType, addLessonType } from '@/types/course'
import { createId } from '@paralleldrive/cuid2'
import type {
  CourseWithCurriculum,
  ModuleWithLessons,
  CourseFormData,
  ModuleData,
  LessonData,
  ReorderUpdate,
} from '@/types/course'

export class AdminCourseService {
  // ============================================
  // Course CRUD Operations
  // ============================================

  /**
   * Get all courses with optional filters
   */
  async getCourses(filters?: {
    published?: boolean
    featured?: boolean
    category?: string
    search?: string
  }) {
    try {
      const courses = await prisma.course.findMany({
        where: {
          ...(filters?.published !== undefined && { published: filters.published }),
          ...(filters?.featured !== undefined && { featured: filters.featured }),
          ...(filters?.category && { category: { slug: filters.category } }),
          ...(filters?.search && {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          Instructor: true,
          Category: true,
          _count: {
            select: { Enrollment: true, Module: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return courses
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  }

  /**
   * Get course by ID with full curriculum
   */
  async getCourseById(id: string): Promise<CourseWithCurriculum | null> {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          Instructor: true,
          Category: true,
          Module: {
            include: {
              Lesson: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) return null

      // Add lesson types
      return {
        ...course,
        modules: course.Module.map((module) => ({
          ...module,
          lessons: module.Lesson.map(addLessonType),
        })),
      }
    } catch (error) {
      console.error(`Error fetching course by ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Get course by slug
   */
  async getCourseBySlug(slug: string): Promise<CourseWithCurriculum | null> {
    try {
      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          Instructor: true,
          Category: true,
          Module: {
            include: {
              Lesson: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) return null

      // Add lesson types
      return {
        ...course,
        modules: course.Module.map((module) => ({
          ...module,
          lessons: module.Lesson.map(addLessonType),
        })),
      }
    } catch (error) {
      console.error(`Error fetching course by slug ${slug}:`, error)
      throw error
    }
  }

  /**
   * Create a new course
   */
  async createCourse(data: CourseFormData): Promise<Course> {
    try {
      const { categoryId, instructorId, ...courseData } = data
      
      const course = await prisma.course.create({
        data: {
          id: createId(),
          ...courseData,
          published: false, // Default to unpublished
          featured: false, // Default to not featured
          updatedAt: new Date(),
          ...(categoryId && {
            Category: {
              connect: { id: categoryId },
            },
          }),
          ...(instructorId && {
            Instructor: {
              connect: { id: instructorId },
            },
          }),
        },
      })

      return course
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    }
  }

  /**
   * Update a course
   */
  async updateCourse(id: string, data: Partial<CourseFormData>): Promise<Course> {
    try {
      const { categoryId, instructorId, ...courseData } = data
      
      const course = await prisma.course.update({
        where: { id },
        data: {
          ...courseData,
          updatedAt: new Date(),
          ...(categoryId && {
            Category: {
              connect: { id: categoryId },
            },
          }),
          ...(instructorId && {
            Instructor: {
              connect: { id: instructorId },
            },
          }),
        },
      })

      return course
    } catch (error) {
      console.error(`Error updating course ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a course (cascades to modules and lessons)
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      await prisma.course.delete({
        where: { id },
      })
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error)
      throw error
    }
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeCourseId?: string): Promise<boolean> {
    try {
      const course = await prisma.course.findUnique({
        where: { slug },
        select: { id: true },
      })

      if (!course) return false
      if (excludeCourseId && course.id === excludeCourseId) return false

      return true
    } catch (error) {
      console.error(`Error checking slug ${slug}:`, error)
      throw error
    }
  }

  // ============================================
  // Module CRUD Operations
  // ============================================

  /**
   * Create a new module
   */
  async createModule(data: Omit<ModuleData, 'order'>): Promise<Module> {
    try {
      const { courseId, ...moduleData } = data
      
      // Get the next order value
      const maxOrder = await prisma.module.aggregate({
        where: { courseId },
        _max: { order: true },
      })

      const nextOrder = (maxOrder._max.order ?? -1) + 1

      const module = await prisma.module.create({
        data: {
          id: createId(),
          ...moduleData,
          order: nextOrder,
          Course: {
            connect: { id: courseId },
          },
        },
      })

      return module
    } catch (error) {
      console.error('Error creating module:', error)
      throw error
    }
  }

  /**
   * Update a module
   */
  async updateModule(id: string, data: { title: string }): Promise<Module> {
    try {
      const module = await prisma.module.update({
        where: { id },
        data,
      })

      return module
    } catch (error) {
      console.error(`Error updating module ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a module and reorder remaining modules
   */
  async deleteModule(id: string): Promise<void> {
    try {
      // Get module info before deletion
      const module = await prisma.module.findUnique({
        where: { id },
        select: { courseId: true, order: true },
      })

      if (!module) {
        throw new Error('Module not found')
      }

      // Delete module (cascades to lessons)
      await prisma.module.delete({
        where: { id },
      })

      // Reorder remaining modules
      await prisma.module.updateMany({
        where: {
          courseId: module.courseId,
          order: { gt: module.order },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    } catch (error) {
      console.error(`Error deleting module ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // Lesson CRUD Operations
  // ============================================

  /**
   * Create a new lesson
   */
  async createLesson(data: Omit<LessonData, 'order'>): Promise<Lesson> {
    try {
      const { moduleId, ...lessonData } = data
      
      // Get the next order value within the module
      const maxOrder = await prisma.lesson.aggregate({
        where: { moduleId },
        _max: { order: true },
      })

      const nextOrder = (maxOrder._max.order ?? -1) + 1

      const lesson = await prisma.lesson.create({
        data: {
          id: createId(),
          title: lessonData.title,
          content: lessonData.content,
          videoUrl: lessonData.videoUrl,
          duration: lessonData.duration,
          order: nextOrder,
          Module: {
            connect: { id: moduleId },
          },
        },
      })

      return lesson
    } catch (error) {
      console.error('Error creating lesson:', error)
      throw error
    }
  }

  /**
   * Update a lesson
   */
  async updateLesson(
    id: string,
    data: Partial<Omit<LessonData, 'order' | 'moduleId'>>
  ): Promise<Lesson> {
    try {
      const lesson = await prisma.lesson.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          videoUrl: data.videoUrl,
          duration: data.duration,
        },
      })

      return lesson
    } catch (error) {
      console.error(`Error updating lesson ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a lesson and reorder remaining lessons
   */
  async deleteLesson(id: string): Promise<void> {
    try {
      // Get lesson info before deletion
      const lesson = await prisma.lesson.findUnique({
        where: { id },
        select: { moduleId: true, order: true },
      })

      if (!lesson) {
        throw new Error('Lesson not found')
      }

      // Delete lesson
      await prisma.lesson.delete({
        where: { id },
      })

      // Reorder remaining lessons in the module
      await prisma.lesson.updateMany({
        where: {
          moduleId: lesson.moduleId,
          order: { gt: lesson.order },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    } catch (error) {
      console.error(`Error deleting lesson ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // Curriculum Reordering
  // ============================================

  /**
   * Reorder modules and lessons
   */
  async reorderCurriculum(courseId: string, updates: ReorderUpdate[]): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        for (const update of updates) {
          if (update.type === 'module') {
            await tx.module.update({
              where: { id: update.id },
              data: { order: update.order },
            })
          } else if (update.type === 'lesson') {
            await tx.lesson.update({
              where: { id: update.id },
              data: {
                order: update.order,
                ...(update.moduleId && { moduleId: update.moduleId }),
              },
            })
          }
        }
      })
    } catch (error) {
      console.error('Error reordering curriculum:', error)
      throw error
    }
  }

  // ============================================
  // Publishing Workflow
  // ============================================

  /**
   * Publish a course
   */
  async publishCourse(id: string): Promise<Course> {
    try {
      // Verify course has at least one module and lesson
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          Module: {
            include: { Lesson: true },
          },
        },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      if (course.Module.length === 0) {
        throw new Error('Course must have at least one module')
      }

      const hasLessons = course.Module.some((module) => module.Lesson.length > 0)
      if (!hasLessons) {
        throw new Error('Course must have at least one lesson')
      }

      // Publish the course
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          published: true,
          updatedAt: new Date(),
        },
      })

      return updatedCourse
    } catch (error) {
      console.error(`Error publishing course ${id}:`, error)
      throw error
    }
  }

  /**
   * Unpublish a course
   */
  async unpublishCourse(id: string): Promise<Course> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: {
          published: false,
          updatedAt: new Date(),
        },
      })

      return course
    } catch (error) {
      console.error(`Error unpublishing course ${id}:`, error)
      throw error
    }
  }

  /**
   * Set course as featured
   */
  async featureCourse(id: string): Promise<Course> {
    try {
      // Verify course is published
      const course = await prisma.course.findUnique({
        where: { id },
        select: { published: true },
      })

      if (!course) {
        throw new Error('Course not found')
      }

      if (!course.published) {
        throw new Error('Only published courses can be featured')
      }

      const updatedCourse = await prisma.course.update({
        where: { id },
        data: { featured: true },
      })

      return updatedCourse
    } catch (error) {
      console.error(`Error featuring course ${id}:`, error)
      throw error
    }
  }

  /**
   * Remove featured status from course
   */
  async unfeatureCourse(id: string): Promise<Course> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: { featured: false },
      })

      return course
    } catch (error) {
      console.error(`Error unfeaturing course ${id}:`, error)
      throw error
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Map legacy type to new kind
   */
  private mapTypeToKind(type: string): string {
    const typeMap: Record<string, string> = {
      'video': 'VIDEO',
      'article': 'ARTICLE',
      'quiz': 'QUIZ',
      'ar': 'AR',
    }
    return typeMap[type] || 'VIDEO'
  }

  /**
   * Get all categories
   */
  async getCategories() {
    try {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  /**
   * Get all instructors
   */
  async getInstructors() {
    try {
      return await prisma.instructor.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      console.error('Error fetching instructors:', error)
      throw error
    }
  }
}

export const adminCourseService = new AdminCourseService()
