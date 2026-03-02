# Enable Google & Apple Login via Auth0

This guide will help you enable Google and Apple login through Auth0 social connections. This is the recommended approach as it centralizes authentication management.

## Current Status

✅ Auth0 is configured and working
❌ Google and Apple social connections need to be enabled in Auth0
❌ Frontend buttons are commented out

## Why Use Auth0 Social Connections?

Instead of configuring Google and Apple OAuth directly in NextAuth, we use Auth0's social connections:

- ✅ Centralized authentication management
- ✅ Easier to add/remove providers
- ✅ Better security and compliance
- ✅ Unified user experience
- ✅ No need to manage multiple OAuth credentials in your app

## Step-by-Step Setup

### Step 1: Enable Google Social Connection in Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Authentication** → **Social**
3. Find **Google** and click on it
4. Toggle **Enable** to ON
5. You'll need Google OAuth credentials:

#### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: `AnyWhereDoor`
   - User support email: your email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `AnyWhereDoor Auth0`
   - **Authorized redirect URIs**: `https://YOUR-AUTH0-DOMAIN.auth0.com/login/callback`
     - Replace `YOUR-AUTH0-DOMAIN` with your actual Auth0 domain (e.g., `dev-dzupe84r4ur0je5r.us.auth0.com`)
7. Copy the **Client ID** and **Client Secret**

#### Configure in Auth0:

1. Back in Auth0, paste your Google **Client ID** and **Client Secret**
2. In **Attributes**, ensure these are selected:
   - ✅ Basic Profile
   - ✅ Email Address
3. In **Permissions**, ensure:
   - ✅ Email
   - ✅ Profile
4. Click **Save Changes**

### Step 2: Enable Apple Social Connection in Auth0

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Find **Apple** and click on it
3. Toggle **Enable** to ON
4. You'll need Apple Developer credentials:

#### Get Apple Sign In Credentials:

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**

#### Create App ID:
1. Click **Identifiers** → **+** (Add)
2. Select **App IDs** → **Continue**
3. Select **App** → **Continue**
4. Configure:
   - Description: `AnyWhereDoor`
   - Bundle ID: `com.anywheredoor.app` (or your domain)
   - Capabilities: Check **Sign In with Apple**
5. Click **Continue** → **Register**

#### Create Service ID:
1. Click **Identifiers** → **+** (Add)
2. Select **Services IDs** → **Continue**
3. Configure:
   - Description: `AnyWhereDoor Web`
   - Identifier: `com.anywheredoor.web`
   - Check **Sign In with Apple**
4. Click **Configure** next to Sign In with Apple
5. Add:
   - Primary App ID: Select your App ID from above
   - Domains: `YOUR-AUTH0-DOMAIN.auth0.com`
   - Return URLs: `https://YOUR-AUTH0-DOMAIN.auth0.com/login/callback`
6. Click **Save** → **Continue** → **Register**

#### Create Private Key:
1. Click **Keys** → **+** (Add)
2. Key Name: `AnyWhereDoor Auth Key`
3. Check **Sign In with Apple**
4. Click **Configure** → Select your Primary App ID
5. Click **Save** → **Continue** → **Register**
6. **Download the .p8 key file** (you can only download once!)
7. Note the **Key ID**

#### Configure in Auth0:
1. Back in Auth0, enter:
   - **Client ID**: Your Service ID (e.g., `com.anywheredoor.web`)
   - **Client Secret Signing Key**: Paste contents of your .p8 file
   - **Key ID**: The Key ID from above
   - **Apple Team ID**: Found in Apple Developer account (top right)
2. Click **Save Changes**

### Step 3: Test Social Connections in Auth0

1. In Auth0 Dashboard, go to your Application
2. Click **Connections** tab
3. Ensure **Google** and **Apple** are enabled for your application
4. Click **Try Connection** to test each one

### Step 4: Update Your Application Code

The code changes are minimal since Auth0 handles everything:

1. The signin page already has the UI ready (just commented out)
2. No changes needed to `auth.ts` - Auth0 provider handles all social logins
3. Just need to update the frontend to show the buttons

### Step 5: Verify Configuration

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click "Continue with Auth0"
4. You should see Google and Apple as login options in the Auth0 Universal Login page

## How It Works

```
User clicks "Continue with Auth0"
    ↓
Auth0 Universal Login page shows
    ↓
User selects Google or Apple
    ↓
Auth0 handles OAuth flow
    ↓
User redirected back to your app
    ↓
NextAuth creates session
```

## Troubleshooting

### Google Issues

**Error: redirect_uri_mismatch**
- Ensure redirect URI in Google Console is exactly: `https://YOUR-AUTH0-DOMAIN.auth0.com/login/callback`
- No trailing slashes, check http vs https

**Error: access_denied**
- Add your email as test user in Google Console
- Ensure app is in "Testing" mode or published

### Apple Issues

**Error: invalid_client**
- Verify Service ID is correct
- Check private key (.p8) is properly formatted
- Verify Key ID and Team ID

**Error: invalid_request**
- Verify return URL matches exactly
- Ensure domain is added to Service ID configuration

### Auth0 Issues

**Social connection not showing**
- Check connection is enabled in Auth0 Dashboard
- Verify connection is enabled for your specific application
- Clear browser cache and try again

## Alternative: Show Social Buttons Directly

If you want to show Google and Apple buttons directly on your signin page (instead of going through Auth0 Universal Login), you can:

1. Enable the social connections in Auth0 (steps above)
2. Uncomment the Google and Apple buttons in the signin page
3. Update the `handleSignIn` function to use Auth0 with connection parameter

This will be implemented in the next step if you prefer this approach.

## Current Auth0 Configuration

Based on your `.env` file:
- Domain: `dev-dzupe84r4ur0je5r.us.auth0.com`
- Client ID: `4RxmAC5Ljo1xmxYTtAIu6cIiFccYbosu`

Use this domain when setting up Google and Apple redirect URIs:
```
https://dev-dzupe84r4ur0je5r.us.auth0.com/login/callback
```

## Next Steps

1. ✅ Follow Step 1 to enable Google in Auth0
2. ✅ Follow Step 2 to enable Apple in Auth0
3. ✅ Test the connections in Auth0 Dashboard
4. ✅ Let me know when ready, and I'll update the frontend code

Once you've completed the Auth0 configuration, I can update the code to show the social login buttons!
