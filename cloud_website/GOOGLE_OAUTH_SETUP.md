# Google OAuth Setup Guide

## The Problem

You're seeing "Error 401: invalid_client" because your Google OAuth credentials are not configured. The `.env` file has placeholder values:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Solution: Set Up Google OAuth

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (anywheredoor.ai@gmail.com)

### Step 2: Create or Select a Project

1. Click the project dropdown at the top
2. Either:
   - Select an existing project, OR
   - Click **"New Project"**
   - Name it: "Anywheredoor" or similar
   - Click **"Create"**

### Step 3: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and click **"Enable"**

### Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace)
3. Click **"Create"**

4. Fill in the required fields:
   - **App name**: Anywheredoor
   - **User support email**: anywheredoor.ai@gmail.com
   - **Developer contact email**: anywheredoor.ai@gmail.com
   - Click **"Save and Continue"**

5. **Scopes** (click "Add or Remove Scopes"):
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Select: `openid`
   - Click **"Update"** then **"Save and Continue"**

6. **Test users** (for development):
   - Click **"Add Users"**
   - Add: anywheredoor.ai@gmail.com
   - Click **"Save and Continue"**

7. Review and click **"Back to Dashboard"**

### Step 5: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name**: Anywheredoor Web App
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

5. Click **"Create"**

### Step 6: Copy Your Credentials

A popup will show your credentials:
- **Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123xyz789`

**IMPORTANT**: Copy these values!

### Step 7: Update Your .env File

Replace the placeholder values in `anywheredoor/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID="YOUR_ACTUAL_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_ACTUAL_CLIENT_SECRET_HERE"
```

### Step 8: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 9: Test

1. Go to: http://localhost:3000/auth/signin
2. Click **"Sign in with Google"**
3. You should now be redirected to Google's login page
4. Sign in with anywheredoor.ai@gmail.com
5. You'll be redirected back to your app

## For Production

When deploying to production, you'll need to:

1. Add production URLs to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```

2. Add production callback to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. Publish your OAuth consent screen (move from Testing to Production)

## Troubleshooting

### "Access blocked: Authorization Error"

This means you need to add your email as a test user:
1. Go to **OAuth consent screen**
2. Scroll to **Test users**
3. Click **"Add Users"**
4. Add your email address

### "Redirect URI mismatch"

Make sure the redirect URI in Google Cloud Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

Note:
- No trailing slash
- Must be exactly `/api/auth/callback/google`
- Protocol must match (http for localhost)

### Still getting "invalid_client"?

1. Double-check you copied the Client ID and Secret correctly
2. Make sure there are no extra spaces in the .env file
3. Restart your development server
4. Clear your browser cache

## Quick Reference

### Required URLs for Google OAuth

**Development:**
- JavaScript Origin: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

**Production:**
- JavaScript Origin: `https://yourdomain.com`
- Redirect URI: `https://yourdomain.com/api/auth/callback/google`

### Required Scopes

- `openid`
- `userinfo.email`
- `userinfo.profile`

## Alternative: Use Auth0 Instead

If you don't want to set up Google OAuth directly, you can:

1. Use Auth0's social connections
2. In Auth0 Dashboard, go to **Authentication** → **Social**
3. Enable Google and configure it there
4. Users can then sign in with Google through Auth0

This way, you only need Auth0 credentials (which you already have configured).
