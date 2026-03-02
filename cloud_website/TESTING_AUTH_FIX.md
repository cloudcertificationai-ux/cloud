# Testing Authentication Fix

## Quick Test Guide

Follow these steps to verify the authentication fixes are working correctly.

## Prerequisites

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Make sure your database is running and migrated:
   ```bash
   npx prisma migrate dev
   ```

## Test Scenarios

### ✅ Test 1: Protected Route Access (Unauthenticated)

**Expected:** Should redirect to login page with callback URL

1. Open browser in **incognito/private mode**
2. Navigate to: `http://localhost:3000/dashboard`
3. **Expected Result:** 
   - Immediately redirected to `/auth/signin?callbackUrl=/dashboard`
   - No flash of dashboard content
   - No console errors

4. Try the same with profile:
   - Navigate to: `http://localhost:3000/profile`
   - **Expected Result:** Redirected to `/auth/signin?callbackUrl=/profile`

### ✅ Test 2: Login Flow

**Expected:** Should login and redirect to callback URL

1. From the signin page (after Test 1)
2. Click "Sign in with Auth0"
3. Complete Auth0 authentication
4. **Expected Result:**
   - Redirected back to `/dashboard` (the original callbackUrl)
   - Dashboard loads with your user data
   - No redirect loops
   - No console errors

### ✅ Test 3: Direct Dashboard Access (Authenticated)

**Expected:** Should load dashboard directly

1. While still logged in from Test 2
2. Navigate to: `http://localhost:3000/dashboard`
3. **Expected Result:**
   - Dashboard loads immediately
   - No redirect to login
   - User data displays correctly

### ✅ Test 4: Profile Access (Authenticated)

**Expected:** Should load profile directly

1. While logged in
2. Click on your profile link in the header OR navigate to `/profile`
3. **Expected Result:**
   - Profile page loads immediately
   - No redirect to login
   - Profile data displays correctly

### ✅ Test 5: Auth Page Access (Authenticated)

**Expected:** Should redirect away from login page

1. While logged in
2. Navigate to: `http://localhost:3000/auth/signin`
3. **Expected Result:**
   - Immediately redirected to `/` (home page)
   - No flash of signin page
   - No console errors

### ✅ Test 6: Auth Page with Callback (Authenticated)

**Expected:** Should redirect to callback URL

1. While logged in
2. Navigate to: `http://localhost:3000/auth/signin?callbackUrl=/dashboard`
3. **Expected Result:**
   - Immediately redirected to `/dashboard`
   - No flash of signin page

### ✅ Test 7: Logout and Re-access

**Expected:** Should require login again

1. While logged in, sign out
2. Try to access `/dashboard` again
3. **Expected Result:**
   - Redirected to `/auth/signin?callbackUrl=/dashboard`
   - Must login again to access

## Common Issues and Solutions

### Issue: "Invalid session token" error

**Solution:** Clear your browser cookies and try again. The session strategy changed from database to JWT.

### Issue: Redirect loop on dashboard

**Solution:** 
1. Check that `NEXTAUTH_SECRET` is set in `.env`
2. Clear browser cookies
3. Restart the dev server

### Issue: "Cannot read properties of undefined"

**Solution:** Make sure your database is running and the user exists in the database.

### Issue: Auth0 error

**Solution:** Verify your Auth0 credentials in `.env`:
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_ISSUER`

## Browser Console Checks

Open browser DevTools (F12) and check:

1. **Network Tab:**
   - Should see successful API calls to `/api/auth/session`
   - No 401 or 403 errors on protected routes

2. **Console Tab:**
   - No error messages
   - No warnings about authentication

3. **Application Tab (Cookies):**
   - Should see `next-auth.session-token` cookie
   - Cookie should have proper domain and path

## Success Criteria

All tests pass if:
- ✅ Unauthenticated users cannot access protected routes
- ✅ Users are redirected to login with proper callback URL
- ✅ After login, users are redirected to their intended destination
- ✅ Authenticated users can access protected routes without issues
- ✅ Authenticated users cannot access login page (auto-redirected)
- ✅ No redirect loops occur
- ✅ No console errors appear

## Troubleshooting Commands

If you encounter issues:

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check environment variables
cat .env | grep NEXTAUTH
cat .env | grep AUTH0

# Restart dev server
npm run dev
```

## Need Help?

If tests fail, check:
1. `AUTH_REDIRECT_FIX.md` for implementation details
2. Browser console for error messages
3. Terminal for server errors
4. `.env` file for correct configuration
