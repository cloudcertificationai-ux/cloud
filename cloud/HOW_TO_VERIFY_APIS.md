# Quick Start: How to Verify Course CRUD APIs

## TL;DR - Fastest Way to Verify

```bash
# Terminal 1: Start admin panel (if not already running)
cd anywheredoor_admin
npm run dev

# Terminal 2: Run tests
cd anywheredoor_admin
./scripts/test-course-apis.sh
```

Expected result: All 11 tests should pass ✅

## What Gets Tested

The script automatically tests:

1. ✅ Create course with valid data (201)
2. ✅ Auto-generate slug from title (201)
3. ✅ Reject duplicate slug (409)
4. ✅ Reject missing fields (400)
5. ✅ Reject invalid price (400)
6. ✅ Get course by ID (200)
7. ✅ Get nonexistent course (404)
8. ✅ Update course metadata (200)
9. ✅ Update nonexistent course (404)
10. ✅ Delete course (200)
11. ✅ Delete nonexistent course (404)

## Cascade Deletion Verification

To verify cascade deletion works:

```bash
# Open Prisma Studio
npx prisma studio
```

Then:
1. Create a course via API (use Postman or curl)
2. In Prisma Studio, add modules to the course
3. Add lessons to those modules
4. Delete the course via API
5. Refresh Prisma Studio → modules and lessons should be gone

## Alternative: Use Postman

1. Import: `scripts/Course_CRUD_APIs.postman_collection.json`
2. Run all 12 requests
3. Set `courseId` variable after creating a course
4. Verify all responses

## Troubleshooting

**401 Unauthorized?**
- Log in to admin panel at http://localhost:3001
- Ensure you have admin role in database

**Connection refused?**
- Start the dev server: `npm run dev`

**Tests failing?**
- Check server logs
- Verify database is running
- Run `npx prisma generate`

## Files Created for You

- `CHECKPOINT_3_VERIFICATION.md` - Detailed checklist
- `scripts/test-course-apis.sh` - Automated test script
- `scripts/Course_CRUD_APIs.postman_collection.json` - Postman tests
- `scripts/API_VERIFICATION_GUIDE.md` - Complete guide
- `TASK_3_COMPLETION_SUMMARY.md` - Summary document

## Success Criteria

✅ All tests pass
✅ Correct status codes (200, 201, 400, 404, 409)
✅ Cascade deletion verified
✅ No critical issues

## Next Step

After verification passes → Proceed to Task 4: Module and Lesson CRUD APIs
