// src/data/db-data-service.ts
import prisma from '@/lib/db'
import { Course, Enrollment, User, Prisma } from '@prisma/client'

export class DbDataService {
  // ============================================
  // Courses
  // ============================================
  
  async getCourses(filters?: {
    category?: string
    level?: string
    search?: string
    published?: boolean
    featured?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }) {
    try {
      // Pagination defaults
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      // Build where clause
      const where: Prisma.CourseWhereInput = {
        published: filters?.published ?? true,
        ...(filters?.featured !== undefined && { featured: filters.featured }),
        ...(filters?.category && { category: { slug: filters.category } }),
        ...(filters?.level && { level: filters.level }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      };

      // Build orderBy clause
      const sortBy = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder || 'desc';
      
      let orderBy: Prisma.CourseOrderByWithRelationInput = {};
      
      // Map sortBy to valid Prisma fields
      switch (sortBy) {
        case 'title':
          orderBy = { title: sortOrder as 'asc' | 'desc' };
          break;
        case 'rating':
          orderBy = { rating: sortOrder as 'asc' | 'desc' };
          break;
        case 'price':
          orderBy = { priceCents: sortOrder as 'asc' | 'desc' };
          break;
        case 'createdAt':
        case 'date':
          orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
          break;
        case 'updatedAt':
          orderBy = { updatedAt: sortOrder as 'asc' | 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      // Execute queries in parallel
      // Optimize: Use select to fetch only needed fields for list view
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            priceCents: true,
            currency: true,
            level: true,
            durationMin: true,
            rating: true,
            thumbnailUrl: true,
            published: true,
            featured: true,
            createdAt: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: { enrollments: true, reviews: true },
            },
          },
          orderBy,
          skip,
          take: pageSize,
        }),
        prisma.course.count({ where }),
      ]);
      
      return {
        courses,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('Error fetching courses:', error)
      return {
        courses: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }
  }

  async getCourseBySlug(slug: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          description: true,
          priceCents: true,
          currency: true,
          published: true,
          featured: true,
          level: true,
          durationMin: true,
          rating: true,
          thumbnailUrl: true,
          createdAt: true,
          updatedAt: true,
          instructor: {
            select: {
              id: true,
              name: true,
              bio: true,
              avatar: true,
              company: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          modules: {
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                  duration: true,
                  videoUrl: true,
                  content: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          testimonials: {
            select: {
              id: true,
              author: true,
              message: true,
              createdAt: true,
            },
          },
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
      })
      
      return course
    } catch (error) {
      console.error(`Error fetching course by slug ${slug}:`, error)
      return null
    }
  }

  async getCourseById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        description: true,
        priceCents: true,
        currency: true,
        published: true,
        featured: true,
        level: true,
        durationMin: true,
        rating: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        instructorId: true,
        categoryId: true,
        instructor: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true,
            company: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
                duration: true,
                videoUrl: true,
                content: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async getCourseCurriculum(slug: string) {
    try {
      const course = await prisma.course.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          modules: {
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                  duration: true,
                  videoUrl: true,
                  // Exclude content field - only metadata
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!course) {
        return null;
      }

      // Add lesson type based on available fields
      const modulesWithTypes = course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          type: lesson.videoUrl ? 'video' : 'article', // Simplified type detection
        })),
      }));

      return {
        ...course,
        modules: modulesWithTypes,
      };
    } catch (error) {
      console.error(`Error fetching curriculum for slug ${slug}:`, error);
      return null;
    }
  }

  // ============================================
  // Enrollments
  // ============================================
  
  async getUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: true,
            modules: {
              include: { lessons: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })
  }

  async createEnrollment(userId: string, courseId: string, source: string = 'purchase') {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
        source,
        status: 'ACTIVE',
      },
      include: {
        course: true,
      },
    })
  }

  async checkEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })
  }

  // ============================================
  // Progress
  // ============================================
  
  async getCourseProgress(userId: string, courseId: string) {
    const progress = await prisma.courseProgress.findMany({
      where: { userId, courseId },
    })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    })

    if (!course) return null

    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )
    const completedLessons = progress.filter((p) => p.completed).length
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    return {
      courseId,
      totalLessons,
      completedLessons,
      completionPercentage,
      progress,
    }
  }

  async updateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean,
    timeSpent?: number
  ) {
    return prisma.courseProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed,
        ...(timeSpent && { timeSpent }),
        timestamp: new Date(),
      },
      create: {
        userId,
        courseId,
        lessonId,
        completed,
        timeSpent: timeSpent || 0,
      },
    })
  }

  // ============================================
  // Admin functions
  // ============================================
  
  async getAllStudents(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: { enrollments: true, purchases: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getStudentDetail(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        enrollments: {
          include: {
            course: true,
            purchase: true,
          },
        },
        purchases: {
          include: {
            course: true,
          },
        },
        reviews: {
          include: {
            course: true,
          },
        },
      },
    })
  }

  async getEnrollmentStats() {
    const [totalEnrollments, activeStudents, completedCourses, totalRevenue] = await Promise.all([
      prisma.enrollment.count(),
      prisma.user.count({
        where: {
          enrollments: {
            some: {
              status: 'ACTIVE',
            },
          },
        },
      }),
      prisma.enrollment.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.purchase.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amountCents: true },
      }),
    ])

    const completionRate =
      totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0

    return {
      totalEnrollments,
      activeStudents,
      completedCourses,
      completionRate,
      totalRevenue: (totalRevenue._sum.amountCents || 0) / 100,
    }
  }
}

export const dbDataService = new DbDataService()
