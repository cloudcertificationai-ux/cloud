# Authentication System Verification Checklist

This document provides a comprehensive checklist for verifying the authentication system implementation as part of Task 6 checkpoint.

## Prerequisites

Before starting verification, ensure:

1. ✅ **Database is running**: PostgreSQL database is accessible
2. ✅ **Environment variables configured**: All required OAuth credentials are set in `.env`
3. ✅ **Dependencies installed**: Run `npm install` in the anywheredoor directory
4. ✅ **Database schema applied**: Run `npx prisma db push` to create tables
5. ✅ **Development server running**: Run `npm run dev` to start the application

## Verification Steps

### 1. Test Login with Google Account

**Objective**: Verify Google OAuth authentication works correctly

**Steps**:
1. Navigate to `http://localhost:3000/auth/signin`
2. Click "Continue with Google" button
3. Complete Google authentication flow
4. Verify redirect back to application

**Expected Results**:
- ✅ Redirected to Google OAuth consent screen
- ✅ After authentication, redirected back to application
- ✅ User is logged in (check header for user profile)
- ✅ No error messages displayed

**Database Verification**:
```sql
-- Check if user record was created
SELECT id, email, name, image, role, "lastLoginAt", "createdAt" 
FROM "User" 
WHERE email = 'your-google-email@gmail.com';

-- Check if account record was created
SELECT id, "userId", provider, "providerAccountId" 
FROM "Account" 
WHERE provider = 'google';

-- Check if session was created
SELECT id, "userId", "sessionToken", expires, "lastActivity" 
FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-google-email@gmail.com');
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

### 2. Test Login with Apple Account (if available)

**Objective**: Verify Apple Sign In authentication works correctly

**Steps**:
1. Navigate to `http://localhost:3000/auth/signin`
2. Click "Continue with Apple" button
3. Complete Apple authentication flow
4. Verify redirect back to application

**Expected Results**:
- ✅ Redirected to Apple Sign In screen
- ✅ After authentication, redirected back to application
- ✅ User is logged in (check header for user profile)
- ✅ No error messages displayed

**Database Verification**:
```sql
-- Check if user record was created
SELECT id, email, name, image, role, "lastLoginAt", "createdAt" 
FROM "User" 
WHERE email = 'your-apple-email@icloud.com';

-- Check if account record was created
SELECT id, "userId", provider, "providerAccountId" 
FROM "Account" 
WHERE provider = 'apple';
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed | ⬜ Skipped (No Apple credentials)

**Notes**:
_Record any issues or observations here_

---

### 3. Verify User Record Created in Database

**Objective**: Confirm user data is properly stored in the database

**Steps**:
1. After successful login, connect to the database
2. Query the User table for the authenticated user
3. Verify all fields are populated correctly

**Database Queries**:
```sql
-- View all users
SELECT id, email, name, image, role, "emailVerified", "lastLoginAt", "createdAt", "updatedAt" 
FROM "User" 
ORDER BY "createdAt" DESC;

-- View user profile
SELECT u.id, u.email, u.name, u.image, u.role, p.bio, p.location, p.timezone 
FROM "User" u 
LEFT JOIN "Profile" p ON u.id = p."userId" 
WHERE u.email = 'your-email@example.com';

-- View user accounts (OAuth connections)
SELECT a.id, a.provider, a."providerAccountId", a.type, u.email 
FROM "Account" a 
JOIN "User" u ON a."userId" = u.id 
WHERE u.email = 'your-email@example.com';
```

**Expected Results**:
- ✅ User record exists with correct email
- ✅ Name is populated from OAuth provider
- ✅ Profile photo URL is stored (for Google)
- ✅ Role is set to 'STUDENT' by default
- ✅ lastLoginAt timestamp is set
- ✅ Account record links user to OAuth provider

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

### 4. Verify Session Persists Across Page Refreshes

**Objective**: Ensure session management works correctly

**Steps**:
1. Log in successfully
2. Navigate to different pages (e.g., `/courses`, `/about`)
3. Refresh the browser (F5 or Cmd+R)
4. Check if user remains logged in
5. Close browser tab and reopen application
6. Verify user is still logged in (within 24 hours)

**Expected Results**:
- ✅ User remains logged in after page refresh
- ✅ User profile visible in header after refresh
- ✅ Session persists across different pages
- ✅ Session persists after closing and reopening browser tab
- ✅ No re-authentication required within 24 hours

**Database Verification**:
```sql
-- Check session details
SELECT id, "sessionToken", "userId", expires, "lastActivity", 
       (expires > NOW()) as "isValid",
       EXTRACT(EPOCH FROM (expires - NOW()))/3600 as "hoursRemaining"
FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-email@example.com')
ORDER BY "lastActivity" DESC;

-- Verify lastActivity is being updated
-- (Run this query, wait a few seconds, navigate to a protected page, then run again)
SELECT id, "lastActivity", 
       EXTRACT(EPOCH FROM (NOW() - "lastActivity")) as "secondsSinceLastActivity"
FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-email@example.com')
ORDER BY "lastActivity" DESC;
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

### 5. Test Logout Functionality

**Objective**: Verify logout properly terminates the session

**Steps**:
1. Log in successfully
2. Click on user profile dropdown in header
3. Click "Logout" or "Sign Out" button
4. Verify redirect to home page or login page
5. Try to access a protected route (e.g., `/dashboard`)
6. Verify redirect to login page

**Expected Results**:
- ✅ Logout button is visible and clickable
- ✅ After logout, user is redirected appropriately
- ✅ User profile no longer visible in header
- ✅ Attempting to access protected routes redirects to login
- ✅ Session token is invalidated

**Database Verification**:
```sql
-- Check if session was deleted after logout
SELECT COUNT(*) as "activeSessions"
FROM "Session" 
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-email@example.com')
AND expires > NOW();

-- Should return 0 after logout
```

**Browser Verification**:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check Cookies for `next-auth.session-token`
4. After logout, verify cookie is removed or expired

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

### 6. Verify Protected Routes Redirect to Login

**Objective**: Ensure route protection middleware works correctly

**Steps**:
1. Log out completely (or use incognito/private browsing)
2. Try to access protected routes directly:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/profile`
   - `http://localhost:3000/admin`
3. Verify redirect to login page
4. Check that `callbackUrl` parameter is set correctly
5. After login, verify redirect back to intended page

**Expected Results**:
- ✅ Accessing `/dashboard` without auth redirects to `/auth/signin?callbackUrl=/dashboard`
- ✅ Accessing `/profile` without auth redirects to `/auth/signin?callbackUrl=/profile`
- ✅ Accessing `/admin` without auth redirects to `/auth/signin?callbackUrl=/admin`
- ✅ After successful login, user is redirected to the originally requested page
- ✅ Non-protected routes (e.g., `/`, `/courses`, `/about`) are accessible without login

**Test Cases**:

| Route | Auth Required | Expected Behavior |
|-------|---------------|-------------------|
| `/` | No | Accessible without login |
| `/courses` | No | Accessible without login |
| `/about` | No | Accessible without login |
| `/dashboard` | Yes | Redirect to `/auth/signin?callbackUrl=/dashboard` |
| `/profile` | Yes | Redirect to `/auth/signin?callbackUrl=/profile` |
| `/admin` | Yes (Admin only) | Redirect to `/auth/signin?callbackUrl=/admin` |

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

### 7. Ensure All Tests Pass

**Objective**: Verify automated tests for authentication functionality

**Steps**:
1. Run unit tests: `npm test`
2. Run integration tests: `npm run test:integration` (if available)
3. Check for any failing tests related to authentication
4. Review test coverage for authentication module

**Expected Results**:
- ✅ All authentication unit tests pass
- ✅ All integration tests pass
- ✅ No console errors or warnings
- ✅ Test coverage is adequate (>80% for auth module)

**Test Commands**:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

**Notes**:
_Record any issues or observations here_

---

## Additional Verification Items

### Session Expiration (24 hours)

**Objective**: Verify session expires after 24 hours

**Steps**:
1. Log in successfully
2. Note the current time
3. Wait 24+ hours (or manually modify session expiry in database for testing)
4. Try to access a protected route
5. Verify redirect to login with session expired message

**Database Test**:
```sql
-- Manually expire a session for testing
UPDATE "Session" 
SET expires = NOW() - INTERVAL '1 hour'
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-email@example.com');
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

---

### Inactivity Timeout (2 hours)

**Objective**: Verify session expires after 2 hours of inactivity

**Steps**:
1. Log in successfully
2. Wait 2+ hours without any activity
3. Try to access a protected route
4. Verify redirect to login with session expired message

**Database Test**:
```sql
-- Manually set lastActivity to 2+ hours ago for testing
UPDATE "Session" 
SET "lastActivity" = NOW() - INTERVAL '3 hours'
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'your-email@example.com');
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

---

### Admin Role Authorization

**Objective**: Verify admin routes are protected by role

**Steps**:
1. Log in as a regular student (non-admin)
2. Try to access `/admin` routes
3. Verify redirect to home page (not login page)
4. Update user role to ADMIN in database
5. Try to access `/admin` routes again
6. Verify access is granted

**Database Commands**:
```sql
-- Check current role
SELECT id, email, role FROM "User" WHERE email = 'your-email@example.com';

-- Update role to ADMIN for testing
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';

-- Revert role to STUDENT
UPDATE "User" SET role = 'STUDENT' WHERE email = 'your-email@example.com';
```

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Passed | ⬜ Failed

---

## Common Issues and Troubleshooting

### Issue: "Can't reach database server"
**Solution**: 
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database credentials are correct
- Run `npx prisma db push` to create tables

### Issue: "OAuth callback error"
**Solution**:
- Verify OAuth credentials in .env file
- Check callback URLs in OAuth provider settings
- Ensure NEXTAUTH_URL matches your development URL
- Check NEXTAUTH_SECRET is set

### Issue: "Session not persisting"
**Solution**:
- Check browser cookies are enabled
- Verify NEXTAUTH_SECRET is set and consistent
- Check session strategy in auth.ts (should be 'database')
- Verify Session table exists in database

### Issue: "Protected routes not redirecting"
**Solution**:
- Check middleware.ts is properly configured
- Verify middleware matcher includes the protected routes
- Check getToken() is working correctly
- Verify NEXTAUTH_SECRET matches between auth.ts and middleware.ts

---

## Summary

Once all verification steps are complete, summarize the results:

**Overall Status**: ⬜ All Passed | ⬜ Some Failed | ⬜ Not Complete

**Passed**: ___ / 7 main tests + ___ / 3 additional tests

**Failed Tests**:
- List any failed tests here

**Issues Found**:
- List any issues discovered during verification

**Next Steps**:
- List any follow-up actions needed

---

## Sign-off

**Verified By**: ___________________

**Date**: ___________________

**Notes**: 
_Any additional comments or observations_

