# Quick Test Guide: Google & Apple Login

## 🚀 Quick Start (2 minutes)

### Step 1: Clean Up (if you had errors before)

```bash
cd anywheredoor
npx tsx scripts/fix-oauth-accounts.ts
```

### Step 2: Start Server

```bash
npm run dev
```

### Step 3: Test Login

1. Open: http://localhost:3000/auth/signin
2. Click "Continue with Google"
3. Sign in with your Google account
4. ✅ You should be redirected to the dashboard

## ✅ What Should Happen

### Sign In Flow:
```
1. Click "Continue with Google"
   ↓
2. Redirect to Auth0
   ↓
3. Auth0 shows Google login
   ↓
4. Sign in with Google
   ↓
5. Redirect back to your app
   ↓
6. ✅ Dashboard loads with your profile
```

### Console Logs (Success):
```
=== SignIn Callback START ===
User: your-email@gmail.com Provider: auth0
Existing user found: Yes (or No for first time)
Account already linked: true (or false for first time)
Profile updated successfully
=== SignIn Callback END ===
```

### Browser:
- URL changes to: `http://localhost:3000/` or `http://localhost:3000/dashboard`
- Your name and profile picture appear
- No error messages

## ❌ What Should NOT Happen

### Bad Flow (Fixed):
```
1. Click "Continue with Google"
   ↓
2. Sign in with Google
   ↓
3. ❌ Error: OAuthAccountNotLinked
   ↓
4. Stuck on signin page
```

If you see this, run the cleanup script again.

## 🔍 Verify in Database

```bash
npx prisma studio
```

### Check User Table:
- ✅ Your email exists
- ✅ Name is populated
- ✅ Image URL is set
- ✅ emailVerified is set
- ✅ lastLoginAt is recent

### Check Account Table:
- ✅ One account record for your user
- ✅ provider = "auth0"
- ✅ providerAccountId starts with "google-oauth2|"
- ✅ No duplicate accounts

## 🧪 Test Scenarios

### Scenario 1: First Time User
1. Use an email that's never signed in before
2. Click "Continue with Google"
3. ✅ Account created automatically
4. ✅ Redirected to dashboard

### Scenario 2: Returning User
1. Sign out
2. Sign in again with Google
3. ✅ Existing account used
4. ✅ Profile updated with latest data
5. ✅ Redirected to dashboard

### Scenario 3: Multiple Browsers
1. Sign in on Chrome
2. Sign in on Safari (same Google account)
3. ✅ Both work without errors
4. ✅ Same user account used

### Scenario 4: Sign Out and Back In
1. Sign in with Google
2. Click sign out
3. Sign in again with Google
4. ✅ Works seamlessly

## 📊 Success Checklist

After testing, verify:

- [ ] Can sign in with Google
- [ ] Can sign in with Apple (if configured)
- [ ] Profile picture shows up
- [ ] Name displays correctly
- [ ] Can sign out
- [ ] Can sign back in
- [ ] No OAuthAccountNotLinked errors
- [ ] No duplicate accounts in database
- [ ] Session persists on page refresh

## 🐛 Troubleshooting

### Error: "OAuthAccountNotLinked"

**Solution:**
```bash
# 1. Run cleanup script
npx tsx scripts/fix-oauth-accounts.ts

# 2. Clear browser cookies
# Chrome: Settings → Privacy → Clear browsing data

# 3. Try again
```

### Error: "Configuration"

**Check:**
- [ ] AUTH0_CLIENT_ID is set in .env
- [ ] AUTH0_CLIENT_SECRET is set in .env
- [ ] AUTH0_ISSUER is set in .env
- [ ] NEXTAUTH_SECRET is set in .env
- [ ] NEXTAUTH_URL is set to http://localhost:3000

### Google Login Not Showing

**Check Auth0 Dashboard:**
1. Go to Authentication → Social
2. Find Google
3. Ensure it's enabled (toggle is ON)
4. Go to Applications → Your App → Connections
5. Ensure google-oauth2 is checked

### Stuck on Loading

**Check Console:**
```bash
# Look for errors in terminal
# Common issues:
- Database connection failed
- Auth0 credentials invalid
- NEXTAUTH_SECRET not set
```

### Profile Not Updating

**Check:**
- [ ] User record exists in database
- [ ] Account record is linked
- [ ] Auth0 profile has the data
- [ ] signIn callback is running (check logs)

## 🎯 Expected Performance

- Sign in time: < 3 seconds
- Redirect time: < 1 second
- Profile load: < 500ms
- No errors in console
- No warnings about authentication

## 📝 Notes

### Auth0 Connection Names
- Google: `google-oauth2` (not just "google")
- Apple: `apple` (not "apple-signin")

### Provider in Database
- All social logins show as provider="auth0"
- The actual provider (Google/Apple) is in providerAccountId
- Example: `google-oauth2|112524250623259942594`

### Session Duration
- Default: 24 hours
- Configured in: `anywheredoor/src/lib/auth.ts`
- Can be changed in authOptions.session.maxAge

## 🚀 Production Checklist

Before deploying:

- [ ] Test all login flows in development
- [ ] Run cleanup script on production database
- [ ] Update Auth0 callback URLs for production domain
- [ ] Update NEXTAUTH_URL for production
- [ ] Test on production with real users
- [ ] Monitor logs for auth errors
- [ ] Set up error tracking (Sentry, etc.)

## 📚 Related Documentation

- `OAUTH_LOGIN_FIXED.md` - Detailed fix explanation
- `FIX_OAUTH_ACCOUNT_NOT_LINKED.md` - Technical details
- `GOOGLE_APPLE_LOGIN_SETUP_COMPLETE.md` - Setup guide
- `AUTH0_SETUP_GUIDE.md` - Auth0 configuration

---

**Quick Test Command:**
```bash
cd anywheredoor && \
npx tsx scripts/fix-oauth-accounts.ts && \
npm run dev
```

Then open: http://localhost:3000/auth/signin

**Expected Result:** ✅ Sign in works perfectly!
