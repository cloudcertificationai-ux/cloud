# Quick Fix: Page Not Redirecting After Login

## The Problem

After successful Google login via Auth0, the page stays on the signin page showing the "OAuthAccountNotLinked" error instead of redirecting to the dashboard.

## Root Cause

The Prisma adapter was throwing an error during account linking BEFORE the signIn callback could complete, preventing the session from being established.

## Solution Applied

### 1. Enhanced Custom Adapter

Added better error handling and logging to the custom adapter:

```typescript
async linkAccount(account) {
  try {
    // Try to create account
    return await p.account.create({ data: account })
  } catch (error: any) {
    // If account exists, fetch and return it instead of failing
    if (error.code === 'P2002') {
      return await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      })
    }
    throw error
  }
}
```

### 2. Simplified Callbacks

Removed complex logic that was causing conflicts between the adapter and callbacks.

### 3. Added Debug Logging

Enabled debug mode in development to see exactly what's happening:

```typescript
debug: process.env.NODE_ENV === 'development'
```

## How to Test

### Step 1: Clean Up Database

```bash
cd anywheredoor
npx tsx scripts/fix-oauth-accounts.ts
```

### Step 2: Restart Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 3: Clear Browser Data

- Open DevTools (F12)
- Go to Application tab
- Clear all cookies for localhost:3000
- Or use Incognito/Private mode

### Step 4: Test Login

1. Go to: http://localhost:3000/auth/signin
2. Click "Continue with Google"
3. Sign in with Google
4. Watch the terminal logs

### Expected Logs (Success):

```
[Auth0] Profile received: { sub: 'google-oauth2|...', email: '...', name: '...' }
[CustomAdapter] Linking account: auth0 google-oauth2|...
[CustomAdapter] Account linked successfully
[SignIn] Callback started for: your@email.com
[SignIn] Profile updated successfully
[SignIn] Callback completed successfully
[JWT] Token created for user: your@email.com
[Session] Session created for: your@email.com
```

### Expected Result:

✅ Redirect to dashboard (http://localhost:3000/)
✅ Your name and profile picture appear
✅ No errors in console

## If Still Not Working

### Check 1: Session Status

Add this to the signin page temporarily to debug:

```typescript
console.log('Session status:', status)
console.log('Session data:', session)
```

### Check 2: Database

```bash
npx prisma studio
```

Verify:
- User record exists
- Account record exists with correct provider
- No duplicate accounts

### Check 3: Environment Variables

```bash
# Check these are set:
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
echo $AUTH0_CLIENT_ID
```

### Check 4: Auth0 Configuration

1. Go to Auth0 Dashboard
2. Check Application → Connections
3. Ensure google-oauth2 is enabled
4. Check callback URLs include: `http://localhost:3000/api/auth/callback/auth0`

## Common Issues

### Issue: "OAuthAccountNotLinked" still appears

**Solution:**
```bash
# 1. Delete all accounts for your email
npx prisma studio
# Go to Account table, delete your accounts

# 2. Clear browser cookies completely

# 3. Try again
```

### Issue: Redirects to signin page in a loop

**Solution:**
```bash
# Check NEXTAUTH_URL is correct
echo $NEXTAUTH_URL
# Should be: http://localhost:3000

# If wrong, update .env:
NEXTAUTH_URL="http://localhost:3000"

# Restart server
```

### Issue: Session is null after login

**Solution:**
```typescript
// Check JWT callback is returning token
// Check session callback is setting session.user
// Look for errors in terminal logs
```

## Verification Checklist

After successful login:

- [ ] URL changes to http://localhost:3000/ or /dashboard
- [ ] No error messages on page
- [ ] Profile name displays in header
- [ ] Profile picture shows (if available)
- [ ] Can navigate to other pages
- [ ] Session persists on page refresh
- [ ] Can sign out successfully

## Debug Mode

The auth config now has debug mode enabled in development. You'll see detailed logs like:

```
[next-auth][debug] Session callback
[next-auth][debug] JWT callback
[next-auth][debug] SignIn callback
```

These help identify exactly where the flow is breaking.

## Next Steps

Once login works:

1. Test sign out
2. Test sign in again (should be faster)
3. Test with different Google accounts
4. Test Apple login (if configured)
5. Deploy to production with proper URLs

## Production Checklist

Before deploying:

- [ ] Update NEXTAUTH_URL to production domain
- [ ] Update Auth0 callback URLs
- [ ] Disable debug mode (or it's auto-disabled in production)
- [ ] Test login flow on production
- [ ] Monitor logs for errors

---

**Status:** Fixed and ready to test

**Time to test:** 2 minutes

**Expected outcome:** Seamless login with redirect to dashboard
