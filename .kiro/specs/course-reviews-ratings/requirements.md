# Requirements Document

## Introduction

This feature enables students on the AnyWhereDoor platform to leave star ratings and written reviews for courses they have enrolled in. Reviews are displayed publicly on course detail pages to help prospective students make informed enrollment decisions. The Course model's existing `rating` field is updated as an aggregate whenever a review is submitted or deleted. Students may edit or delete their own review. Admins may delete any review via the admin panel.

## Glossary

- **Review_System**: The end-to-end feature covering review submission, display, editing, deletion, and aggregate rating calculation within `cloud_website` and `cloud`.
- **Review**: A record in the `Review` table containing a `rating` (integer 1–5), an optional `comment` (text), and references to the authoring `User` and the reviewed `Course`.
- **Aggregate_Rating**: The arithmetic mean of all `rating` values for a given course, stored as a `Float` in `Course.rating` and rounded to two decimal places.
- **Enrollment**: A record in the `Enrollment` table linking a `User` to a `Course` with a status of `ACTIVE`, `COMPLETED`, `CANCELLED`, or `REFUNDED`.
- **Student**: A `User` with role `STUDENT`.
- **Admin**: A `User` with role `ADMIN`.
- **Review_API**: The Next.js API routes under `cloud_website/src/app/api/reviews/` that handle review CRUD operations.
- **Course_Page**: The public-facing course detail page at `/courses/[slug]` in `cloud_website`.
- **Admin_Panel**: The internal Next.js application running on port 3001 (`cloud`).

---

## Requirements

### Requirement 1: Review Submission

**User Story:** As a Student, I want to submit a star rating and optional written review for a course I am enrolled in, so that I can share my learning experience with other students.

#### Acceptance Criteria

1. WHEN a Student submits a review for a course, THE Review_API SHALL create a `Review` record with the provided `rating` and optional `comment` and associate it with the authenticated Student's `userId` and the target `courseId`.
2. WHEN a Student submits a review, THE Review_API SHALL reject the request with HTTP 400 if the `rating` value is not an integer between 1 and 5 inclusive.
3. WHEN a Student submits a review, THE Review_API SHALL reject the request with HTTP 400 if the `comment` field exceeds 2000 characters.
4. WHEN a Student submits a review for a course for which the Student already has a `Review` record, THE Review_API SHALL reject the request with HTTP 409.
5. WHEN a Student submits a review for a course, THE Review_API SHALL reject the request with HTTP 403 if the Student does not have an `Enrollment` record for that course with status `ACTIVE` or `COMPLETED`.
6. WHEN a review is successfully created, THE Review_API SHALL recalculate the Aggregate_Rating for the course and update `Course.rating` within the same database transaction.
7. WHEN a review is successfully created, THE Review_API SHALL return HTTP 201 with the created `Review` record including `id`, `rating`, `comment`, `createdAt`, and the author's `name` and `image`.

---

### Requirement 2: Review Display on Course Page

**User Story:** As a prospective student, I want to see ratings and reviews on a course detail page, so that I can evaluate the course quality before enrolling.

#### Acceptance Criteria

1. THE Course_Page SHALL display the Aggregate_Rating for the course rounded to one decimal place alongside the total count of reviews.
2. THE Course_Page SHALL display a paginated list of reviews, showing each review's star rating, comment, author name, author avatar, and submission date.
3. WHEN a course has no reviews, THE Course_Page SHALL display a message indicating that no reviews have been submitted yet.
4. THE Course_Page SHALL display reviews ordered by `createdAt` descending by default, showing the 10 most recent reviews per page.
5. WHEN a Student is authenticated and has already submitted a review for the course, THE Course_Page SHALL display that Student's review prominently at the top of the review list.
6. THE Course_Page SHALL display a star-rating breakdown showing the count of reviews for each rating value (1 through 5).

---

### Requirement 3: Review Editing

**User Story:** As a Student, I want to edit my existing review, so that I can update my feedback if my opinion changes.

#### Acceptance Criteria

1. WHEN a Student submits an edit request for a review, THE Review_API SHALL update the `rating` and/or `comment` fields of the `Review` record identified by `id`.
2. WHEN a Student submits an edit request for a review, THE Review_API SHALL reject the request with HTTP 403 if the `userId` on the `Review` record does not match the authenticated Student's `userId`.
3. WHEN a Student submits an edit request with an invalid `rating` value (not an integer between 1 and 5 inclusive), THE Review_API SHALL reject the request with HTTP 400.
4. WHEN a Student submits an edit request with a `comment` exceeding 2000 characters, THE Review_API SHALL reject the request with HTTP 400.
5. WHEN a review is successfully updated, THE Review_API SHALL recalculate the Aggregate_Rating for the course and update `Course.rating` within the same database transaction.
6. WHEN a review is successfully updated, THE Review_API SHALL return HTTP 200 with the updated `Review` record.

---

### Requirement 4: Review Deletion by Student

**User Story:** As a Student, I want to delete my review, so that I can remove feedback I no longer want to be public.

#### Acceptance Criteria

1. WHEN a Student submits a delete request for a review, THE Review_API SHALL delete the `Review` record identified by `id` if the `userId` on the record matches the authenticated Student's `userId`.
2. WHEN a Student submits a delete request for a review that belongs to a different user, THE Review_API SHALL reject the request with HTTP 403.
3. WHEN a review is successfully deleted, THE Review_API SHALL recalculate the Aggregate_Rating for the course and update `Course.rating` within the same database transaction.
4. WHEN a course has no remaining reviews after deletion, THE Review_API SHALL set `Course.rating` to `0`.
5. WHEN a review is successfully deleted, THE Review_API SHALL return HTTP 200.

---

### Requirement 5: Review Moderation by Admin

**User Story:** As an Admin, I want to delete any review from the admin panel, so that I can remove inappropriate or abusive content.

#### Acceptance Criteria

1. WHEN an Admin submits a delete request for a review via the Admin_Panel, THE Review_API SHALL delete the `Review` record regardless of which user authored it.
2. WHEN a non-Admin user attempts to delete another user's review via the admin endpoint, THE Review_API SHALL reject the request with HTTP 403.
3. WHEN an Admin deletes a review, THE Review_API SHALL recalculate the Aggregate_Rating for the affected course and update `Course.rating` within the same database transaction.
4. WHEN an Admin deletes a review, THE Review_API SHALL write an entry to the `AuditLog` table recording the `userId` of the Admin, the action `"DELETE_REVIEW"`, `resourceType` `"Review"`, and the deleted review's `id`.
5. THE Admin_Panel SHALL display a list of reviews for each course, showing the author name, rating, comment, and submission date, with a delete action per review.

---

### Requirement 6: Authentication and Authorization

**User Story:** As a platform operator, I want all review mutations to require authentication, so that anonymous users cannot submit or modify reviews.

#### Acceptance Criteria

1. WHEN an unauthenticated request is made to any review mutation endpoint (create, update, delete), THE Review_API SHALL reject the request with HTTP 401.
2. WHEN an authenticated request is made by a user with role `ADMIN` or `INSTRUCTOR` to the student-facing review creation endpoint, THE Review_API SHALL reject the request with HTTP 403.
3. THE Review_API SHALL validate the authenticated session using `getServerSession()` on every mutation request before performing any database operation.

---

### Requirement 7: Aggregate Rating Consistency

**User Story:** As a platform operator, I want the course aggregate rating to always reflect the current set of reviews, so that the displayed rating is accurate.

#### Acceptance Criteria

1. THE Review_System SHALL calculate the Aggregate_Rating as the arithmetic mean of all `rating` values for a course, rounded to two decimal places.
2. WHEN a review is created, updated, or deleted, THE Review_System SHALL update `Course.rating` atomically within the same Prisma transaction as the review mutation.
3. FOR ALL sequences of review create, update, and delete operations on a course, THE Review_System SHALL produce a `Course.rating` equal to the arithmetic mean of the surviving review ratings rounded to two decimal places (round-trip consistency property).
4. WHEN a course has zero reviews, THE Review_System SHALL store `Course.rating` as `0`.

---

### Requirement 8: Review Retrieval API

**User Story:** As a developer, I want a paginated API endpoint to fetch reviews for a course, so that the Course_Page can load reviews efficiently.

#### Acceptance Criteria

1. WHEN a GET request is made to the reviews endpoint with a valid `courseId`, THE Review_API SHALL return a paginated list of reviews including each review's `id`, `rating`, `comment`, `createdAt`, and the author's `name` and `image`.
2. THE Review_API SHALL support `page` and `pageSize` query parameters, with `pageSize` defaulting to 10 and capped at 50.
3. THE Review_API SHALL return the total review count and the Aggregate_Rating alongside the paginated results.
4. WHEN a `courseId` that does not exist is provided, THE Review_API SHALL return HTTP 404.
5. THE Review_API SHALL return reviews ordered by `createdAt` descending unless an alternative sort order is specified.
