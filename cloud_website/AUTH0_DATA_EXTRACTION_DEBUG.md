# Auth0 Data Extraction - Debug Guide

## What Was Fixed

The JWT callback now properly extracts data from Auth0 profile on initial sign-in:

### Before ❌
```typescript
// Only used user object from database (might be empty on first login)
if (user) {
  token.name = user.name  // Could be null
  token.picture = user.image  // Could be null
}
```

### After ✅
```typescript
// Prioritizes Auth0 profile data on initial sign-in
if (account && profile) {
  token.email = profile.email || user.email
  token.name = profile.name || user.name
  token.picture = profile.picture || user.image
}
```

## How to Test

### Step 1: Clear Everything

```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Step 2: Clear Browser Data

1. Open DevTools (F12)
2. Application tab → Storage → Clear site data
3. Close DevTools
4. Close browser completely
5. Reopen browser

### Step 3: Sign In and Watch Logs

1. Navigate to `http://localhost:3000/auth/signin`
2. Click "Sign in with Auth0"
3. Complete authentication
4. **Watch your terminal** where `npm run dev` is running

You should see logs like:

```
SignIn callback triggered: {
  userId: 'clxxxxx...',
  userEmail: 'your@email.com',
  userName: 'Your Name',
  userImage: 'https://...',
  provider: 'auth0',
  hasProfile: true
}

Auth0 Profile data: {
  name: 'Your Name',
  email: 'your@email.com',
  picture: 'https://s.gravatar.com/avatar/...',
  image: undefined
}

Profile data to update: {
  name: 'Your Name',
  image: 'https://s.gravatar.com/avatar/...',
  lastLoginAt: 2026-02-01T...
}

User updated in database: {
  id: 'clxxxxx...',
  name: 'Your Name',
  image: 'https://s.gravatar.com/avatar/...',
  hasChanges: true
}

Initial sign-in with Auth0 profile: {
  email: 'your@email.com',
  name: 'Your Name',
  picture: 'https://s.gravatar.com/avatar/...',
  role: 'STUDENT'
}
```

### Step 4: Verify in Browser

After sign-in, check:

1. **Dashboard** (`/dashboard`):
   - Should show: "Welcome back, [Your Name]!"
   - Should show your profile image

2. **Profile** (`/profile`):
   - Should show your name
   - Should show your email
   - Should show your profile image

3. **Browser Console**:
   ```javascript
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   ```
   Should output:
   ```json
   {
     "user": {
       "id": "clxxxxx...",
       "email": "your@email.com",
       "name": "Your Name",
       "image": "https://s.gravatar.com/avatar/...",
       "role": "STUDENT"
     }
   }
   ```

## Troubleshooting

### Issue: Still seeing null/empty name or image

**Check Terminal Logs:**

If you see:
```
Auth0 Profile data: {
  name: undefined,
  email: 'your@email.com',
  picture: undefined
}
```

**Cause:** Auth0 profile doesn't have name/picture

**Solution:** Update your Auth0 profile:
1. Go to Auth0 Dashboard
2. User Management → Users
3. Find your user
4. Click on user
5. Update "Name" and "Picture" fields
6. Save
7. Sign out and sign in again

### Issue: Logs show data but profile page is empty

**Cause:** Old JWT token still in use

**Solution:**
1. Clear cookies completely
2. Sign out
3. Close browser
4. Reopen and sign in again

### Issue: No logs appearing in terminal

**Cause:** Dev server not running or logs not visible

**Solution:**
```bash
# Make sure dev server is running
npm run dev

# Check if logs are being suppressed
# Look for any errors in terminal
```

### Issue: "Cannot read properties of null"

**Cause:** User not created in database

**Solution:**
```bash
# Check database
npx prisma studio

# Look in User table
# If user missing, sign in again to create
```

## Verify Database

Check that data was saved to database:

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to User table
# Find your user by email
# Verify fields:
# - name: Should have your name
# - image: Should have URL
# - email: Should have your email
# - lastLoginAt: Should be recent
```

## Auth0 Configuration Check

Make sure Auth0 is configured to send profile data:

1. Go to Auth0 Dashboard
2. Applications → Your Application
3. Settings tab
4. Scroll to "Advanced Settings"
5. OAuth tab
6. Make sure these scopes are enabled:
   - `openid`
   - `profile`
   - `email`

## Expected Auth0 Profile Structure

Auth0 sends profile data like this:

```json
{
  "sub": "auth0|...",
  "name": "Your Name",
  "email": "your@email.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/...",
  "updated_at": "2026-02-01T..."
}
```

Our code extracts:
- `profile.name` → `user.name`
- `profile.email` → `user.email`
- `profile.picture` → `user.image`

## Testing with Different Auth0 Accounts

### Test 1: Account with Full Profile
1. Sign in with account that has name and picture
2. Verify all data appears

### Test 2: Account with Minimal Profile
1. Sign in with account that only has email
2. Should still work, but name/image will be null
3. Can update in profile page later

### Test 3: Update Auth0 Profile
1. Sign in
2. Update name/picture in Auth0 Dashboard
3. Sign out and sign in again
4. Should see updated data

## Debug Checklist

```
□ Dev server running
□ Terminal visible and showing logs
□ Browser cookies cleared
□ Signed out completely
□ Signed in with Auth0
□ Terminal shows "SignIn callback triggered"
□ Terminal shows "Auth0 Profile data"
□ Terminal shows "User updated in database"
□ Terminal shows "Initial sign-in with Auth0 profile"
□ Dashboard shows name and image
□ Profile page shows all data
□ Session API returns complete user object
```

## Still Not Working?

If after all these steps you still don't see data:

1. **Check Auth0 User Profile:**
   - Go to Auth0 Dashboard
   - User Management → Users
   - Click on your user
   - Verify "Name" and "Picture" fields have values

2. **Check Environment Variables:**
   ```bash
   cat .env | grep AUTH0
   ```
   Should show:
   - AUTH0_CLIENT_ID
   - AUTH0_CLIENT_SECRET
   - AUTH0_ISSUER

3. **Check Database Connection:**
   ```bash
   npx prisma db push
   ```
   Should succeed without errors

4. **Check Prisma Client:**
   ```bash
   npx prisma generate
   ```
   Regenerate Prisma client

5. **Full Reset:**
   ```bash
   # Stop server
   rm -rf .next
   npx prisma generate
   npm run dev
   ```
   Then clear cookies and sign in again

## Success Indicators

✅ Terminal shows detailed logs with your data  
✅ Dashboard shows "Welcome back, [Your Name]!"  
✅ Profile image appears in header and pages  
✅ Profile page shows all fields populated  
✅ Session API returns complete user object  
✅ No console errors  
✅ No redirect loops  

If all these are ✅, the Auth0 data extraction is working correctly!
