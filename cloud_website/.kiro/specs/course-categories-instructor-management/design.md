# Design Document

## Feature: course-categories-instructor-management

---

## Overview

This feature spans two Next.js applications:

- **Admin panel** (`cloud/`) — extends `CourseForm` with inline category/instructor creation and three separate media upload sections; adds `POST` handlers to the categories and instructors API routes; migrates the `Course` Prisma model to add `videoUrl` and `documentUrl`.
- **Public website** (`cloud_website/`) — replaces hardcoded static data in `MegaMenu` and `ExploreCoursesSection` with live DB queries; ensures the `/courses` page correctly renders published courses from the database.

The two apps share the same PostgreSQL database via Prisma. The admin panel writes data; the website reads it.

---

## Architecture

```mermaid
graph TD
  subgraph Admin Panel (cloud/)
    CF[CourseForm]
    CAT_API[POST /api/admin/categories]
    INS_API[POST /api/admin/instructors]
    PRESIGN[POST /api/admin/media/presign]
    MM[MediaManager]
    CF -->|inline create| CAT_API
    CF -->|inline create| INS_API
    CF -->|upload| PRESIGN
    CF --> MM
  end

  subgraph Database
    DB[(PostgreSQL via Prisma)]
    CAT_API --> DB
    INS_API --> DB
    PRESIGN --> DB
  end

  subgraph Website (cloud_website/)
    HP[Homepage (server component)]
    ECS[ExploreCoursesSection (client)]
    MEGA[MegaMenu (client)]
    COURSES[/courses page (server)]
    CG[CourseGrid]
    CAT_ROUTE[GET /api/website/categories-with-courses]
    HP -->|fetch| DB
    HP -->|props| ECS
    MEGA -->|fetch| CAT_ROUTE
    CAT_ROUTE --> DB
    COURSES -->|dbDataService| DB
    COURSES --> CG
  end
```

Key architectural decisions:

- **MegaMenu** is a client component that cannot directly call Prisma. It will fetch from a new lightweight API route (`GET /api/website/categories-with-courses`) so the data reflects the current DB state without a full rebuild.
- **ExploreCoursesSection** stays a client component (it manages active-category state). The homepage server component fetches categories + courses and passes them as props.
- **CourseForm** comboboxes are built with a controlled `<input>` + dropdown pattern using existing React state — no new UI library dependency needed.
- **Media uploads** reuse the existing `MediaManager` component with `allowedTypes` scoped per section. Each section maintains independent state so failures are isolated.
- **Prisma migration** adds `videoUrl String?` and `documentUrl String?` to the `Course` model.

---

## Components and Interfaces

### Admin Panel

#### `CourseForm` changes

The existing `<select>` elements for category and instructor are replaced with a `ComboboxField` component (new, local to `CourseForm`).

```ts
interface ComboboxFieldProps<T extends { id: string; name: string }> {
  label: string;
  items: T[];
  value: string;           // selected id
  onChange: (id: string) => void;
  onCreateNew: (name: string) => Promise<T>;
  isLoading: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}
```

The Zod schema gains a required `categoryId`:

```ts
categoryId: z.string().min(1, 'Category is required'),
instructorId: z.string().optional(),
videoUrl: z.string().url().optional().or(z.literal('')),
documentUrl: z.string().url().optional().or(z.literal('')),
```

Three `MediaUploadSection` sub-components replace the single thumbnail block:

```ts
interface MediaUploadSectionProps {
  label: string;
  mediaType: 'image' | 'video' | 'pdf';
  acceptedMimeTypes: string[];   // e.g. ['image/jpeg', 'image/png', ...]
  currentUrl: string;
  onUploadComplete: (url: string) => void;
  onRemove: () => void;
  courseId: string;
}
```

#### `POST /api/admin/categories` (new handler)

```ts
// Request
{ name: string }

// Response 201
{ id: string; name: string; slug: string }

// Response 409
{ error: 'Category already exists' }
```

Slug generation: `name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`. Uniqueness is enforced by the `@@unique` constraint on `Category.slug` and `Category.name`.

#### `POST /api/admin/instructors` (new handler)

```ts
// Request
{ name: string }

// Response 201
{ id: string; name: string }
```

The existing `GET /api/admin/instructors` currently queries `User` with `role = INSTRUCTOR`. The new `POST` handler creates records in the `Instructor` table (separate from `User`), matching the Prisma schema where `Course.instructorId` references `Instructor.id`.

#### Prisma migration

```prisma
model Course {
  // existing fields ...
  videoUrl     String?
  documentUrl  String?
}
```

### Website

#### `GET /api/website/categories-with-courses` (new route)

Returns categories with their published courses for the MegaMenu. No auth required.

```ts
// Response
Array<{
  id: string;
  name: string;
  slug: string;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    durationMin: number | null;
  }>;
}>
```

Revalidation: `export const revalidate = 900` on the route handler.

#### `MegaMenu` changes

Props interface gains optional pre-fetched data; the component fetches from the new API route on mount using `useEffect` + `fetch`:

```ts
interface MegaMenuProps {
  // existing props unchanged
  initialCategories?: CategoryWithCourses[];
}
```

The hardcoded `menuCategories` and `coursesByCategory` constants are removed. State is initialised from `initialCategories` (if provided by a server component parent) or fetched client-side.

#### `ExploreCoursesSection` changes

```ts
interface CategoryWithCourses {
  id: string;
  name: string;
  slug: string;
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    durationMin: number | null;
  }>;
}

interface ExploreCoursesSectionProps {
  categories: CategoryWithCourses[];
}
```

The hardcoded `categories` and `coursesByCategory` constants are removed. The component becomes a pure renderer of its props.

#### Homepage server component

```ts
// app/page.tsx (or wherever ExploreCoursesSection is rendered)
const categoriesWithCourses = await prisma.category.findMany({
  include: {
    Course: {
      where: { published: true },
      select: { id, title, slug, thumbnailUrl, durationMin },
    },
  },
  orderBy: { name: 'asc' },
});
// passed as props to <ExploreCoursesSection categories={categoriesWithCourses} />
```

#### `/courses` page

The page already calls `dbDataService.getCourses({ published: true })` and has `export const revalidate = 900`. The main gap is that `CourseCard` uses the mock `Course` type with fields like `instructorIds`, `price.amount`, `rating.average`, etc. A new lightweight `DbCourse` type is introduced and `CourseCard` is updated (or a new `DbCourseCard` component is created) to render the Prisma-shaped data.

```ts
interface DbCourse {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  priceCents: number;
  currency: string;
  level: string | null;
  durationMin: number | null;
  rating: number | null;
  thumbnailUrl: string | null;
  Category: { id: string; name: string; slug: string } | null;
  Instructor: { id: string; name: string; avatar: string | null } | null;
  _count: { Enrollment: number };
}
```

---

## Data Models

### Prisma schema changes

```prisma
model Course {
  // ... existing fields unchanged ...
  videoUrl      String?   // new
  documentUrl   String?   // new
}
```

No changes to `Category` or `Instructor` models — they already have the required fields.

### `CourseFormData` Zod schema (admin panel)

```ts
const courseFormSchema = z.object({
  // existing fields ...
  categoryId:   z.string().min(1, 'Category is required'),
  instructorId: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  videoUrl:     z.string().url().optional().or(z.literal('')),
  documentUrl:  z.string().url().optional().or(z.literal('')),
});
```

### `CategoryWithCourses` (website shared type)

```ts
// cloud_website/src/types/index.ts (or a new file)
export interface DbCoursePreview {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  durationMin: number | null;
}

export interface CategoryWithCourses {
  id: string;
  name: string;
  slug: string;
  courses: DbCoursePreview[];
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Combobox create-option appears for non-matching input

*For any* string typed into the category or instructor combobox that does not exactly match any existing item's name, the dropdown list should contain exactly one "Create '[typed name]'" option.

**Validates: Requirements 1.2, 2.2**

### Property 2: Category creation is a round-trip

*For any* valid category name string, calling `POST /api/admin/categories` with that name should persist a record such that a subsequent `GET /api/admin/categories` response contains an entry with the same name and a non-empty slug derived from that name.

**Validates: Requirements 1.7**

### Property 3: Duplicate category name returns 409

*For any* category name that already exists in the database, calling `POST /api/admin/categories` with that same name should return HTTP 409.

**Validates: Requirements 1.8**

### Property 4: Category field blocks submission when empty

*For any* CourseForm submission attempt where `categoryId` is empty or undefined, the form should not call `onSubmit` and should display the validation error "Category is required".

**Validates: Requirements 1.5, 1.6**

### Property 5: Instructor creation is a round-trip

*For any* valid instructor name string, calling `POST /api/admin/instructors` with that name should persist a record such that a subsequent `GET /api/admin/instructors` response contains an entry with the same name.

**Validates: Requirements 2.6**

### Property 6: Instructor field is optional — form submits without it

*For any* otherwise-valid CourseForm state where `instructorId` is absent, the form should call `onSubmit` successfully without displaying an instructor-related error.

**Validates: Requirements 2.5**

### Property 7: Upload sections accept only their declared MIME types

*For any* file presented to a media upload section, the section should accept the file if and only if its MIME type is in the section's declared accepted list (images for Thumbnail, videos for Course Video, documents for Course Document).

**Validates: Requirements 3.2, 3.3, 3.4**

### Property 8: Media fields are all optional — form submits with any combination

*For any* combination of populated/empty values among `thumbnailUrl`, `videoUrl`, and `documentUrl`, the CourseForm should call `onSubmit` without media-related validation errors.

**Validates: Requirements 3.5**

### Property 9: Upload failure in one section does not affect other sections

*For any* upload failure in one of the three media sections, the state (selected file, preview, URL) of the other two sections should remain unchanged.

**Validates: Requirements 3.9**

### Property 10: videoUrl and documentUrl round-trip through the Course model

*For any* course record created or updated with non-null `videoUrl` and `documentUrl` values, fetching that course from the database should return the same `videoUrl` and `documentUrl` values.

**Validates: Requirements 3.10**

### Property 11: /courses page renders all published courses

*For any* set of published courses in the database, the `/courses` page should render a course card for each one, and no unpublished course should appear.

**Validates: Requirements 4.1, 4.2**

### Property 12: Course card renders all available course fields

*For any* published course that has a `thumbnailUrl`, `Category`, and `Instructor`, the rendered course card should display the thumbnail image, the category name, and the instructor name.

**Validates: Requirements 4.3, 4.4, 4.5**

### Property 13: Category filtering in MegaMenu shows only matching courses

*For any* category selected in the MegaMenu sidebar, every displayed course card should belong to that category, and no course from a different category should appear.

**Validates: Requirements 5.3**

### Property 14: Category filtering in ExploreCoursesSection shows only matching courses

*For any* category selected in the ExploreCoursesSection sidebar, every displayed course card should belong to that category, and no course from a different category should appear.

**Validates: Requirements 6.3**

### Property 15: ExploreCoursesSection renders all passed categories

*For any* non-empty list of `CategoryWithCourses` objects passed as props to `ExploreCoursesSection`, every category's name should appear in the sidebar.

**Validates: Requirements 6.2**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `GET /api/admin/categories` fails | Combobox shows empty list with a toast error; form remains usable |
| `POST /api/admin/categories` returns 409 | Inline error below combobox: "A category with this name already exists" |
| `POST /api/admin/categories` returns 5xx | Inline error: "Failed to create category. Please try again." |
| `POST /api/admin/instructors` returns 5xx | Inline error below instructor combobox; field stays unselected |
| Media presign request fails | Error message inside the specific upload section only; other sections unaffected |
| Media upload to R2 fails | Same as above — section-scoped error, retry button shown |
| `/courses` DB query fails | `error.tsx` boundary renders; page does not crash |
| `GET /api/website/categories-with-courses` fails | MegaMenu renders with empty category list; no JS error thrown |
| Homepage categories fetch fails | `ExploreCoursesSection` receives empty array; renders empty state gracefully |

---

## Testing Strategy

### Unit tests

Focus on specific examples, edge cases, and error conditions:

- `ComboboxField`: renders create-option when input doesn't match; does not render create-option when input matches exactly; calls `onCreateNew` with the typed name.
- `MediaUploadSection`: rejects files with wrong MIME type; shows file name and remove button after selection; clears state on remove click.
- `POST /api/admin/categories`: returns 409 on duplicate name; returns 201 with slug on valid name.
- `POST /api/admin/instructors`: returns 201 with id and name on valid input.
- `ExploreCoursesSection`: renders "No courses in this category yet" when selected category has empty courses array.
- `MegaMenu`: renders "No courses available" when selected category has empty courses array.
- `/courses` page: `revalidate` export equals 900.

### Property-based tests

Use **fast-check** (TypeScript-compatible, works in both Next.js apps).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: course-categories-instructor-management, Property {N}: {property_text}`

| Property | Test description |
|---|---|
| P1 | Generate random strings not in a fixed category list; assert create-option appears |
| P2 | Generate random valid names; POST then GET; assert name and slug present |
| P3 | Create a category; POST same name again; assert 409 |
| P4 | Generate CourseFormData with empty categoryId; assert onSubmit not called |
| P5 | Generate random valid names; POST then GET instructors; assert name present |
| P6 | Generate valid CourseFormData without instructorId; assert onSubmit called |
| P7 | Generate random MIME types; assert accept/reject matches section's allowed list |
| P8 | Generate all combinations of null/non-null media URLs; assert form submits |
| P9 | Simulate upload failure in one section; assert other sections' state unchanged |
| P10 | Generate random URL strings for videoUrl/documentUrl; create course; fetch; assert equality |
| P11 | Generate mixed published/unpublished courses; render page; assert only published appear |
| P12 | Generate courses with all optional fields populated; render card; assert all fields visible |
| P13 | Generate categories with courses; select random category; assert all shown courses match |
| P14 | Same as P13 for ExploreCoursesSection |
| P15 | Generate random CategoryWithCourses array; render component; assert all names in sidebar |
