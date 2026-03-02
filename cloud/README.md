# AnyWhereDoor Admin Panel

The administrative interface for managing the AnyWhereDoor learning platform.

## 🎯 Overview

The admin panel provides comprehensive tools for:
- **Course Management:** Create, edit, and publish courses
- **Curriculum Building:** Organize modules and lessons with drag-and-drop
- **Media Management:** Upload and manage course media
- **Student Management:** View and manage student enrollments
- **Analytics:** Track platform performance and engagement
- **Audit Logging:** Monitor system activity and changes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (shared with main app)
- Auth0 account with admin role configured (optional)
- Cloudflare R2 for media storage

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**

Create `.env` file (or copy from `.env.example`):
```env
# Database (shared with main app)
DATABASE_URL=postgresql://user:password@localhost:5432/anywheredoor

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key

# Cloudflare R2 (for media storage)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=anywheredoor-media
R2_PUBLIC_DOMAIN=https://media.yourdomain.com
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Create admin user:**
```bash
npm run create-default-admin
```

**Default Admin Credentials:**
- Email: `admin@anywheredoor.com`
- Password: `Admin@123456`
- URL: http://localhost:3001

⚠️ **IMPORTANT:** Change the default password after first login!

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to access the admin panel.

## 📚 Documentation

### Quick Reference

- **[Admin Quick Reference](./ADMIN_QUICK_REFERENCE.md)** - Common commands and tasks
- **[Admin Login Credentials](./ADMIN_LOGIN_CREDENTIALS.md)** - Complete login guide
- **[R2 Setup Guide](./R2_SETUP_GUIDE.md)** - Cloudflare R2 configuration
- **[Quick Start R2](./QUICK_START_R2.md)** - 5-minute R2 setup
- **[R2 Migration Summary](./R2_MIGRATION_SUMMARY.md)** - S3 to R2 migration details

### User Guide

See the complete **[Admin Panel User Guide](../.kiro/specs/course-management-system/ADMIN_PANEL_USER_GUIDE.md)** for:
- Course creation and management
- Curriculum builder usage
- Media upload and management
- Publishing workflow
- Best practices
- Troubleshooting

### API Documentation

See **[API Documentation](../.kiro/specs/course-management-system/API_DOCUMENTATION.md)** for:
- Complete API reference
- Request/response formats
- Authentication requirements
- Error handling
- Rate limiting

### Technical Documentation

- **[Design Document](../.kiro/specs/course-management-system/design.md)** - System architecture
- **[Requirements](../.kiro/specs/course-management-system/requirements.md)** - Feature requirements
- **[Implementation Status](../.kiro/specs/course-management-system/IMPLEMENTATION_STATUS.md)** - Current state

## 🏗️ Architecture

### Technology Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form 7.49.3 + Zod 3.22.4
- **State:** Zustand 4.4.7
- **Data Fetching:** TanStack Query 5.17.9
- **Database:** Prisma 7.3.0
- **Drag-and-Drop:** @dnd-kit/core (to be installed)

### Project Structure

```
anywheredoor_admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin pages
│   │   │   ├── courses/       # Course management
│   │   │   ├── students/      # Student management
│   │   │   └── analytics/     # Analytics
│   │   └── api/               # API routes
│   │       └── admin/         # Admin APIs
│   ├── components/            # React components
│   │   ├── CourseForm.tsx    # Course creation form
│   │   ├── CurriculumBuilder.tsx  # Drag-and-drop builder
│   │   ├── MediaManager.tsx   # Media upload
│   │   └── LessonEditor.tsx   # Lesson content editor
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Authentication
│   │   ├── db.ts             # Database client
│   │   └── api-security.ts   # Security utilities
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema (shared)
└── public/                    # Static assets
```

## 🔑 Key Features

### Course Management

**Create Courses:**
- Comprehensive metadata form
- Slug auto-generation
- Rich text editor for descriptions
- Thumbnail upload
- Category and instructor assignment

**Edit Courses:**
- Update metadata
- Manage curriculum
- Upload media
- Preview before publishing

**Publish Courses:**
- Validation before publishing
- Immediate visibility on frontend
- Featured course management
- Unpublish capability

### Curriculum Builder

**Drag-and-Drop Interface:**
- Reorder modules and lessons
- Move lessons between modules
- Visual feedback during drag
- Auto-save on drop

**Module Management:**
- Create, edit, delete modules
- Collapsible module sections
- Sequential ordering

**Lesson Management:**
- Four lesson types: Video, Article, Quiz, AR
- Type-specific editors
- Content validation
- Duration tracking

### Media Management

**Upload Features:**
- Direct S3 upload (no server bottleneck)
- Drag-and-drop file upload
- Progress indicators
- Multiple file upload
- File type validation

**Media Library:**
- View all uploaded media
- Filter by type
- Search by filename
- Copy CDN URLs
- Preview media

### Student Management

**View Students:**
- List all students
- Search and filter
- View enrollment history
- Track progress

**Manage Enrollments:**
- Create manual enrollments
- Cancel enrollments
- Refund enrollments
- View enrollment details

### Analytics

**Platform Metrics:**
- Total courses
- Total students
- Total enrollments
- Revenue tracking

**Course Analytics:**
- Enrollment count
- Completion rate
- Average rating
- Revenue per course

**Student Analytics:**
- Active students
- Course completion
- Engagement metrics

## 🔒 Security

### Authentication

All admin APIs require:
- Valid NextAuth session
- ADMIN role in user profile

**Authentication Check:**
```typescript
const session = await requireAdmin(request)
// Returns 401 if not authenticated
// Returns 403 if not admin role
```

### Authorization

**Role-Based Access Control:**
- ADMIN: Full access to all features
- INSTRUCTOR: Course management only (future)
- STUDENT: No admin access

### Input Validation

All inputs validated with Zod schemas:
```typescript
const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  priceCents: z.number().int().min(0),
  // ... more fields
})
```

### Audit Logging

All admin actions are logged:
- Course creation, updates, deletion
- Publishing/unpublishing
- Enrollment changes
- Media uploads

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Structure

```
src/__tests__/
├── api/
│   └── admin/
│       └── courses/
│           └── course-crud.test.ts
├── components/
│   ├── CourseForm.test.tsx
│   └── CurriculumBuilder.test.tsx
└── lib/
    └── validation.test.ts
```

## 📦 Dependencies

### Core Dependencies

```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "typescript": "5",
  "tailwindcss": "4",
  "prisma": "7.3.0",
  "next-auth": "4.24.13",
  "react-hook-form": "7.49.3",
  "zod": "3.22.4",
  "@tanstack/react-query": "5.17.9",
  "zustand": "4.4.7"
}
```

### To Install

```bash
# Drag-and-drop library
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# AWS SDK (for S3 uploads)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# OR Cloudinary (alternative to S3)
npm install cloudinary
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection
- Auth0 credentials
- AWS/Cloudinary credentials
- NextAuth secret

### Deployment Checklist

- ✅ Set all environment variables
- ✅ Run database migrations
- ✅ Configure Auth0 for production domain
- ✅ Set up S3 bucket with CORS
- ✅ Configure CDN domain
- ✅ Test admin login
- ✅ Test course creation
- ✅ Test media upload

## 🛠️ Development

### Available Scripts

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint issues
npm run format                 # Format with Prettier
npm run type-check             # TypeScript type checking
npm test                       # Run tests

# Admin User Management
npm run create-default-admin   # Create default admin (quick setup)
npm run create-admin           # Create custom admin (interactive)
npm run list-admins            # List all admin users
npm run reset-password         # Reset admin password
```

### Code Quality

**Linting:**
```bash
npm run lint
```

**Formatting:**
```bash
npm run format
```

**Type Checking:**
```bash
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Cannot connect to database**
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify database exists

**Issue: Authentication fails**
- Check Auth0 credentials
- Verify NEXTAUTH_URL matches your domain
- Ensure user has ADMIN role

**Issue: Media upload fails**
- Check AWS credentials
- Verify S3 bucket exists
- Check CORS configuration
- Ensure bucket has public read access

**Issue: Drag-and-drop not working**
- Install @dnd-kit/core: `npm install @dnd-kit/core`
- Clear browser cache
- Try different browser

## 📞 Support

### Documentation

- **User Guide:** [ADMIN_PANEL_USER_GUIDE.md](../.kiro/specs/course-management-system/ADMIN_PANEL_USER_GUIDE.md)
- **API Docs:** [API_DOCUMENTATION.md](../.kiro/specs/course-management-system/API_DOCUMENTATION.md)
- **Design Docs:** [design.md](../.kiro/specs/course-management-system/design.md)

### Contact

- **Email:** admin-support@anywheredoor.com
- **Issues:** GitHub Issues
- **Slack:** #admin-panel-support

## 📄 License

This project is licensed under the MIT License.

---

**Last Updated:** February 13, 2026
**Version:** 1.0.0
**Port:** 3001
**Status:** Production Ready ✅

