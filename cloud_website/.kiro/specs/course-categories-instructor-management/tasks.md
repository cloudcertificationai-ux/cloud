# Implementation Plan: course-categories-instructor-management

## Overview

This plan spans two Next.js apps. The admin panel (`cloud/`) gets a Prisma migration, two new POST API handlers, a `ComboboxField` component, and an extended media upload section in `CourseForm`. The public website (`cloud_website/`) gets a new API route, a live-data `MegaMenu`, a props-driven `ExploreCoursesSection`, a fixed `/courses` page with a DB-shaped `CourseCard`, and a shared `CategoryWithCourses` type. Property-based tests use **fast-check**.

## Tasks

- [x] 1. Prisma migration — add `videoUrl` and `documentUrl` to `Course` model
  - In `cloud/prisma/schema.prisma`, add `videoUrl String?` and `documentUrl String?` to the `Course` model
  - Run `npx prisma migrate dev --name add-course-media-urls` inside `cloud/`
  - Regenerate the Prisma client (`npx prisma generate`)
  - _Requirements: 3.10_

- [x] 2. Add `POST /api/admin/categories` handler
  - [x] 2.1 Implement the POST handler in `cloud/src/app/api/admin/categories/route.ts`
    - Accept `{ name: string }`, generate slug via `name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`
    - Create the record with `prisma.category.create`; return 201 with `{ id, name, slug }`
    - Catch Prisma unique-constraint error (`P2002`) and return HTTP 409 `{ error: 'Category already exists' }`
    - _Requirements: 1.7, 1.8_

  - [ ]* 2.2 Write property test for category creation round-trip (Property 2)
    - **Property 2: Category creation is a round-trip**
    - **Validates: Requirements 1.7**
    - Tag: `// Feature: course-categories-instructor-management, Property 2: Category creation is a round-trip`
    - Use `fc.string({ minLength: 1, maxLength: 100 })` filtered to valid names; POST then GET; assert name and non-empty slug present

  - [ ]* 2.3 Write property test for duplicate category returns 409 (Property 3)
    - **Property 3: Duplicate category name returns 409**
    - **Validates: Requirements 1.8**
    - Tag: `// Feature: course-categories-instructor-management, Property 3: Duplicate category name returns 409`
    - Create a category; POST same name again; assert HTTP 409

- [x] 3. Add `POST /api/admin/instructors` handler
  - [x] 3.1 Implement the POST handler in `cloud/src/app/api/admin/instructors/route.ts`
    - Accept `{ name: string }`, create record with `prisma.instructor.create({ data: { id: cuid(), name } })`
    - Return 201 with `{ id, name }`; return 500 on unexpected errors
    - _Requirements: 2.6_

  - [ ]* 3.2 Write property test for instructor creation round-trip (Property 5)
    - **Property 5: Instructor creation is a round-trip**
    - **Validates: Requirements 2.6**
    - Tag: `// Feature: course-categories-instructor-management, Property 5: Instructor creation is a round-trip`
    - Use `fc.string({ minLength: 1, maxLength: 100 })`; POST then GET; assert name present in response

- [x] 4. Implement `ComboboxField` component and wire into `CourseForm`
  - [x] 4.1 Create `cloud/src/components/ComboboxField.tsx`
    - Generic component: `ComboboxFieldProps<T extends { id: string; name: string }>`
    - Controlled `<input>` + dropdown list; filter items by typed value; show "Create '[typed name]'" option when no exact match
    - On "Create" selection: call `onCreateNew(typedName)`, set returned item as selected value; show inline error on rejection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [ ]* 4.2 Write property test for create-option visibility (Property 1)
    - **Property 1: Combobox create-option appears for non-matching input**
    - **Validates: Requirements 1.2, 2.2**
    - Tag: `// Feature: course-categories-instructor-management, Property 1: Combobox create-option appears for non-matching input`
    - Generate arbitrary strings not in a fixed item list; render `ComboboxField`; assert create-option present

  - [x] 4.3 Update `CourseForm` Zod schema and replace `<select>` elements
    - Change `categoryId` to `z.string().min(1, 'Category is required')` (required)
    - Keep `instructorId` as `z.string().optional()`
    - Replace the category `<select>` with `<ComboboxField>` wired to `POST /api/admin/categories`
    - Replace the instructor `<select>` with `<ComboboxField>` wired to `POST /api/admin/instructors`
    - _Requirements: 1.1, 1.5, 1.6, 2.1, 2.5_

  - [ ]* 4.4 Write property test for category required validation (Property 4)
    - **Property 4: Category field blocks submission when empty**
    - **Validates: Requirements 1.5, 1.6**
    - Tag: `// Feature: course-categories-instructor-management, Property 4: Category field blocks submission when empty`
    - Generate `CourseFormData` with empty `categoryId`; assert `onSubmit` not called and error message "Category is required" shown

  - [ ]* 4.5 Write property test for instructor optional (Property 6)
    - **Property 6: Instructor field is optional — form submits without it**
    - **Validates: Requirements 2.5**
    - Tag: `// Feature: course-categories-instructor-management, Property 6: Instructor field is optional — form submits without it`
    - Generate valid `CourseFormData` without `instructorId`; assert `onSubmit` called without instructor error

- [x] 5. Checkpoint — Ensure all admin panel tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement `MediaUploadSection` and extend `CourseForm` with three upload sections
  - [x] 6.1 Create `cloud/src/components/MediaUploadSection.tsx`
    - Props: `{ label, mediaType, acceptedMimeTypes, currentUrl, onUploadComplete, onRemove, courseId }`
    - Show file name + remove button after selection; show image preview for thumbnail section
    - Reject files whose `file.type` is not in `acceptedMimeTypes`; show section-scoped error on rejection or upload failure
    - Use existing `MediaManager` with `allowedTypes` scoped to the section's `mediaType`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 6.2 Write property test for MIME type filtering (Property 7)
    - **Property 7: Upload sections accept only their declared MIME types**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - Tag: `// Feature: course-categories-instructor-management, Property 7: Upload sections accept only their declared MIME types`
    - Generate random MIME type strings; assert accept/reject matches each section's declared list

  - [x] 6.3 Add `videoUrl` and `documentUrl` fields to `CourseForm` and replace the single thumbnail block
    - Add `videoUrl` and `documentUrl` to the Zod schema: `z.string().url().optional().or(z.literal(''))`
    - Replace the single "Thumbnail" card with three `<MediaUploadSection>` instances (Thumbnail/image, Course Video/video, Course Document/pdf)
    - Wire each section's `onUploadComplete` to `setValue('thumbnailUrl'|'videoUrl'|'documentUrl', url)`
    - _Requirements: 3.1, 3.5, 3.10_

  - [ ]* 6.4 Write property test for media fields optional (Property 8)
    - **Property 8: Media fields are all optional — form submits with any combination**
    - **Validates: Requirements 3.5**
    - Tag: `// Feature: course-categories-instructor-management, Property 8: Media fields are all optional — form submits with any combination`
    - Generate all combinations of null/non-null `thumbnailUrl`, `videoUrl`, `documentUrl`; assert form submits without media errors

  - [ ]* 6.5 Write property test for upload failure isolation (Property 9)
    - **Property 9: Upload failure in one section does not affect other sections**
    - **Validates: Requirements 3.9**
    - Tag: `// Feature: course-categories-instructor-management, Property 9: Upload failure in one section does not affect other sections`
    - Simulate upload failure in one section; assert other two sections' state (file, preview, URL) unchanged

  - [ ]* 6.6 Write property test for videoUrl/documentUrl round-trip (Property 10)
    - **Property 10: videoUrl and documentUrl round-trip through the Course model**
    - **Validates: Requirements 3.10**
    - Tag: `// Feature: course-categories-instructor-management, Property 10: videoUrl and documentUrl round-trip through the Course model`
    - Generate random URL strings; create course via API; fetch course; assert `videoUrl` and `documentUrl` equal input values

- [x] 7. Checkpoint — Ensure all admin panel tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Add shared `CategoryWithCourses` type to the website
  - Create `cloud_website/src/types/categories.ts` exporting `DbCoursePreview` and `CategoryWithCourses` interfaces as defined in the design document
  - _Requirements: 5.1, 6.1_

- [x] 9. Add `GET /api/website/categories-with-courses` route
  - Create `cloud_website/src/app/api/website/categories-with-courses/route.ts`
  - Query `prisma.category.findMany` with `include: { Course: { where: { published: true }, select: { id, title, slug, thumbnailUrl, durationMin } } }` ordered by name
  - Return the array as JSON; add `export const revalidate = 900`
  - _Requirements: 5.1, 5.6_

- [x] 10. Fix `/courses` page — replace mock `CourseCard` with a DB-shaped card
  - [x] 10.1 Create `cloud_website/src/app/courses/components/DbCourseCard.tsx`
    - Accept `DbCourse` type (as defined in design: `id, title, slug, summary, priceCents, currency, level, durationMin, rating, thumbnailUrl, Category, Instructor, _count`)
    - Render thumbnail (with fallback), category name, instructor name, price, and a link to `/courses/{slug}`
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 10.2 Update `CourseGrid` to accept and render `DbCourse[]`
    - Add an overloaded or union prop so `CourseGrid` can accept `DbCourse[]` alongside the existing `Course[]`
    - Render `DbCourseCard` when items are `DbCourse` shaped
    - _Requirements: 4.1, 4.2_

  - [ ]* 10.3 Write property test for /courses page renders published courses only (Property 11)
    - **Property 11: /courses page renders all published courses**
    - **Validates: Requirements 4.1, 4.2**
    - Tag: `// Feature: course-categories-instructor-management, Property 11: /courses page renders all published courses`
    - Generate mixed published/unpublished course arrays; render `CourseGrid`; assert only published courses appear and none unpublished

  - [ ]* 10.4 Write property test for course card renders all available fields (Property 12)
    - **Property 12: Course card renders all available course fields**
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - Tag: `// Feature: course-categories-instructor-management, Property 12: Course card renders all available course fields`
    - Generate `DbCourse` objects with non-null `thumbnailUrl`, `Category`, and `Instructor`; render `DbCourseCard`; assert all three are visible

- [x] 11. Update `MegaMenu` to fetch from `GET /api/website/categories-with-courses`
  - Remove the hardcoded `menuCategories` and `coursesByCategory` constants
  - Add `useEffect` + `fetch('/api/website/categories-with-courses')` on mount; initialise state from response
  - Replace the hardcoded `CourseCard` with one that renders `DbCoursePreview` fields (title, thumbnailUrl, durationMin) and links to `/courses/{slug}`
  - Show "No courses available" when the active category has an empty courses array
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 11.1 Write property test for MegaMenu category filtering (Property 13)
    - **Property 13: Category filtering in MegaMenu shows only matching courses**
    - **Validates: Requirements 5.3**
    - Tag: `// Feature: course-categories-instructor-management, Property 13: Category filtering in MegaMenu shows only matching courses`
    - Generate `CategoryWithCourses[]`; select a random category; assert every displayed course belongs to that category

- [x] 12. Update `ExploreCoursesSection` to accept `categories` prop and update homepage
  - [x] 12.1 Refactor `cloud_website/src/components/ExploreCoursesSection.tsx`
    - Remove hardcoded `categories` and `coursesByCategory` constants
    - Add `categories: CategoryWithCourses[]` prop; derive active-category state from first item in the array
    - Render course cards linking to `/courses/{slug}`; show "No courses in this category yet" when active category has no courses
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 12.2 Update `cloud_website/src/app/page.tsx` to fetch and pass categories to `ExploreCoursesSection`
    - Add a `prisma.category.findMany` call (with `include: { Course: { where: { published: true }, select: { id, title, slug, thumbnailUrl, durationMin } } }`) to the existing parallel fetch block
    - Pass the result as `categories` prop to `<ExploreCoursesSection>`
    - _Requirements: 6.6_

  - [ ]* 12.3 Write property test for ExploreCoursesSection category filtering (Property 14)
    - **Property 14: Category filtering in ExploreCoursesSection shows only matching courses**
    - **Validates: Requirements 6.3**
    - Tag: `// Feature: course-categories-instructor-management, Property 14: Category filtering in ExploreCoursesSection shows only matching courses`
    - Generate `CategoryWithCourses[]`; select a random category; assert every displayed course belongs to that category

  - [ ]* 12.4 Write property test for ExploreCoursesSection renders all categories (Property 15)
    - **Property 15: ExploreCoursesSection renders all passed categories**
    - **Validates: Requirements 6.2**
    - Tag: `// Feature: course-categories-instructor-management, Property 15: ExploreCoursesSection renders all passed categories`
    - Generate non-empty `CategoryWithCourses[]`; render component; assert every category name appears in the sidebar

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations each
- The `cloud/` and `cloud_website/` apps share the same PostgreSQL database; the Prisma migration in task 1 must run before any API work
- The existing `GET /api/admin/categories` and `GET /api/admin/instructors` routes are already implemented; tasks 2 and 3 only add the POST handlers
- The current `GET /api/admin/instructors` queries the `User` table where `role = 'INSTRUCTOR'`. The new `POST /api/admin/instructors` handler must create records in the separate `Instructor` table (which is what `Course.instructorId` references). The `ComboboxField` for instructors should fetch from the existing GET (User-based) but create via the new POST (Instructor table). Consider whether the GET should also be updated to include Instructor table records — this is a known design gap to resolve during task 3.
- The `/courses` page already has `export const revalidate = 900` and calls `dbDataService.getCourses({ published: true })`; the main work is replacing the mock-typed `CourseCard` with `DbCourseCard`
- The homepage (`cloud_website/src/app/page.tsx`) already fetches `prisma.category.findMany` but does NOT include courses and does NOT pass data to `ExploreCoursesSection`. Task 12.2 must update the existing fetch to include published courses and pass them as props — `<ExploreCoursesSection />` is currently rendered with no props.
- `CourseGrid` currently expects `Course[]` (mock-shaped type from `@/types`). Task 10.2 must update it to accept the DB-shaped type returned by `dbDataService.getCourses` without breaking the existing type import used elsewhere.
- `MegaMenu` currently receives a `sections: MegaMenuSection[]` prop from its parent (the header/nav component). Task 11 must ensure the live-data fetch is self-contained inside `MegaMenu` via `useEffect` so the parent component does not need to change.
