import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, sanitizeInput, createAuditLog } from '@/lib/security'
import { prisma } from '@/lib/db'

// GET /api/external/courses - Get courses for main website
export async function GET(request: NextRequest) {
  try {
    // API key validation is handled by middleware
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 items
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    
    // Sanitize inputs
    const sanitizedCategory = category ? sanitizeInput(category) : null
    const sanitizedLevel = level ? sanitizeInput(level) : null
    
    // Build where clause
    const where: any = {
      published: true, // Only return published courses
    }
    
    if (sanitizedCategory) {
      where.Category = {
        slug: sanitizedCategory.toLowerCase()
      }
    }
    
    if (sanitizedLevel) {
      where.level = sanitizedLevel
    }
    
    // Fetch courses from database
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
          Category: {
            select: {
              name: true,
              slug: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.course.count({ where })
    ])
    
    // Format response
    const publicCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.summary || '',
      category: course.Category?.name || 'Uncategorized',
      level: course.level || 'Beginner',
      price: course.priceCents / 100,
      currency: course.currency,
    }))
    
    const response = {
      courses: publicCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      timestamp: new Date().toISOString(),
    }
    
    // Log API access
    const auditLog = createAuditLog({
      userId: 'api_user',
      action: 'api_courses_accessed',
      resource: 'external_api',
      resourceId: 'courses',
      details: {
        page,
        limit,
        category: sanitizedCategory,
        level: sanitizedLevel,
        resultCount: publicCourses.length,
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    })
    console.log('API Access:', auditLog)
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'X-API-Version': '1.0',
        'X-Request-ID': crypto.randomUUID(),
      },
    })
    
  } catch (error) {
    console.error('API Error:', error)
    
    const auditLog = createAuditLog({
      userId: 'api_user',
      action: 'api_error',
      resource: 'external_api',
      resourceId: 'courses',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
      errorMessage: 'API request failed',
    })
    console.log('API Error:', auditLog)
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Unable to fetch courses',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// POST /api/external/courses - Create course (admin only)
export async function POST(request: NextRequest) {
  try {
    // Additional validation for write operations
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || !validateApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'shortDescription', 'category', 'level', 'price']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }
    
    // Sanitize input data
    const sanitizedData = sanitizeInput(body)
    
    // Create new course in database
    const newCourse = await prisma.course.create({
      data: {
        id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: sanitizedData.title,
        slug: sanitizedData.title.toLowerCase().replace(/\s+/g, '-'),
        summary: sanitizedData.shortDescription,
        priceCents: Math.round(sanitizedData.price * 100),
        currency: sanitizedData.currency || 'USD',
        level: sanitizedData.level,
        published: false, // New courses start as drafts
        updatedAt: new Date(),
        categoryId: sanitizedData.categoryId || undefined,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        level: true,
        categoryId: true,
      }
    })
    
    // Log course creation
    const auditLog = createAuditLog({
      userId: 'api_user',
      action: 'course_created',
      resource: 'external_api',
      resourceId: newCourse.id,
      details: {
        title: newCourse.title,
        categoryId: newCourse.categoryId,
        level: newCourse.level,
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    })
    console.log('API Action:', auditLog)
    
    return NextResponse.json(
      {
        message: 'Course created successfully',
        course: {
          id: newCourse.id,
          title: newCourse.title,
          slug: newCourse.slug,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Course creation error:', error)
    
    const auditLog = createAuditLog({
      userId: 'api_user',
      action: 'course_creation_failed',
      resource: 'external_api',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
      errorMessage: 'Course creation failed',
    })
    console.log('API Error:', auditLog)
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Unable to create course',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}