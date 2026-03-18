# Requirements Document

## Introduction

This feature covers four interconnected improvements to the course management system spanning both the admin panel (`cloud/`) and the public website (`cloud_website/`):

1. **Categories Management** — When creating or editing a course in the admin panel, admins can select an existing category from a dropdown or type a new category name to create it on the fly. A category is mandatory for every course.

2. **Instructor Management** — Same inline-create pattern as categories, but for instructors. An instructor is optional on a course.

3. **Media Uploads** — The course creation form currently supports only a thumbnail URL. It must be extended to support three separate, optional media uploads: thumbnail (image), video, and document.

4. **Website Course Display** — Courses created in the admin panel are not appearing on the public website's course listing page, navigation mega-menu, or homepage course sections. These display issues must be resolved so that published courses from the database are shown to visitors.

---

## Glossary

- **Admin_Panel**: The Next.js application located at `cloud/` used by administrators to manage platform content.
- **Website**: The Next.js application located at `cloud_website/` that serves the public-facing site.
- **CourseForm**: The React component (`cloud/src/components/CourseForm.tsx`) used to create and edit courses in the Admin_Panel.
- **Category**: A classification entity stored in the `Category` table, linked to courses via `categoryId`.
- **Instructor**: A standalone entity stored in the `Instructor` table, linked to courses via `instructorId`.
- **Media**: A file asset (image, video, or document) associated with a course, managed via the existing `Media` model and media service.
- **Thumbnail**: An image file that represents a course visually on the Website.
- **Course_Video**: A video file uploaded to a course for preview or promotional purposes.
- **Course_Document**: A document file (PDF, DOCX, etc.) uploaded to a course.
- **MegaMenu**: The dropdown navigation component (`cloud_website/src/components/MegaMenu.tsx`) that appears when hovering "Courses" in the Website header.
- **ExploreCoursesSection**: The homepage component (`cloud_website/src/components/ExploreCoursesSection.tsx`) that displays a categorised course grid.
- **CourseGrid**: The component on the `/courses` page that renders a list of course cards fetched from the database.
- **Published_Course**: A course record where `published = true` in the database.
- **Slug**: A URL-safe string identifier for a course, used in the path `/courses/{slug}`.

---

## Requirements

### Requirement 1: Inline Category Creation in Course Form

**User Story:** As an admin, I want to type a new category name directly in the course form, so that I can create categories on the fly without navigating away from course creation.

#### Acceptance Criteria

1. THE CourseForm SHALL display a combobox (searchable dropdown with free-text input) for the category field that lists all existing Category records fetched from `GET /api/admin/categories`.
2. WHEN an admin types a name that does not match any existing Category, THE CourseForm SHALL display a "Create '[typed name]'" option at the bottom of the dropdown list.
3. WHEN an admin selects the "Create '[typed name]'" option, THE CourseForm SHALL call `POST /api/admin/categories` with the typed name and a generated slug, then set the newly created Category as the selected value.
4. WHEN `POST /api/admin/categories` returns an error, THE CourseForm SHALL display an inline error message and leave the category field in an unselected state.
5. THE CourseForm SHALL mark the category field as required, and THE CourseForm SHALL prevent form submission WHEN no category is selected.
6. IF the category field is empty on submit, THEN THE CourseForm SHALL display a validation error message "Category is required".
7. THE `POST /api/admin/categories` endpoint SHALL accept `{ name: string }`, generate a unique slug from the name, persist the new Category record, and return the created Category object.
8. IF a Category with the same name already exists, THEN THE `POST /api/admin/categories` endpoint SHALL return HTTP 409 with an error message.

---

### Requirement 2: Inline Instructor Creation in Course Form

**User Story:** As an admin, I want to select an existing instructor or create a new one directly in the course form, so that I can assign instructors without leaving the course creation workflow.

#### Acceptance Criteria

1. THE CourseForm SHALL display a combobox for the instructor field that lists all existing Instructor records fetched from `GET /api/admin/instructors`.
2. WHEN an admin types a name that does not match any existing Instructor, THE CourseForm SHALL display a "Create '[typed name]'" option at the bottom of the dropdown list.
3. WHEN an admin selects the "Create '[typed name]'" option, THE CourseForm SHALL call `POST /api/admin/instructors` with the typed name, then set the newly created Instructor as the selected value.
4. WHEN `POST /api/admin/instructors` returns an error, THE CourseForm SHALL display an inline error message and leave the instructor field in an unselected state.
5. THE CourseForm SHALL treat the instructor field as optional; THE CourseForm SHALL allow form submission with no instructor selected.
6. THE `POST /api/admin/instructors` endpoint SHALL accept `{ name: string }`, persist the new Instructor record, and return the created Instructor object.

---

### Requirement 3: Extended Media Uploads in Course Form

**User Story:** As an admin, I want to upload a thumbnail image, a course video, and a course document separately when creating or editing a course, so that each media type is clearly organised and independently manageable.

#### Acceptance Criteria

1. THE CourseForm SHALL display three distinct, labelled upload sections: "Thumbnail", "Course Video", and "Course Document".
2. WHILE a Thumbnail upload section is displayed, THE CourseForm SHALL accept image file types (JPEG, PNG, WebP, GIF) and SHALL show a preview of the selected image.
3. WHILE a Course Video upload section is displayed, THE CourseForm SHALL accept video file types (MP4, MOV, AVI, WebM).
4. WHILE a Course Document upload section is displayed, THE CourseForm SHALL accept document file types (PDF, DOCX, PPTX).
5. THE CourseForm SHALL treat all three media upload fields as optional; THE CourseForm SHALL allow form submission with none, some, or all media fields populated.
6. WHEN a file is selected for any upload section, THE CourseForm SHALL display the file name and a remove button.
7. WHEN an admin clicks the remove button for an uploaded file, THE CourseForm SHALL clear that media field and remove the preview.
8. THE CourseForm SHALL use the existing MediaManager component and presigned-upload flow (`POST /api/admin/media/presign`) for all three upload types.
9. WHEN a media upload fails, THE CourseForm SHALL display an error message specific to the failed upload section without affecting the other sections.
10. THE Course data model SHALL store `videoUrl` and `documentUrl` fields alongside the existing `thumbnailUrl` field to persist the uploaded media URLs.

---

### Requirement 4: Website Course Listing Page Displays Published Courses

**User Story:** As a website visitor, I want to see all published courses on the `/courses` page, so that I can browse and enrol in available courses.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/courses`, THE Website SHALL fetch Published_Course records from the database via `dbDataService.getCourses({ published: true })` and render them in the CourseGrid.
2. WHEN the database contains zero Published_Course records, THE Website SHALL display the EmptyCoursesState component on the `/courses` page.
3. WHEN a Published_Course has a `thumbnailUrl`, THE CourseGrid SHALL render the thumbnail image for that course card.
4. WHEN a Published_Course has a `Category`, THE CourseGrid SHALL display the category name on the course card.
5. WHEN a Published_Course has an `Instructor`, THE CourseGrid SHALL display the instructor name on the course card.
6. THE `/courses` page SHALL revalidate its data at most every 900 seconds using Next.js ISR.

---

### Requirement 5: Navigation MegaMenu Displays Database Categories and Courses

**User Story:** As a website visitor, I want the navigation mega-menu to show real categories and courses from the database, so that the navigation reflects the actual course catalogue.

#### Acceptance Criteria

1. THE MegaMenu SHALL fetch Category records from the database at build/request time and display them as navigation sections instead of the current hardcoded static list.
2. WHEN a visitor hovers over "Courses" in the header, THE MegaMenu SHALL display the database-sourced Category list in its sidebar.
3. WHEN a visitor selects a category in the MegaMenu sidebar, THE MegaMenu SHALL display Published_Course records belonging to that category.
4. WHEN a category has no Published_Course records, THE MegaMenu SHALL display a "No courses available" message for that category.
5. WHEN a visitor clicks a course card in the MegaMenu, THE Website SHALL navigate to `/courses/{slug}` for that course.
6. THE MegaMenu data SHALL be sourced from a server-side API route or server component so that it reflects the current database state without requiring a full rebuild.

---

### Requirement 6: Homepage Course Sections Display Published Courses

**User Story:** As a website visitor, I want the homepage to show real published courses in the "Explore Our Courses" section, so that the homepage reflects the actual course catalogue.

#### Acceptance Criteria

1. THE ExploreCoursesSection SHALL fetch Published_Course records grouped by Category from the database instead of using the current hardcoded static data.
2. WHEN the database contains Category records, THE ExploreCoursesSection SHALL display those categories in its sidebar.
3. WHEN a visitor selects a category in the ExploreCoursesSection sidebar, THE ExploreCoursesSection SHALL display Published_Course cards for that category.
4. WHEN a category has no Published_Course records, THE ExploreCoursesSection SHALL display a "No courses in this category yet" message.
5. WHEN a visitor clicks a course card in the ExploreCoursesSection, THE Website SHALL navigate to `/courses/{slug}` for that course.
6. THE homepage SHALL pass the database-fetched categories and courses as props to ExploreCoursesSection so that the component remains a client component while data is fetched server-side.
