# Product: AnyWhereDoor Learning Platform

AnyWhereDoor is an online learning platform for Computer Science students and professionals. It consists of two applications that share a PostgreSQL database:

## Applications

### `cloud_website` — Student-facing platform (port 3000)
The public-facing learning platform where students browse courses, enroll, watch video lessons, take quizzes, submit assignments, and track progress. Includes blog, contact forms, and enterprise/business pages.

### `cloud` — Admin panel (port 3001)
The internal admin interface for managing the platform. Admins can create and publish courses, build curricula with drag-and-drop, upload media, manage student enrollments, view analytics, and monitor audit logs.

## Core Domain Concepts
- **Courses** → **Modules** → **Lessons** (VIDEO, ARTICLE, QUIZ, MCQ, ASSIGNMENT, AR, LIVE)
- **Users** have roles: ADMIN, INSTRUCTOR, STUDENT
- **Enrollments** track student access; **CourseProgress** tracks per-lesson completion
- **Media** is stored on Cloudflare R2 and transcoded via BullMQ workers
- **Purchases** are processed via Stripe; payments create Enrollments
- Authentication uses NextAuth v4 with credentials + OAuth (Google/Apple)
