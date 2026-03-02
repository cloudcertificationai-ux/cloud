# Course CRUD API Verification Guide

This guide explains how to verify that all Course CRUD APIs are working correctly.

## Prerequisites

1. **Database is running** - Ensure PostgreSQL is accessible
2. **Admin panel is running** - Start the dev server on port 3001
3. **Admin user exists** - You need admin credentials to test the APIs

## Quick Start

### Step 1: Start the Admin Panel

```bash
cd anywheredoor_admin
npm run dev
```

The server should start on `http://localhost:3001`

### Step 2: Run the Verification Script

In a new terminal:

```bash
cd anywheredoor_admin
npx tsx scripts/verify-course-crud-apis.ts
```

## What Gets Tested

The verification script tests all CRUD operations:

### ✅ CREATE (POST /api/admin/courses)
- ✓ Create course with valid data
- ✓ Generate slug from title if not provided
- ✓ Reject duplicate slugs (409 error)
- ✓ Reject missing required fields (400 error)
- ✓ Reject invalid price values (400 error)

### ✅ READ (GET /api/admin/courses/:id)
- ✓ Retrieve course with full curriculum
- ✓ Include modules ordered by `order` field
- ✓ Include lessons ordered by `order` field
- ✓ Return 404 for nonexistent courses

### ✅ UPDATE (PUT /api/admin/courses/:id)
- ✓ Update course metadata
- ✓ Update `updatedAt` timestamp
- ✓ Prevent slug changes on published courses
- ✓ Allow slug changes on unpublished courses
- ✓ Return 404 for nonexistent courses

### ✅ DELETE (DELETE /api/admin/courses/:id)
- ✓ Delete course successfully
- ✓ Cascade delete all modules
- ✓ Cascade delete all lessons
- ✓ Return 404 for nonexistent courses

## Expected Output

```
🚀 Starting Course CRUD API Verification
============================================================

📝 Testing POST /api/admin/courses (Create Course)
✅ Create course with valid data: Course created successfully

🔍 Testing Validation Errors
✅ Validation: Missing required fields: Correctly rejected with 400
✅ Validation: Negative price: Correctly rejected with 400
✅ Validation: Duplicate slug: Correctly rejected with 409

📖 Testing GET /api/admin/courses/:id (Read Course)
✅ Get course by ID: Course retrieved successfully

🔍 Testing GET with nonexistent ID
✅ Get nonexistent course: Correctly returned 404

✏️ Testing PUT /api/admin/courses/:id (Update Course)
✅ Update course metadata: Course updated successfully

🔒 Testing slug change prevention for published courses
✅ Prevent slug change on published course: Correctly prevented slug change

🗑️ Testing Cascade Deletion
✅ Verify test data created: Found 2 modules and 3 lessons
✅ Delete course: Course deleted successfully
✅ Verify cascade deletion of modules: All modules deleted
✅ Verify cascade deletion of lessons: All lessons deleted

🔍 Testing DELETE with nonexistent ID
✅ Delete nonexistent course: Correctly returned 404

============================================================
📊 Test Summary
============================================================
Total Tests: 14
✅ Passed: 14
❌ Failed: 0
Success Rate: 100.0%

✅ All tests passed!
```

## Manual Testing with Postman/Thunder Client

If you prefer manual testing, here are the endpoints:

### 1. Create Course
```http
POST http://localhost:3001/api/admin/courses
Content-Type: application/json

{
  "title": "My Test Course",
  "slug": "my-test-course",
  "summary": "A test course",
  "priceCents": 9900,
  "currency": "INR",
  "level": "Beginner",
  "durationMin": 120
}
```

### 2. Get Course
```http
GET http://localhost:3001/api/admin/courses/{courseId}
```

### 3. Update Course
```http
PUT http://localhost:3001/api/admin/courses/{courseId}
Content-Type: application/json

{
  "title": "Updated Course Title",
  "priceCents": 12900
}
```

### 4. Delete Course
```http
DELETE http://localhost:3001/api/admin/courses/{courseId}
```

## Verifying Cascade Deletion

To manually verify cascade deletion:

1. Create a course
2. Add modules to the course using Prisma Studio or direct DB queries
3. Add lessons to the modules
4. Delete the course via API
5. Check the database - modules and lessons should be gone

### Using Prisma Studio

```bash
cd anywheredoor_admin
npx prisma studio
```

Then:
1. Open the Course table and note the course ID
2. Open the Module table and verify modules exist for that course
3. Open the Lesson table and verify lessons exist for those modules
4. Delete the course via API
5. Refresh Prisma Studio - modules and lessons should be deleted

## Troubleshooting

### Authentication Errors (401/403)

The APIs require admin authentication. If you get authentication errors:

1. Ensure you're logged in as an admin user
2. Check that NextAuth session is working
3. Verify the `requireAdmin` middleware is correctly configured

### Connection Errors

If the script can't connect:

1. Verify the admin panel is running on port 3001
2. Check that `DATABASE_URL` is set in `.env`
3. Ensure PostgreSQL is running

### Database Errors

If you get Prisma errors:

1. Run migrations: `npx prisma migrate dev`
2. Check database connection: `npx prisma db pull`
3. Verify schema is up to date

## Cascade Deletion Configuration

The Prisma schema has cascade deletion configured:

```prisma
model Module {
  // ...
  Course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}

model Lesson {
  // ...
  Module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

This means:
- Deleting a Course automatically deletes all its Modules
- Deleting a Module automatically deletes all its Lessons
- Deleting a Course cascades to Modules, which cascade to Lessons

## Next Steps

After verification passes:

1. ✅ Mark Task 3 as complete in tasks.md
2. ➡️ Proceed to Task 4: Implement module and lesson CRUD APIs
3. 📝 Document any issues or questions for the user

## Questions or Issues?

If any tests fail or you encounter issues:

1. Check the error messages in the script output
2. Review the API implementation in `src/app/api/admin/courses/`
3. Verify the Prisma schema matches expectations
4. Check the database state with Prisma Studio
