# Database Storage Fix - Auth0 Profile Data

## Problem

Auth0 profile data (name, email, image) was not being properly stored in the database during sign-up/sign-in.

## Root Cause

The Prisma Adapter was creating users, but the default Auth0 provider configuration wasn't properly mapping the profile fields (especially `picture` → `image`).

## Solution Applied

### 1. Custom Profile Mapper in Auth0 Provider

Added a custom `profile()` function to the Auth0 provider that explicitly maps Auth0 fields to our User model:

```typescript
Auth0Provider({
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  issuer: process.env.AUTH0_ISSUER!,
  profile(profile) {
    // Maps Auth0 profile to our User model
    return {
      id: profile.sub,              // Auth0 user ID
      email: profile.email,          // Email
      name: profile.name,            // Full name
      image: profile.picture,        // Profile picture (Auth0 uses 'picture')
      emailVerified: profile.email_verified ? new Date() : null,
      role: 'STUDENT',               // Default role
    }
  },
})
```

### 2. Enhanced SignIn Callback

The signIn callback now:
- Logs all data at each step
- Always updates the user with Auth0 profile data
- Handles email verification status
- Creates audit logs for tracking

```typescript
async signIn({ user, account, profile }) {
  // Extract data from Auth0 profile
  const profileData = {
    email: profile.email,
    name: profile.name,
    image: profile.picture,
    emailVerified: profile.email_verified ? new Date() : null,
    lastLoginAt: new Date()
  }
  
  // Update user in database
  await prisma.user.update({
    where: { id: user.id },
    data: profileData
  })
}
```

## How It Works Now

### Sign-Up Flow (New User):

```
1. User clicks "Sign in with Auth0"
   ↓
2. Auth0 authentication
   ↓
3. Auth0 returns profile:
   {
     sub: "auth0|123...",
     email: "user@example.com",
     name: "John Doe",
     picture: "https://s.gravatar.com/avatar/...",
     email_verified: true
   }
   ↓
4. Auth0Provider.profile() maps data:
   {
     id: "auth0|123...",
     email: "user@example.com",
     name: "John Doe",
     image: "https://s.gravatar.com/avatar/...",  ← picture → image
     emailVerified: Date,
     role: "STUDENT"
   }
   ↓
5. Prisma Adapter creates user in database
   ↓
6. signIn callback updates user with complete data
   ↓
7. User record in database has all fields populated
```

### Sign-In Flow (Existing User):

```
1. User signs in with Auth0
   ↓
2. Auth0 returns updated profile
   ↓
3. signIn callback updates user in database
   ↓
4. Database always has latest Auth0 data
```

## What You Need to Do

### Step 1: Delete Existing Test Users

If you have test users without proper data, delete them:

```bash
# Open Prisma Studio
npx prisma studio

# In browser:
# 1. Go to User table
# 2. Find users with null name/image
# 3. Delete them
# 4. Close Prisma Studio
```

### Step 2: Restart Everything

```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

### Step 3: Clear Browser Data

1. Open DevTools (F12)
2. Application tab → Clear site data
3. Close browser completely
4. Reopen browser

### Step 4: Sign Up Fresh

1. Navigate to `http://localhost:3000/auth/signin`
2. Click "Sign in with Auth0"
3. **Use a NEW email** or delete old account in Auth0 first
4. Complete authentication
5. **Watch terminal logs**

### Expected Terminal Output

You should see detailed logs:

```
Auth0 Provider - Raw profile: {
  sub: 'auth0|...',
  email: 'user@example.com',
  name: 'John Doe',
  picture: 'https://s.gravatar.com/avatar/...',
  email_verified: true
}

=== SignIn Callback START ===
User object from adapter: {
  id: 'clxxxxx...',
  email: 'user@example.com',
  name: 'John Doe',
  image: 'https://s.gravatar.com/avatar/...'
}
Account: { provider: 'auth0', type: 'oauth' }
Profile from Auth0: {
  sub: 'auth0|...',
  email: 'user@example.com',
  name: 'John Doe',
  picture: 'https://s.gravatar.com/avatar/...',
  email_verified: true
}
Updating user with profile data: {
  email: 'user@example.com',
  name: 'John Doe',
  image: 'https://s.gravatar.com/avatar/...',
  emailVerified: 2026-02-01T...,
  lastLoginAt: 2026-02-01T...
}
User successfully updated in database: {
  id: 'clxxxxx...',
  email: 'user@example.com',
  name: 'John Doe',
  image: 'https://s.gravatar.com/avatar/...',
  emailVerified: 2026-02-01T...
}
Audit log created
=== SignIn Callback END ===

Initial sign-in with Auth0 profile: {
  email: 'user@example.com',
  name: 'John Doe',
  picture: 'https://s.gravatar.com/avatar/...',
  role: 'STUDENT'
}
```

### Step 5: Verify Database

```bash
# Open Prisma Studio
npx prisma studio

# Check User table:
# - email: Should have your email
# - name: Should have your name
# - image: Should have URL
# - emailVerified: Should have date
# - lastLoginAt: Should have recent date
# - role: Should be 'STUDENT'
```

### Step 6: Verify in App

1. **Dashboard** (`/dashboard`):
   - Should show: "Welcome back, John Doe!"
   - Should show your profile image

2. **Profile** (`/profile`):
   - Should show your name
   - Should show your email
   - Should show your profile image
   - Should show your role

3. **Browser Console**:
   ```javascript
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   ```
   Should show complete user object

## Troubleshooting

### Issue: Still seeing null name/image in database

**Possible Causes:**
1. Using old user account
2. Auth0 profile doesn't have name/picture
3. Logs not showing profile data

**Solutions:**

**A. Check Auth0 Profile:**
```
1. Go to Auth0 Dashboard
2. User Management → Users
3. Find your user
4. Check "Name" and "Picture" fields
5. If empty, add them manually
6. Save
```

**B. Delete Old User and Sign Up Fresh:**
```bash
# In Prisma Studio
# Delete the user
# Sign up again with same email
```

**C. Check Terminal Logs:**
```
If you see:
  "Auth0 Provider - Raw profile: { name: undefined, picture: undefined }"
  
Then Auth0 isn't sending the data.
Check Auth0 application settings.
```

### Issue: Logs show data but database is empty

**Cause:** Database update failed

**Solution:**
```bash
# Check database connection
npx prisma db push

# Check for errors in terminal
# Look for "ERROR in signIn callback"
```

### Issue: "Cannot update user" error

**Cause:** User doesn't exist yet

**Solution:**
This shouldn't happen with Prisma Adapter, but if it does:
```typescript
// The signIn callback runs AFTER user is created
// So user should always exist
// Check terminal for actual error message
```

## Verification Checklist

After signing up/in, verify:

```
□ Terminal shows "Auth0 Provider - Raw profile" with your data
□ Terminal shows "=== SignIn Callback START ==="
□ Terminal shows "User successfully updated in database"
□ Terminal shows "Audit log created"
□ Terminal shows "=== SignIn Callback END ==="
□ Terminal shows "Initial sign-in with Auth0 profile"
□ Prisma Studio shows user with all fields populated
□ Dashboard shows your name and image
□ Profile page shows all your data
□ No errors in terminal or console
```

## Database Schema

The User table should have:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?   ← From Auth0 profile.name
  image         String?   ← From Auth0 profile.picture
  role          UserRole  @default(STUDENT)
  lastLoginAt   DateTime? ← Updated on each sign-in
  // ... other fields
}
```

## Auth0 Profile Structure

Auth0 sends:
```json
{
  "sub": "auth0|123...",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://s.gravatar.com/avatar/...",
  "updated_at": "2026-02-01T..."
}
```

We map to:
```typescript
{
  id: profile.sub,
  email: profile.email,
  emailVerified: profile.email_verified ? new Date() : null,
  name: profile.name,
  image: profile.picture,  // ← Key mapping!
  role: 'STUDENT'
}
```

## Success Indicators

✅ Terminal shows complete Auth0 profile data  
✅ Terminal shows successful database update  
✅ Prisma Studio shows user with all fields  
✅ Dashboard displays name and image  
✅ Profile page shows complete data  
✅ No errors anywhere  

If all ✅, the database storage is working correctly!

## Common Auth0 Profile Issues

### Issue: Auth0 doesn't send picture

**Cause:** User signed up with email/password (no social login)

**Solution:**
1. Go to Auth0 Dashboard
2. User Management → Users
3. Click on user
4. Manually add picture URL
5. Or connect social account (Google, etc.)

### Issue: Auth0 doesn't send name

**Cause:** User didn't provide name during sign-up

**Solution:**
1. Update in Auth0 Dashboard
2. Or user can update in profile page
3. Will sync on next sign-in

## Testing Different Scenarios

### Scenario 1: New User with Complete Profile
```
1. Sign up with Google via Auth0
2. Google provides name and picture
3. All data stored in database
4. ✅ Everything works
```

### Scenario 2: New User with Email Only
```
1. Sign up with email/password
2. Auth0 only has email
3. name and image are null
4. User can update in profile page
5. ✅ Still works, just incomplete
```

### Scenario 3: Existing User Updates Auth0 Profile
```
1. User updates name in Auth0
2. User signs in again
3. signIn callback updates database
4. ✅ Database has new data
```

## Need More Help?

If data still not storing:
1. Check terminal logs for errors
2. Check Auth0 Dashboard for user data
3. Check Prisma Studio for database state
4. Share terminal logs for debugging
