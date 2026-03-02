# Admin Panel Authentication Setup - Implementation Summary

## Overview

Task 18 "Admin panel authentication setup" has been successfully implemented. The admin panel now uses Auth0 with social login providers (Google, Apple) and includes comprehensive admin role management.

## What Was Implemented

### 1. NextAuth.js Configuration (Task 18.1)

**Files Created/Modified:**
- ✅ `src/lib/auth.ts` - Centralized NextAuth configuration
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Updated to use centralized config
- ✅ `src/types/next-auth.d.ts` - Updated TypeScript definitions
- ✅ `.env.example` - Added Auth0 and OAuth provider configuration

**Key Features:**
- **Prisma Adapter Integration**: Uses `@next-auth/prisma-adapter` for database session management
- **Multiple Auth Providers**:
  - Auth0 (primary)
  - Google OAuth
  - Apple Sign In
- **Admin Role Verification**: Only users with `ADMIN` role can sign in to the admin panel
- **Profile Synchronization**: Automatically syncs user profile data from OAuth providers
- **Audit Logging**: Logs all admin authentication events (login, logout, access denied)
- **Session Management**: 24-hour session with database strategy

**Admin Access Control:**
The `signIn` callback checks if the user has an `ADMIN` role. Non-admin users are denied access and an audit log is created.

### 2. Admin Role Management (Task 18.2)

**Files Created/Modified:**
- ✅ `src/lib/role-management.ts` - Role management utilities
- ✅ `src/middleware.ts` - Enhanced with admin role checking

**Available Functions:**
```typescript
// Assign a role to a user
assignRole(userId: string, role: UserRole): Promise<void>

// Check if user has a specific role
hasRole(userId: string, role: UserRole): Promise<boolean>

// Check if user is an admin
isAdmin(userId: string): Promise<boolean>

// Get user's role
getUserRole(userId: string): Promise<UserRole | null>

// Get all users with a specific role
getUsersByRole(role: UserRole): Promise<User[]>

// Promote user to admin
promoteToAdmin(userId: string, promotedBy?: string): Promise<void>

// Demote admin to student
demoteFromAdmin(userId: string, demotedBy?: string): Promise<void>

// Verify admin access for API routes
verifyAdminAccess(userId: string): Promise<boolean>
```

**Middleware Enhancement:**
The middleware now checks for `ADMIN` role on all `/admin/*` routes. Non-admin users are automatically denied access.

### 3. Admin Login Page (Task 18.4)

**Files Created/Modified:**
- ✅ `src/app/auth/signin/page.tsx` - New social login page
- ✅ `src/app/auth/error/page.tsx` - Authentication error page

**Features:**
- **Social Login Buttons**: Auth0, Google, and Apple sign-in options
- **Loading States**: Visual feedback during authentication
- **Error Handling**: Displays user-friendly error messages
- **Responsive Design**: Works on all screen sizes
- **Admin-Only Notice**: Clear messaging that only admins can access

## Environment Variables Required

Add these to your `.env` file in the admin panel:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars

# Auth0 Configuration
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER=https://your-domain.auth0.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple Sign In (optional)
APPLE_ID=your-apple-id
APPLE_SECRET=your-apple-secret

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/anywheredoor
DIRECT_DATABASE_URL=postgresql://username:password@localhost:5432/anywheredoor
```

## How to Use

### 1. Configure Auth0

1. Create an Auth0 tenant at https://auth0.com
2. Create a new application (Regular Web Application)
3. Configure callback URLs:
   - `http://localhost:3001/api/auth/callback/auth0` (development)
   - `https://admin.yourdomain.com/api/auth/callback/auth0` (production)
4. Add logout URLs:
   - `http://localhost:3001` (development)
   - `https://admin.yourdomain.com` (production)
5. Enable Google and Apple social connections in Auth0
6. Copy credentials to `.env`

### 2. Create Admin Users

Before users can sign in to the admin panel, they must have the `ADMIN` role in the database:

```typescript
// Using Prisma
import prisma from '@/lib/db'

// Promote a user to admin
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { role: 'ADMIN' }
})

// Or use the role management utility
import { promoteToAdmin } from '@/lib/role-management'
await promoteToAdmin(userId)
```

### 3. Test Authentication

1. Start the admin panel: `npm run dev` (runs on port 3001)
2. Navigate to `http://localhost:3001/auth/signin`
3. Click on any social login button
4. Sign in with your OAuth provider
5. If you have `ADMIN` role, you'll be redirected to `/admin/dashboard`
6. If you don't have `ADMIN` role, you'll see an "Access Denied" error

## Security Features

### 1. Role-Based Access Control
- Only users with `ADMIN` role can access the admin panel
- Middleware enforces role checking on all `/admin/*` routes
- Non-admin access attempts are logged in audit logs

### 2. Audit Logging
All admin authentication events are logged:
- `ADMIN_LOGIN_SUCCESS` - Successful admin login
- `ADMIN_LOGIN_DENIED` - Non-admin user attempted access
- `ADMIN_LOGOUT` - Admin user logged out
- `ADMIN_PROFILE_SYNC` - Profile data synchronized from OAuth provider
- `ROLE_ASSIGNED` - Role assigned to user
- `USER_PROMOTED_TO_ADMIN` - User promoted to admin
- `ADMIN_DEMOTED` - Admin demoted to student

### 3. Session Management
- 24-hour session duration
- Database-backed sessions (using Prisma adapter)
- Automatic session cleanup on logout
- Last activity tracking

### 4. Profile Synchronization
- Automatically syncs name and profile photo from OAuth providers
- Detects and logs profile changes
- Updates stored profile on each login

## Database Schema

The implementation uses the existing Prisma schema with these key models:

- `User` - User accounts with role field
- `Account` - OAuth account linkage (NextAuth)
- `Session` - Active sessions (NextAuth)
- `AuditLog` - Authentication and role change logs

## Next Steps

1. **Configure Auth0**: Set up your Auth0 tenant and add credentials to `.env`
2. **Create Admin Users**: Promote users to `ADMIN` role in the database
3. **Test Authentication**: Verify the login flow works correctly
4. **Optional**: Implement task 18.3 (property tests for admin authorization)

## Troubleshooting

### "Access Denied" Error
- Verify the user has `ADMIN` role in the database
- Check the audit logs for access denial events
- Ensure Auth0 is configured correctly

### Authentication Fails
- Verify all environment variables are set correctly
- Check Auth0 callback URLs match your configuration
- Review NextAuth debug logs (set `debug: true` in auth config)

### Session Not Persisting
- Ensure `NEXTAUTH_SECRET` is set and at least 32 characters
- Verify database connection is working
- Check that Prisma migrations have been run

## Files Modified

```
anywheredoor_admin/
├── src/
│   ├── lib/
│   │   ├── auth.ts (created)
│   │   └── role-management.ts (created)
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts (modified)
│   │   └── auth/
│   │       ├── signin/
│   │       │   └── page.tsx (modified)
│   │       └── error/
│   │           └── page.tsx (created)
│   ├── types/
│   │   └── next-auth.d.ts (modified)
│   └── middleware.ts (modified)
├── .env.example (modified)
└── package.json (modified - added @next-auth/prisma-adapter)
```

## Implementation Complete ✅

All subtasks for Task 18 have been completed:
- ✅ 18.1 Configure NextAuth.js in admin panel
- ✅ 18.2 Implement admin role management
- ⏭️ 18.3 Write property test for admin authorization (optional)
- ✅ 18.4 Create admin login page

The admin panel now has a fully functional authentication system with Auth0 integration, social login support, and comprehensive admin role management.
