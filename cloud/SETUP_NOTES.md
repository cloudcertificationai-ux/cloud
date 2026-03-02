# Setup Notes for Course Management System

## Required Package Installation

Due to disk space constraints during initial setup, the following packages need to be installed:

```bash
cd anywheredoor_admin
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

These packages are required for the drag-and-drop curriculum builder functionality.

## Completed Infrastructure Setup

The following infrastructure has been set up for the Course Management System:

### 1. TypeScript Types (`src/types/course.ts`)
- Course, Module, and Lesson type definitions
- Form data interfaces
- Curriculum builder interfaces
- Helper functions for lesson type detection

### 2. Zod Validation Schemas (`src/lib/validations/course.ts`)
- Course creation and update validation
- Module and lesson validation
- Reorder operation validation
- Quiz and AR content validation
- Slug generation utility

### 3. Error Handling (`src/lib/api-errors.ts`)
- Standardized error classes (ApiError, ValidationError, NotFoundError, etc.)
- Error response builder
- Error handler middleware with Zod and Prisma error handling
- Success response builder
- HTTP status code constants

### 4. Database Client (`src/lib/db.ts`)
- Prisma client instance with connection pooling
- Development logging configuration

### 5. Data Service (`src/data/course-data-service.ts`)
- Course CRUD operations
- Module CRUD operations
- Lesson CRUD operations
- Publishing workflow methods
- Curriculum reordering
- Follows pattern from frontend's db-data-service.ts

## Next Steps

After installing the @dnd-kit packages, you can proceed with:
- Task 2: Implement admin panel course CRUD APIs
- Task 13: Build admin panel UI components (including CurriculumBuilder)

## Database Configuration

Both the admin panel and frontend share the same database. Ensure your `.env` file contains:

```
DATABASE_URL="postgresql://..."
```

The Prisma schema is already configured with all required models:
- Course
- Module (with cascade delete)
- Lesson (with cascade delete)
- Instructor
- Category
- Enrollment
- CourseProgress

No database schema changes are required for this implementation.
