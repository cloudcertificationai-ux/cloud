# Authentication Troubleshooting Guide

## Issue: User Data Not Showing in Profile

### Root Cause
When we switched from `database` to `jwt` session strategy, the JWT token wasn't storing complete user data. The token only had the user ID and role, but not name, email, or image.

### Fix Applied
Updated the JWT callback to:
1. Store complete user data (id, email, name, image, role) in the token on sign-in
2. Refresh user data from database on token updates
3. Pass all user data to the session

## Steps to Fix Your Current Session

Since you're already logged in with an old JWT token that doesn't have complete user data, you need to clear your session:

### Option 1: Sign Out and Sign In Again (Recommended)

1. Click your profile dropdown or navigate to sign out
2. Sign out completely
3. Sign in again with Auth0
4. Your profile should now show all user data

### Option 2: Clear Browser Cookies

1. Open DevTools (F12)
2. Go to Application tab → Cookies
3. Find and delete `next-auth.session-token` cookie
4. Refresh the page
5. Sign in again

### Option 3: Clear All Site Data

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data" button
4. Refresh and sign in again

## Verify the Fix

After signing in again, check:

1. **Dashboard Page** (`/dashboard`):
   - Should show: "Welcome back, [Your Name]!"
   - Should show your profile image
   - Should show enrollment stats

2. **Profile Page** (`/profile`):
   - Should show your name
   - Should show your email
   - Should show your profile image
   - Should show your role badge

3. **Browser Console**:
   - Open DevTools (F12) → Console tab
   - Type: `fetch('/api/auth/session').then(r => r.json()).then(console.log)`
   - Should see complete user object with id, email, name, image, role

## Common Issues

### Issue: Still seeing "User" or empty name

**Cause:** Old JWT token still in use

**Solution:**
```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```
Then clear cookies and sign in again.

### Issue: Profile API returns 401

**Cause:** Session not properly authenticated

**Solution:**
1. Check that you're signed in: `http://localhost:3000/api/auth/session`
2. Should return user data, not `{}`
3. If empty, sign out and sign in again

### Issue: "Cannot read properties of null"

**Cause:** User doesn't exist in database

**Solution:**
```bash
# Check if user exists in database
npx prisma studio
# Look in User table for your email
# If missing, sign in again to create the user
```

### Issue: Redirect loop still happening

**Cause:** Middleware can't verify JWT token

**Solution:**
1. Check `.env` has `NEXTAUTH_SECRET` set
2. Restart dev server
3. Clear cookies
4. Sign in again

## Testing Checklist

After fixing, verify these work:

- [ ] Can sign in with Auth0
- [ ] Dashboard shows your name and image
- [ ] Profile page shows all your data
- [ ] Can edit profile and see changes
- [ ] Can navigate between dashboard and profile
- [ ] No redirect loops
- [ ] No console errors

## Debug Commands

```bash
# Check session data
curl http://localhost:3000/api/auth/session

# Check if user exists in database
npx prisma studio

# View server logs
# Watch terminal where `npm run dev` is running

# Check environment variables
cat .env | grep NEXTAUTH
cat .env | grep AUTH0
```

## Expected Session Response

When you check `/api/auth/session`, you should see:

```json
{
  "user": {
    "id": "clxxxxx...",
    "email": "your@email.com",
    "name": "Your Name",
    "image": "https://...",
    "role": "STUDENT"
  },
  "expires": "2026-02-02T..."
}
```

If you see `{}` or missing fields, sign out and sign in again.

## Still Having Issues?

1. **Check server logs** in terminal where `npm run dev` is running
2. **Check browser console** for JavaScript errors
3. **Check Network tab** in DevTools for failed API calls
4. **Verify Auth0 configuration** in `.env` file
5. **Try incognito mode** to rule out browser cache issues

## Prevention

To avoid this issue in the future:
- Always sign out before major authentication changes
- Clear cookies when switching between branches
- Restart dev server after changing `.env` or auth configuration
