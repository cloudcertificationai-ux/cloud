# Project Structure

The repo contains two independent Next.js applications with a shared Prisma schema.

```
/
├── cloud/                    # Admin panel (port 3001)
│   ├── prisma/
│   │   └── schema.prisma     # Shared DB schema (keep in sync with cloud_website)
│   ├── scripts/              # Admin user management, verification scripts
│   └── src/
│       ├── app/
│       │   ├── admin/        # Admin UI pages
│       │   └── api/
│       │       ├── admin/    # Protected admin API routes
│       │       │   ├── courses/[id]/  # Course CRUD + publish/unpublish
│       │       │   ├── media/         # R2 presign, upload, transcode jobs
│       │       │   ├── enrollments/   # Enrollment management
│       │       │   ├── students/      # Student management
│       │       │   ├── analytics/     # Platform metrics
│       │       │   └── audit-logs/    # Activity log
│       │       ├── auth/[...nextauth]/ # NextAuth handler
│       │       ├── blog/              # Blog CRUD
│       │       └── external/courses/  # Public course data endpoint
│       ├── components/       # Admin UI components (CourseForm, CurriculumBuilder, MediaUploader, etc.)
│       ├── data/             # Data service layer (admin-course-service, course-data-service)
│       ├── hooks/            # React hooks (useMediaUpload, useOptimisticUpdate, etc.)
│       ├── lib/              # Utilities (auth, db, permissions, r2-client, security, etc.)
│       └── types/            # TypeScript types
│
├── cloud_website/            # Student-facing platform (port 3000)
│   ├── prisma/
│   │   ├── schema.prisma     # Shared DB schema (source of truth)
│   │   ├── seed.ts           # Database seeder
│   │   └── migrations/       # Prisma migration history
│   ├── scripts/              # Utility scripts (reset-db, generate-api-key, workers, etc.)
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── api/          # API routes
│       │   │   ├── auth/     # NextAuth
│       │   │   ├── courses/  # Course data APIs
│       │   │   ├── enrollments/ # Enrollment + payment
│       │   │   ├── progress/ # Lesson progress tracking
│       │   │   └── ...
│       │   ├── courses/      # Course listing + detail pages
│       │   ├── dashboard/    # Student dashboard
│       │   ├── profile/      # User profile
│       │   ├── blog/         # Blog pages
│       │   └── ...           # about, contact, faq, etc.
│       ├── components/       # Shared React components
│       │   └── ui/           # Primitive UI components
│       ├── contexts/         # React context providers (DataContext)
│       ├── data/             # Data service layer + mock data
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Core utilities
│       │   ├── auth.ts       # NextAuth config
│       │   ├── db.ts         # Prisma client singleton
│       │   ├── api-security.ts # API key validation, rate limiting
│       │   ├── audit-logger.ts # Audit log writes
│       │   └── ...
│       ├── types/            # TypeScript types + next-auth.d.ts augmentation
│       └── workers/          # BullMQ workers (transcode, email, sync, analytics)
│
└── .kiro/
    ├── specs/                # Feature specs (requirements, design, tasks)
    └── steering/             # AI assistant context files (this directory)
```

## Key Conventions

### API Routes
- Admin routes live under `/api/admin/` and are protected by `requireAdmin()` — returns 401/403 if not authenticated or not ADMIN role
- Public/student routes use session checks via NextAuth `getServerSession()`
- All inputs validated with Zod schemas before database writes
- All admin mutations write to `AuditLog`

### Database
- Single Prisma schema shared between both apps (keep `cloud/prisma/schema.prisma` and `cloud_website/prisma/schema.prisma` in sync)
- IDs use `cuid()` by default
- Monetary values stored as integer cents (e.g., `priceCents`, `amountCents`)
- Soft relationships use `onDelete: Cascade` for user-owned data

### Components
- Page-level components in `src/app/`
- Reusable components in `src/components/`
- Primitive UI components in `src/components/ui/`
- Each component file is a single named export matching the filename

### Data Layer
- `src/data/` contains service classes that abstract DB queries
- `src/lib/` contains lower-level utilities, clients, and helpers
- Mock data in `src/data/mock-data-service.ts` and `src/data/sample-data.ts` for development/testing

### Testing
- Unit tests colocated in `src/__tests__/` or alongside source as `*.test.ts`
- E2E tests in `tests/e2e/` (cloud_website)
- Property-based tests use `fast-check` and live alongside unit tests
