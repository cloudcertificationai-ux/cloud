# Checkpoint 3: Course CRUD API Verification

## Status: ✅ READY FOR VERIFICATION

All Course CRUD APIs have been implemented and are ready for testing.

## Quick Verification Summary

### ✅ Implemented Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/admin/courses` | ✅ | Create new course |
| GET | `/api/admin/courses/:id` | ✅ | Get course with full curriculum |
| PUT | `/api/admin/courses/:id` | ✅ | Update course metadata |
| DELETE | `/api/admin/courses/:id` | ✅ | Delete course with cascade |

### ✅ Validation Implemented

- ✓ Required fields validation (title, priceCents)
- ✓ Slug uniqueness validation
- ✓ Price validation (non-negative)
- ✓ Slug change prevention for published courses
- ✓ Proper error status codes (400, 404, 409)

### ✅ Cascade Deletion Configured

- ✓ Prisma schema has `onDelete: Cascade` for Module → Course
- ✓ Prisma schema has `onDelete: Cascade` for Lesson → Module
- ✓ Deleting a course automatically deletes all modules and lessons

## Verification Methods

Choose one of the following methods to verify the APIs:

### Method 1: Postman Collection (Recommended)

1. Import the Postman collection:
   ```
   anywheredoor_admin/scripts/Course_CRUD_APIs.postman_collection.json
   ```

2. Run through all 12 requests in order

3. After creating a course, copy the `id` from the response and set it as the `courseId` variable in Postman

4. Verify all responses match expected status codes

### Method 2: Manual Testing with curl

See detailed curl commands in `scripts/API_VERIFICATION_GUIDE.md`

### Method 3: Automated Script (Requires Auth Setup)

```bash
cd anywheredoor_admin
npx tsx scripts/verify-course-crud-apis.ts
```

Note: This requires admin authentication to be configured.

## Verification Checklist

### CREATE Operations

- [ ] **Test 1**: Create course with valid data
  - Expected: 201 Created
  - Verify: Course has `published: false` by default
  - Verify: Course has `featured: false` by default
  - Verify: `updatedAt` timestamp is set

- [ ] **Test 2**: Create course without slug
  - Expected: 201 Created
  - Verify: Slug is auto-generated from title (lowercase, hyphenated)

- [ ] **Test 3**: Create course with duplicate slug
  - Expected: 409 Conflict
  - Verify: Error message mentions slug conflict

- [ ] **Test 4**: Create course with missing required fields
  - Expected: 400 Bad Request
  - Verify: Error message lists missing fields

- [ ] **Test 5**: Create course with negative price
  - Expected: 400 Bad Request
  - Verify: Error message mentions price validation

### READ Operations

- [ ] **Test 6**: Get course by valid ID
  - Expected: 200 OK
  - Verify: Response includes course metadata
  - Verify: Response includes `Module` array ordered by `order` field
  - Verify: Each module includes `Lesson` array ordered by `order` field
  - Verify: Response includes `Category` and `Instructor` if set
  - Verify: Response includes `_count` with enrollment and review counts

- [ ] **Test 7**: Get course with nonexistent ID
  - Expected: 404 Not Found
  - Verify: Error message indicates course not found

### UPDATE Operations

- [ ] **Test 8**: Update course metadata (title, summary, price)
  - Expected: 200 OK
  - Verify: Updated fields are reflected in response
  - Verify: `updatedAt` timestamp is updated

- [ ] **Test 9**: Change slug of unpublished course
  - Expected: 200 OK
  - Verify: Slug is updated successfully

- [ ] **Test 10**: Try to change slug of published course
  - Expected: 400 Bad Request
  - Verify: Error message prevents slug change on published course

- [ ] **Test 11**: Update nonexistent course
  - Expected: 404 Not Found
  - Verify: Error message indicates course not found

### DELETE Operations

- [ ] **Test 12**: Delete course (with cascade verification)
  - Setup: Create course, add 2 modules, add 3 lessons
  - Expected: 200 OK
  - Verify: Course is deleted
  - Verify: All modules are deleted (check database)
  - Verify: All lessons are deleted (check database)
  - Verify: Success message in response

- [ ] **Test 13**: Delete nonexistent course
  - Expected: 404 Not Found
  - Verify: Error message indicates course not found

## Cascade Deletion Verification

To verify cascade deletion works correctly:

### Option 1: Using Prisma Studio

1. Start Prisma Studio:
   ```bash
   cd anywheredoor_admin
   npx prisma studio
   ```

2. Create a test course via API

3. In Prisma Studio, add modules to the course:
   - Open Module table
   - Click "Add record"
   - Set `courseId` to your test course ID
   - Set `title` and `order`

4. Add lessons to the modules:
   - Open Lesson table
   - Click "Add record"
   - Set `moduleId` to your test module ID
   - Set `title`, `order`, and `content`

5. Delete the course via API

6. Refresh Prisma Studio:
   - Check Module table - modules should be gone
   - Check Lesson table - lessons should be gone

### Option 2: Using SQL Queries

```sql
-- Before deletion
SELECT COUNT(*) FROM "Module" WHERE "courseId" = 'your-course-id';
SELECT COUNT(*) FROM "Lesson" WHERE "moduleId" IN (
  SELECT id FROM "Module" WHERE "courseId" = 'your-course-id'
);

-- Delete course via API

-- After deletion (should return 0)
SELECT COUNT(*) FROM "Module" WHERE "courseId" = 'your-course-id';
SELECT COUNT(*) FROM "Lesson" WHERE "moduleId" IN (
  SELECT id FROM "Module" WHERE "courseId" = 'your-course-id'
);
```

## Prisma Schema Verification

The cascade deletion is configured in the Prisma schema:

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

This configuration ensures:
- When a Course is deleted → all Modules are deleted
- When a Module is deleted → all Lessons are deleted
- When a Course is deleted → Modules cascade → Lessons cascade

## Expected API Response Formats

### Success Response (201/200)
```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Course Title",
    "slug": "course-slug",
    // ... other fields
  }
}
```

### Error Response (400/404/409)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Common Issues and Solutions

### Issue: 401 Unauthorized

**Cause**: Not authenticated or not logged in as admin

**Solution**: 
1. Ensure you're logged in to the admin panel
2. Check that your session is valid
3. Verify you have admin role in the database

### Issue: 403 Forbidden

**Cause**: Authenticated but not an admin user

**Solution**:
1. Check your user role in the database
2. Update role to ADMIN if needed:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

### Issue: Connection Refused

**Cause**: Admin panel not running

**Solution**:
```bash
cd anywheredoor_admin
npm run dev
```

### Issue: Prisma Client Error

**Cause**: Database schema out of sync

**Solution**:
```bash
cd anywheredoor_admin
npx prisma generate
npx prisma migrate dev
```

## Verification Results

After completing all tests, document your results:

### Summary

- Total Tests: 13
- Passed: ___
- Failed: ___
- Success Rate: ___%

### Failed Tests (if any)

List any tests that failed and the reason:

1. 
2. 
3. 

### Issues Found

Document any issues discovered during testing:

1. 
2. 
3. 

## Sign-off

Once all tests pass and cascade deletion is verified:

- [ ] All CRUD operations work correctly
- [ ] Validation errors return correct status codes
- [ ] Cascade deletion verified in database
- [ ] No critical issues found
- [ ] Ready to proceed to Task 4

**Verified by**: _______________
**Date**: _______________
**Notes**: _______________

## Next Steps

After successful verification:

1. ✅ Mark Task 3 as complete in `.kiro/specs/course-management-system/tasks.md`
2. ➡️ Proceed to Task 4: Implement module and lesson CRUD APIs
3. 📝 Document any questions or concerns for the user
