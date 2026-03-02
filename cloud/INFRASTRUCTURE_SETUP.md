# Course Management System - Infrastructure Setup Summary

## Task 1: Set up shared infrastructure and utilities ✅

This document summarizes the infrastructure and utilities that have been set up for the Course Management System.

---

## ✅ Completed Components

### 1. Database Configuration (Prisma) ✅

**Status:** Already configured and shared between both projects

**Location:** 
- `anywheredoor/prisma/schema.prisma` (shared schema)
- `anywheredoor_admin/src/lib/db.ts` (admin panel client)

**Details:**
- Both `anywheredoor` and `anywheredoor_admin` use the SAME PostgreSQL database
- Prisma schema includes all required models: Course, Module, Lesson, Instructor, Category, Enrollment, CourseProgress
- Module and Lesson models have `order` field for curriculum ordering
- Cascade delete configured: Course → Modules → Lessons
- All necessary indexes in place for performance

**Key Models:**
```typescript
Course {
  id, title, slug, summary, description, priceCents, currency,
  published, featured, level, durationMin, rating, thumbnailUrl,
  instructorId, categoryId, createdAt, updatedAt
}

Module {
  id, title, order, courseId
  // onDelete: Cascade from Course
}

Lesson {
  id, title, content, videoUrl, duration, order, moduleId
  // onDelete: Cascade from Module
}
```

---

### 2. TypeScript Types ✅

**Status:** Comprehensive types already implemented

**Location:** `anywheredoor_admin/src/types/course.ts`

**Implemented Types:**
- `LessonType` - Type discriminator ('video' | 'article' | 'quiz' | 'ar')
- `CourseFormData` - Course creation/update data
- `CourseWithCurriculum` - Course with full module/lesson hierarchy
- `ModuleWithLessons` - Module with its lessons
- `LessonWithType` - Lesson with computed type
- `CurriculumModule` - For drag-and-drop interface
- `CurriculumLesson` - For drag-and-drop interface
- `LessonData` - Lesson creation/update data
- `ModuleData` - Module creation/update data
- `ReorderUpdate` - Curriculum reordering operations
- `QuizContent` & `QuizQuestion` - Quiz lesson structure
- `ARContent` - AR/Interactive lesson structure
- `MediaUploadResponse` - Media upload response
- `MediaType` - Media type discriminator
- `CourseSummary` - Course list view data

**Helper Functions:**
- `getLessonType(lesson)` - Determine lesson type from data
- `addLessonType(lesson)` - Add type field to lesson

---

### 3. Zod Validation Schemas ✅

**Status:** Complete validation schemas implemented

**Location:** `anywheredoor_admin/src/lib/validations/course.ts`

**Implemented Schemas:**
- `courseSchema` - Course validation with all fields
- `createCourseSchema` - Course creation (required fields)
- `updateCourseSchema` - Course updates (partial)
- `moduleSchema` - Module validation
- `createModuleSchema` - Module creation
- `updateModuleSchema` - Module updates
- `lessonSchema` - Lesson validation with type-specific rules
- `createLessonSchema` - Lesson creation
- `updateLessonSchema` - Lesson updates
- `quizContentSchema` - Quiz content validation
- `arContentSchema` - AR content validation
- `reorderUpdateSchema` - Reorder operation validation
- `reorderRequestSchema` - Batch reorder validation
- `mediaUploadSchema` - Media upload validation

**Validation Rules:**
- Title: 3-200 characters
- Slug: lowercase alphanumeric + hyphens, unique
- Price: non-negative integer (in cents)
- Currency: 3-letter code (default: INR)
- Level: enum (Beginner, Intermediate, Advanced)
- Video lessons: must have videoUrl
- Quiz lessons: must have valid quiz content JSON
- AR lessons: must have valid AR content JSON

**Helper Functions:**
- `generateSlug(title)` - Auto-generate slug from title
- `validateCourseData(data)` - Validate course data
- `validateModuleData(data)` - Validate module data
- `validateLessonData(data)` - Validate lesson data
- `validateReorderRequest(data)` - Validate reorder request

---

### 4. Error Handling Utilities ✅

**Status:** Comprehensive error handling system implemented

**Location:** `anywheredoor_admin/src/lib/api-errors.ts`

**Error Classes:**
- `ApiError` - Base error class with structured format
- `ValidationError` - Field-specific validation errors (400)
- `AuthenticationError` - Authentication required (401)
- `AuthorizationError` - Insufficient permissions (403)
- `NotFoundError` - Resource not found (404)
- `ConflictError` - Resource conflict (409)
- `SlugExistsError` - Slug already exists (409)
- `RateLimitError` - Rate limit exceeded (429)
- `InternalServerError` - Server error (500)
- `DatabaseError` - Database operation failed (500)
- `ServiceUnavailableError` - Service unavailable (503)

**Error Response Format:**
```typescript
{
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>,
    timestamp: string
  }
}
```

**Utilities:**
- `ErrorResponseBuilder` - Build standardized error responses
- `handleApiError(error)` - Catch and format errors
- `withErrorHandler(handler)` - Async error wrapper for API routes
- `SuccessResponseBuilder` - Build success responses

**Features:**
- Automatic Zod validation error formatting
- Automatic Prisma error handling (unique constraints, not found, etc.)
- Development vs production error messages
- Retry-After headers for rate limiting
- Field-specific validation error details

---

### 5. Admin Course Data Service ✅

**Status:** Complete data service implemented

**Location:** `anywheredoor_admin/src/data/admin-course-service.ts`

**Implemented Methods:**

**Course Operations:**
- `getCourses(filters)` - Get all courses with filtering
- `getCourseById(id)` - Get course with full curriculum
- `getCourseBySlug(slug)` - Get course by slug
- `createCourse(data)` - Create new course
- `updateCourse(id, data)` - Update course
- `deleteCourse(id)` - Delete course (cascades)
- `slugExists(slug, excludeId)` - Check slug uniqueness

**Module Operations:**
- `createModule(data)` - Create module with auto-order
- `updateModule(id, data)` - Update module title
- `deleteModule(id)` - Delete module and reorder remaining

**Lesson Operations:**
- `createLesson(data)` - Create lesson with auto-order
- `updateLesson(id, data)` - Update lesson
- `deleteLesson(id)` - Delete lesson and reorder remaining

**Curriculum Operations:**
- `reorderCurriculum(courseId, updates)` - Batch reorder modules/lessons

**Publishing Operations:**
- `publishCourse(id)` - Publish course (validates content)
- `unpublishCourse(id)` - Unpublish course
- `featureCourse(id)` - Set as featured (requires published)
- `unfeatureCourse(id)` - Remove featured status

**Helper Methods:**
- `getCategories()` - Get all categories
- `getInstructors()` - Get all instructors

**Features:**
- Follows same pattern as frontend's `db-data-service.ts`
- Auto-increments order values for new modules/lessons
- Reorders remaining items after deletion
- Validates publishing requirements (at least 1 module + 1 lesson)
- Transaction support for batch operations
- Comprehensive error handling

---

### 6. API Utilities ✅

**Status:** Complete API helper functions implemented

**Location:** `anywheredoor_admin/src/lib/api-utils.ts`

**Implemented Functions:**

**Authentication:**
- `requireAuth(request)` - Verify user is authenticated
- `requireAdmin(request)` - Verify user has admin role

**Request Parsing:**
- `parseRequestBody<T>(request)` - Parse JSON body
- `getQueryParam(request, param)` - Get single query param
- `getQueryParams(request)` - Get all query params
- `getPaginationParams(request)` - Parse page/limit params

**Response Helpers:**
- `createPaginatedResponse(data, total, page, limit)` - Paginated response
- `getCacheHeaders(maxAge)` - Generate cache headers
- `addCorsHeaders(response, origin)` - Add CORS headers
- `handleOptionsRequest()` - Handle OPTIONS for CORS

**Validation:**
- `validateRequiredFields(data, fields)` - Check required fields
- `sanitizeString(input)` - Basic XSS prevention

**Utilities:**
- `getRouteParams(pathname, pattern)` - Extract route params
- `logApiRequest(request, context)` - Log API requests
- `measureExecutionTime(fn, label)` - Performance measurement

---

### 7. Drag-and-Drop Library ✅

**Status:** Installed and ready to use

**Package:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Versions:**
- `@dnd-kit/core`: ^6.3.1
- `@dnd-kit/sortable`: ^10.0.0
- `@dnd-kit/utilities`: ^3.2.2

**Installation Command:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Usage:** Ready for CurriculumBuilder component implementation

---

## 📋 Implementation Checklist

- [x] Prisma database configuration (shared between projects)
- [x] TypeScript types for Course, Module, Lesson structures
- [x] Zod validation schemas for API requests
- [x] Error handling utilities and error response formatters
- [x] Admin course data service (following frontend patterns)
- [x] API utility functions (auth, parsing, pagination, etc.)
- [x] @dnd-kit library installation

---

## 🎯 Next Steps

With the infrastructure in place, you can now proceed to:

1. **Task 2:** Implement admin panel course CRUD APIs
   - Use `adminCourseService` methods
   - Apply validation with Zod schemas
   - Handle errors with error utilities
   - Secure with `requireAdmin` middleware

2. **Task 13:** Build admin panel UI components
   - Use TypeScript types for props
   - Implement drag-and-drop with @dnd-kit
   - Validate forms with Zod schemas
   - Display errors with error formatters

---

## 📚 Key Patterns to Follow

### API Route Pattern
```typescript
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, SuccessResponseBuilder } from '@/lib/api-errors'
import { adminCourseService } from '@/data/admin-course-service'
import { createCourseSchema } from '@/lib/validations/course'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const data = createCourseSchema.parse(body)
    const course = await adminCourseService.createCourse(data)
    return SuccessResponseBuilder.created(course)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Data Service Pattern
```typescript
// Always use try-catch
// Always log errors
// Always throw errors (let API route handle them)
async createCourse(data: CourseFormData): Promise<Course> {
  try {
    const course = await prisma.course.create({ data })
    return course
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}
```

### Component Pattern
```typescript
import { CourseFormData } from '@/types/course'
import { courseSchema } from '@/lib/validations/course'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function CourseForm() {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })
  
  // Component implementation
}
```

---

## 🔗 Related Files

**Frontend (anywheredoor):**
- `src/data/db-data-service.ts` - Reference pattern for data services
- `prisma/schema.prisma` - Shared database schema

**Admin Panel (anywheredoor_admin):**
- `src/types/course.ts` - TypeScript types
- `src/lib/validations/course.ts` - Zod schemas
- `src/lib/api-errors.ts` - Error handling
- `src/lib/api-utils.ts` - API utilities
- `src/data/admin-course-service.ts` - Data service
- `src/lib/db.ts` - Prisma client

---

## ✅ Task 1 Complete

All infrastructure and utilities are now in place for the Course Management System. The foundation is solid and follows best practices:

- ✅ Type-safe with TypeScript
- ✅ Validated with Zod
- ✅ Error handling with structured responses
- ✅ Data access with service layer
- ✅ Shared database between projects
- ✅ Ready for drag-and-drop UI
- ✅ Follows existing project patterns

You can now proceed with implementing the API routes (Task 2) and UI components (Task 13).
