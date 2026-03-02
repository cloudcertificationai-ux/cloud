# Curriculum Reorder API Documentation

## Overview

The curriculum reorder API endpoint allows administrators to reorder modules and lessons within a course, including moving lessons between modules. All operations are executed in a single database transaction to ensure consistency.

## Endpoint

```
PUT /api/admin/courses/:id/reorder
```

## Authentication

Requires admin authentication. The request must include a valid admin session.

## Request Format

### URL Parameters

- `id` (string, required): The course ID

### Request Body

```typescript
{
  operations: Array<{
    type: 'module' | 'lesson'
    id: string
    order: number
    moduleId?: string  // Required for lesson operations
  }>
}
```

### Field Descriptions

- `operations`: Array of reorder operations to execute
  - `type`: Either "module" or "lesson"
  - `id`: The ID of the module or lesson to reorder
  - `order`: The new order value (0-indexed)
  - `moduleId`: Required for lesson operations. Specifies the target module (allows moving lessons between modules)

## Examples

### Example 1: Reorder Modules

Swap the order of two modules:

```json
{
  "operations": [
    {
      "type": "module",
      "id": "module-1-id",
      "order": 1
    },
    {
      "type": "module",
      "id": "module-2-id",
      "order": 0
    }
  ]
}
```

### Example 2: Reorder Lessons Within a Module

Swap the order of two lessons in the same module:

```json
{
  "operations": [
    {
      "type": "lesson",
      "id": "lesson-1-id",
      "order": 1,
      "moduleId": "module-1-id"
    },
    {
      "type": "lesson",
      "id": "lesson-2-id",
      "order": 0,
      "moduleId": "module-1-id"
    }
  ]
}
```

### Example 3: Move Lesson Between Modules

Move a lesson from one module to another:

```json
{
  "operations": [
    {
      "type": "lesson",
      "id": "lesson-1-id",
      "order": 0,
      "moduleId": "module-2-id"
    }
  ]
}
```

### Example 4: Complex Reorder (Modules and Lessons)

Reorder both modules and lessons in a single request:

```json
{
  "operations": [
    {
      "type": "module",
      "id": "module-1-id",
      "order": 1
    },
    {
      "type": "module",
      "id": "module-2-id",
      "order": 0
    },
    {
      "type": "lesson",
      "id": "lesson-1-id",
      "order": 0,
      "moduleId": "module-2-id"
    },
    {
      "type": "lesson",
      "id": "lesson-2-id",
      "order": 1,
      "moduleId": "module-2-id"
    }
  ]
}
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Curriculum reordered successfully",
    "course": {
      "id": "course-id",
      "title": "Course Title",
      "Module": [
        {
          "id": "module-id",
          "title": "Module Title",
          "order": 0,
          "Lesson": [
            {
              "id": "lesson-id",
              "title": "Lesson Title",
              "order": 0
            }
          ]
        }
      ]
    }
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error message",
    "details": {
      "issues": [
        {
          "path": ["operations"],
          "message": "At least one reorder operation is required"
        }
      ]
    }
  }
}
```

Common validation errors:
- Empty operations array
- Missing `moduleId` for lesson operations
- Invalid `type` value (must be "module" or "lesson")
- Negative order values

#### 400 Bad Request - Business Logic Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more modules do not belong to this course"
  }
}
```

Common business logic errors:
- Modules don't belong to the specified course
- Lessons don't exist
- Target modules don't belong to the course

#### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Course with ID 'course-id' not found"
  }
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

## Validation Rules

1. **Operations Array**: Must contain at least one operation
2. **Module Operations**: 
   - Must have valid module ID
   - Module must belong to the specified course
   - Order must be a non-negative integer
3. **Lesson Operations**:
   - Must have valid lesson ID
   - Must include `moduleId`
   - Lesson must exist
   - Target module must belong to the specified course
   - Order must be a non-negative integer

## Transaction Behavior

All operations are executed within a single database transaction. This ensures:
- **Atomicity**: Either all operations succeed or none do
- **Consistency**: The curriculum structure remains valid throughout
- **Isolation**: No other requests can see partial updates
- **Durability**: Once committed, changes are permanent

If any operation fails, the entire transaction is rolled back and no changes are applied.

## Audit Logging

Every successful reorder operation creates an audit log entry with:
- User ID of the admin who performed the action
- Action type: `CURRICULUM_REORDERED`
- Resource type: `Course`
- Resource ID: Course ID
- Details: Number of module and lesson operations, plus the full operations array

## Best Practices

1. **Batch Operations**: Include all related reorder operations in a single request to maintain consistency
2. **Order Values**: Use sequential integers starting from 0 for clarity
3. **Moving Lessons**: When moving a lesson between modules, update the order values of other lessons in both modules
4. **Error Handling**: Always check the response status and handle errors appropriately
5. **Optimistic UI**: Update the UI optimistically but revert on error

## Testing

Use the provided test script to verify the endpoint:

```bash
cd anywheredoor_admin
tsx scripts/test-reorder-endpoint.ts
```

## Implementation Details

### Database Schema

The reorder endpoint relies on the following Prisma schema:

```prisma
model Module {
  id       String   @id
  title    String
  order    Int      // Used for ordering
  courseId String
  Lesson   Lesson[]
  Course   Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@index([courseId])
  @@index([order])
}

model Lesson {
  id       String  @id
  title    String
  order    Int     // Used for ordering
  moduleId String  // Can be updated to move between modules
  Module   Module  @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@index([moduleId])
  @@index([order])
}
```

### Validation Schema

The endpoint uses Zod for request validation:

```typescript
const reorderOperationSchema = z.object({
  type: z.enum(['module', 'lesson']),
  id: z.string().min(1),
  order: z.number().int().min(0),
  moduleId: z.string().optional(),
})

const reorderRequestSchema = z.object({
  operations: z.array(reorderOperationSchema).min(1)
    .refine(
      (operations) => {
        const lessonOps = operations.filter((op) => op.type === 'lesson')
        return lessonOps.every((op) => op.moduleId)
      },
      { message: 'All lesson operations must include moduleId' }
    ),
})
```

## Related Endpoints

- `POST /api/admin/courses/:id/modules` - Create a new module
- `PUT /api/admin/courses/:id/modules/:moduleId` - Update module metadata
- `DELETE /api/admin/courses/:id/modules/:moduleId` - Delete module
- `POST /api/admin/courses/:id/modules/:moduleId/lessons` - Create a new lesson
- `PUT /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId` - Update lesson
- `DELETE /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId` - Delete lesson

## Requirements Satisfied

This endpoint satisfies the following requirements from the design document:

- **Requirement 2.2**: Module reordering updates all affected orders
- **Requirement 2.3**: Lesson reordering updates order and moduleId
- **Requirement 2.6**: Curriculum changes are persisted to Module and Lesson tables
