// src/data/course-data-service.ts
/**
 * Course data service for admin panel
 * Provides database operations for course management
 * Follows the pattern from frontend's db-data-service.ts
 */

import prisma from '@/lib/db'
import { CourseFormData, ModuleData, LessonData, ReorderUpdate } from '@/types/course'
import { NotFoundError, SlugExistsError } from '@/lib/api-errors'
import { createId } from '@paralleldrive/cuid2'

export class CourseDataService {
  // ============================================
  // Courses
  // ============================================

  /**
   * Get all courses with optional filters
   */
  async getCourses(filters?: {
    category?: string
    level?: string
    search?: string
    published?: boolean
  }) {
    try {
      const courses = await prisma.course.findMany({
        where: {
          ...(filters?.published !== undefined && { published: filters.published }),
          ...(filters?.category && { category: { slug: filters.category } }),
          ...(filters?.level && { level: filters.level }),
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
            select: { Enrollment: true, Review: true, Module: true },
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
  async getCourseById(id: string) {
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

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    return course
  }

  /**
   * Get course by slug
   */
  async getCourseBySlug(slug: string) {
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

    if (!course) {
      throw new NotFoundError('Course', slug)
    }

    return course
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeCourseId?: string): Promise<boolean> {
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!course) return false
    if (excludeCourseId && course.id === excludeCourseId) return false
    return true
  }

  /**
   * Create a new course
   */
  async createCourse(data: CourseFormData) {
    // Check if slug already exists
    if (await this.slugExists(data.slug)) {
      throw new SlugExistsError(data.slug)
    }

    const { categoryId, instructorId, ...courseData } = data

    const course = await prisma.course.create({
      data: {
        id: createId(),
        ...courseData,
        published: false,
        featured: false,
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
      include: {
        Instructor: true,
        Category: true,
      },
    })

    return course
  }

  /**
   * Update a course
   */
  async updateCourse(id: string, data: Partial<CourseFormData>) {
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { id: true, published: true, slug: true },
    })

    if (!existingCourse) {
      throw new NotFoundError('Course', id)
    }

    // If slug is being changed, check if it already exists
    if (data.slug && data.slug !== existingCourse.slug) {
      if (await this.slugExists(data.slug, id)) {
        throw new SlugExistsError(data.slug)
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        Instructor: true,
        Category: true,
      },
    })

    return course
  }

  /**
   * Delete a course (cascades to modules and lessons)
   */
  async deleteCourse(id: string) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    // Delete course (Prisma will cascade delete modules and lessons)
    await prisma.course.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Publish a course
   */
  async publishCourse(id: string) {
    // Check if course exists and has content
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        Module: {
          include: {
            Lesson: true,
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    // Validate course has at least one module and one lesson
    if (course.Module.length === 0) {
      throw new Error('Course must have at least one module before publishing')
    }

    const hasLessons = course.Module.some((module) => module.Lesson.length > 0)
    if (!hasLessons) {
      throw new Error('Course must have at least one lesson before publishing')
    }

    // Publish course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        published: true,
        updatedAt: new Date(),
      },
    })

    return updatedCourse
  }

  /**
   * Unpublish a course
   */
  async unpublishCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        published: false,
        updatedAt: new Date(),
      },
    })

    return updatedCourse
  }

  /**
   * Feature a course
   */
  async featureCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, published: true },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    if (!course.published) {
      throw new Error('Only published courses can be featured')
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        featured: true,
        updatedAt: new Date(),
      },
    })

    return updatedCourse
  }

  /**
   * Unfeature a course
   */
  async unfeatureCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        featured: false,
        updatedAt: new Date(),
      },
    })

    return updatedCourse
  }

  // ============================================
  // Modules
  // ============================================

  /**
   * Create a new module
   */
  async createModule(courseId: string, data: Omit<ModuleData, 'courseId' | 'order'>) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      throw new NotFoundError('Course', courseId)
    }

    // Get next order value
    const maxOrder = await prisma.module.aggregate({
      where: { courseId },
      _max: { order: true },
    })

    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const module = await prisma.module.create({
      data: {
        id: createId(),
        title: data.title,
        order: nextOrder,
        Course: {
          connect: { id: courseId },
        },
      },
    })

    return module
  }

  /**
   * Update a module
   */
  async updateModule(id: string, data: { title: string }) {
    const module = await prisma.module.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!module) {
      throw new NotFoundError('Module', id)
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data,
    })

    return updatedModule
  }

  /**
   * Delete a module and reorder remaining modules
   */
  async deleteModule(id: string) {
    const module = await prisma.module.findUnique({
      where: { id },
      select: { id: true, courseId: true, order: true },
    })

    if (!module) {
      throw new NotFoundError('Module', id)
    }

    // Delete module (cascades to lessons)
    await prisma.$transaction(async (tx) => {
      await tx.module.delete({
        where: { id },
      })

      // Reorder remaining modules
      await tx.module.updateMany({
        where: {
          courseId: module.courseId,
          order: { gt: module.order },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    })

    return { success: true }
  }

  // ============================================
  // Lessons
  // ============================================

  /**
   * Create a new lesson
   */
  async createLesson(moduleId: string, data: Omit<LessonData, 'moduleId' | 'order'>) {
    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true },
    })

    if (!module) {
      throw new NotFoundError('Module', moduleId)
    }

    // Get next order value
    const maxOrder = await prisma.lesson.aggregate({
      where: { moduleId },
      _max: { order: true },
    })

    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const lesson = await prisma.lesson.create({
      data: {
        id: createId(),
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        duration: data.duration,
        order: nextOrder,
        Module: {
          connect: { id: moduleId },
        },
      },
    })

    return lesson
  }

  /**
   * Update a lesson
   */
  async updateLesson(id: string, data: Partial<Omit<LessonData, 'moduleId' | 'order'>>) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!lesson) {
      throw new NotFoundError('Lesson', id)
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.duration !== undefined && { duration: data.duration }),
      },
    })

    return updatedLesson
  }

  /**
   * Delete a lesson and reorder remaining lessons
   */
  async deleteLesson(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: { id: true, moduleId: true, order: true },
    })

    if (!lesson) {
      throw new NotFoundError('Lesson', id)
    }

    // Delete lesson
    await prisma.$transaction(async (tx) => {
      await tx.lesson.delete({
        where: { id },
      })

      // Reorder remaining lessons in module
      await tx.lesson.updateMany({
        where: {
          moduleId: lesson.moduleId,
          order: { gt: lesson.order },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    })

    return { success: true }
  }

  // ============================================
  // Reordering
  // ============================================

  /**
   * Reorder modules and lessons
   */
  async reorderCurriculum(courseId: string, updates: ReorderUpdate[]) {
    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      throw new NotFoundError('Course', courseId)
    }

    // Apply updates in a transaction
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

    // Return updated curriculum
    return this.getCourseById(courseId)
  }
}

export const courseDataService = new CourseDataService()
