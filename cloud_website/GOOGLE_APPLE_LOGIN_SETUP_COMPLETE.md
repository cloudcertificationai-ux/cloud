# Google & Apple Login Setup - Complete Guide

## ✅ What's Been Done

The code has been updated to support Google and Apple login through Auth0 social connections. The signin page now shows:

1. **Continue with Google** - Direct Google sign-in via Auth0
2. **Continue with Apple** - Direct Apple sign-in via Auth0  
3. **More sign in options** - Auth0 Universal Login with all configured providers

## 🎯 How It Works

```
User Flow:
1. User visits /auth/signin
2. Sees Google, Apple, and Auth0 buttons
3. Clicks Google or Apple → Auth0 handles OAuth → User signed in
4. Clicks "More options" → Auth0 Universal Login page → Choose any provider
```

## 📋 Setup Checklist

### Prerequisites
- ✅ Auth0 account and application configured
- ✅ Auth0 credentials in `.env` file
- ⏳ Google OAuth credentials (need to configure)
- ⏳ Apple Sign In credentials (need to configure)

### Step 1: Configure Google Social Connection

#### A. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen:
   - User Type: **External**
   - App name: `AnyWhereDoor`
   - User support email: your email
   - Scopes: `email`, `profile`, `openid`
6. Create OAuth client:
   - Type: **Web application**
   - Name: `AnyWhereDoor Auth0`
   - **Authorized redirect URIs**: 
     ```
     https://dev-dzupe84r4ur0je5r.us.auth0.com/login/callback
     ```
7. Copy **Client ID** and **Client Secret**

#### B. Enable in Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Authentication** → **Social**
3. Click **Google**
4. Toggle **Enable** to ON
5. Paste your Google **Client ID** and **Client Secret**
6. Ensure these attributes are selected:
   - ✅ Basic Profile
   - ✅ Email Address
7. Click **Save Changes**

#### C. Enable for Your Application

1. In Auth0, go to **Applications** → **Applications**
2. Click your application (`Anywheredoor Main App`)
3. Go to **Connections** tab
4. Ensure **google-oauth2** is enabled
5. Click **Save**

### Step 2: Configure Apple Social Connection

#### A. Get Apple Sign In Credentials

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**

**Create App ID:**
1. Click **Identifiers** → **+**
2. Select **App IDs** → **Continue**
3. Select **App** → **Continue**
4. Configure:
   - Description: `AnyWhereDoor`
   - Bundle ID: `com.anywheredoor.app`
   - Check **Sign In with Apple**
5. Register

**Create Service ID:**
1. Click **Identifiers** → **+**
2. Select **Services IDs** → **Continue**
3. Configure:
   - Description: `AnyWhereDoor Web`
   - Identifier: `com.anywheredoor.web`
   - Check **Sign In with Apple**
4. Click **Configure**:
   - Primary App ID: Select `com.anywheredoor.app`
   - Domains: `dev-dzupe84r4ur0je5r.us.auth0.com`
   - Return URLs: `https://dev-dzupe84r4ur0je5r.us.auth0.com/login/callback`
5. Save and Register

**Create Private Key:**
1. Click **Keys** → **+**
2. Name: `AnyWhereDoor Auth Key`
3. Check **Sign In with Apple**
4. Configure → Select your App ID
5. Register and **download .p8 file** (only shown once!)
6. Note the **Key ID**

#### B. Enable in Auth0

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click **Apple**
3. Toggle **Enable** to ON
4. Enter:
   - **Client ID**: `com.anywheredoor.web`
   - **Client Secret Signing Key**: Paste .p8 file contents
   - **Key ID**: Your Key ID
   - **Apple Team ID**: From Apple Developer account
5. Click **Save Changes**

#### C. Enable for Your Application

1. In Auth0, go to **Applications** → **Applications**
2. Click your application
3. Go to **Connections** tab
4. Ensure **apple** is enabled
5. Click **Save**

### Step 3: Test the Setup

#### Quick Test in Auth0

1. In Auth0 Dashboard, go to your Application
2. Click **Connections** tab
3. Click **Try** next to Google and Apple
4. Verify each connection works

#### Test in Your Application

1. Start dev server:
   ```bash
   cd anywheredoor
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/auth/signin`

3. You should see three buttons:
   - **Continue with Google** (white button with Google logo)
   - **Continue with Apple** (black button with Apple logo)
   - **More sign in options** (Auth0 button)

4. Test each button:
   - Click Google → Should redirect to Google login → Sign in → Redirect back
   - Click Apple → Should redirect to Apple login → Sign in → Redirect back
   - Click "More options" → Auth0 Universal Login → Choose provider

## 🔍 Verification

After signing in, verify:

1. ✅ User is redirected to dashboard
2. ✅ User profile shows correct name and email
3. ✅ User profile picture is displayed (if available)
4. ✅ Session persists on page refresh
5. ✅ Sign out works correctly

Check database:
```bash
npx prisma studio
```

Look for:
- User record created
- Account record with provider info
- Session record (if using database sessions)

## 🐛 Troubleshooting

### Google Issues

**"redirect_uri_mismatch"**
- Check redirect URI in Google Console matches exactly:
  ```
  https://dev-dzupe84r4ur0je5r.us.auth0.com/login/callback
  ```
- No trailing slash, verify https

**"access_denied"**
- Add your email as test user in Google Console
- Ensure OAuth consent screen is configured
- Check app is in Testing mode or Published

### Apple Issues

**"invalid_client"**
- Verify Service ID is correct: `com.anywheredoor.web`
- Check .p8 key is properly formatted
- Verify Key ID and Team ID are correct

**"invalid_request"**
- Check return URL matches exactly
- Verify domain is added to Service ID

### Auth0 Issues

**Social connection not showing**
- Verify connection is enabled in Auth0 Dashboard
- Check connection is enabled for your application
- Clear browser cache

**"Configuration error"**
- Check all Auth0 env variables are set correctly
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

### Button Not Working

**Google/Apple button does nothing**
- Check browser console for errors
- Verify Auth0 connection name is correct:
  - Google: `google-oauth2`
  - Apple: `apple`
- Test with "More options" button first

## 📝 Code Changes Made

### 1. Updated `anywheredoor/src/app/auth/signin/page.tsx`

**Added:**
- Google sign-in button with Auth0 connection parameter
- Apple sign-in button with Auth0 connection parameter
- Updated `handleSignIn` to support connection parameter
- Improved UI with better button ordering

**How it works:**
```typescript
// Direct Google login via Auth0
handleSignIn('auth0', 'google-oauth2')

// Direct Apple login via Auth0
handleSignIn('auth0', 'apple')

// Auth0 Universal Login (shows all options)
handleSignIn('auth0')
```

### 2. No Changes Needed to `auth.ts`

The Auth0 provider in `src/lib/auth.ts` already handles all social connections. No code changes needed there!

## 🎨 UI Preview

The signin page now shows:

```
┌─────────────────────────────────────┐
│  Get Started with AnyWhereDoor      │
│  Sign in or create a new account    │
├─────────────────────────────────────┤
│                                     │
│  [G] Continue with Google           │
│                                     │
│  [🍎] Continue with Apple           │
│                                     │
│  ─────── Or continue with ──────    │
│                                     │
│  [Auth0] More sign in options       │
│                                     │
└─────────────────────────────────────┘
```

## 🚀 Next Steps

1. **Configure Google** (Step 1 above)
2. **Configure Apple** (Step 2 above)
3. **Test thoroughly** (Step 3 above)
4. **Update production URLs** when deploying:
   - Update redirect URIs in Google Console
   - Update return URLs in Apple Developer Portal
   - Update Auth0 application URLs

## 📚 Additional Resources

- [Auth0 Social Connections](https://auth0.com/docs/authenticate/identity-providers/social-identity-providers)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)
- [NextAuth.js with Auth0](https://next-auth.js.org/providers/auth0)

## ⚠️ Important Notes

1. **Auth0 handles everything** - You don't need to add Google/Apple providers to NextAuth
2. **Connection names matter** - Use `google-oauth2` and `apple` (not `google` or `apple-signin`)
3. **Test in Auth0 first** - Use the "Try Connection" feature before testing in your app
4. **Redirect URIs must match exactly** - Including protocol (https) and no trailing slashes
5. **Keep credentials secure** - Never commit .env files or .p8 keys to git

## 🎉 Benefits of This Approach

✅ Centralized authentication management in Auth0
✅ Easy to add more providers (Facebook, Twitter, etc.)
✅ Better security with Auth0's infrastructure
✅ Unified user experience
✅ No need to manage multiple OAuth credentials in your app
✅ Built-in features like MFA, anomaly detection, etc.

---

**Status:** Code is ready! Just need to configure Google and Apple in Auth0 Dashboard.

**Time to complete:** ~30 minutes for Google + Apple setup

**Need help?** Check the troubleshooting section or Auth0 documentation.
