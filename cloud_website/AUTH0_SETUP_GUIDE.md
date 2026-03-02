# Auth0 Configuration Guide

This guide walks you through setting up Auth0 with Google and Apple social login providers for the anywheredoor application.

## Prerequisites

- An Auth0 account (sign up at https://auth0.com if you don't have one)
- Google Cloud Console account (for Google OAuth)
- Apple Developer account (for Apple Sign In)

## Step 1: Create Auth0 Tenant

1. Go to https://auth0.com and sign in
2. If this is your first time, you'll be prompted to create a tenant
3. Choose a tenant domain (e.g., `anywheredoor.auth0.com` or `anywheredoor-dev.auth0.com`)
4. Select your region (choose closest to your users)
5. Click "Create"

## Step 2: Create Auth0 Application

1. In the Auth0 Dashboard, navigate to **Applications** → **Applications**
2. Click **Create Application**
3. Enter application name: `Anywheredoor Main App`
4. Select application type: **Regular Web Application**
5. Click **Create**

## Step 3: Configure Application Settings

1. In your application settings, scroll to **Application URIs**
2. Set the following URLs:

   **Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback/auth0
   https://yourdomain.com/api/auth/callback/auth0
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```

   **Allowed Web Origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```

3. Scroll down and click **Save Changes**

## Step 4: Get Auth0 Credentials

1. In the application settings, find the **Basic Information** section
2. Copy the following values:
   - **Domain** (e.g., `anywheredoor.auth0.com`)
   - **Client ID**
   - **Client Secret**

3. Update your `.env` file:
   ```env
   AUTH0_CLIENT_ID="your-client-id-here"
   AUTH0_CLIENT_SECRET="your-client-secret-here"
   AUTH0_ISSUER="https://your-domain.auth0.com"
   ```

## Step 5: Configure Google OAuth Provider

### 5.1: Set up Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Anywheredoor`
   - User support email: your email
   - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Anywheredoor Auth0`
   - Authorized redirect URIs: `https://your-domain.auth0.com/login/callback`
7. Copy the **Client ID** and **Client Secret**

### 5.2: Add Google to Auth0

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click on **Google**
3. Toggle **Enable** to ON
4. Enter your Google **Client ID** and **Client Secret**
5. In **Attributes**, ensure these are selected:
   - Basic Profile
   - Email Address
6. Click **Save Changes**

### 5.3: Update .env with Google Credentials

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Step 6: Configure Apple Sign In Provider

### 6.1: Set up Apple Developer Account

1. Go to https://developer.apple.com
2. Sign in with your Apple ID
3. Navigate to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** → **+** (Add button)
5. Select **App IDs** → **Continue**
6. Select **App** → **Continue**
7. Configure your App ID:
   - Description: `Anywheredoor`
   - Bundle ID: `com.anywheredoor.app` (or your domain)
   - Capabilities: Check **Sign In with Apple**
8. Click **Continue** → **Register**

### 6.2: Create Service ID

1. Click **Identifiers** → **+** (Add button)
2. Select **Services IDs** → **Continue**
3. Configure Service ID:
   - Description: `Anywheredoor Web`
   - Identifier: `com.anywheredoor.web`
   - Check **Sign In with Apple**
4. Click **Configure** next to Sign In with Apple
5. Add domains and return URLs:
   - Primary App ID: Select your App ID from step 6.1
   - Domains: `your-domain.auth0.com`
   - Return URLs: `https://your-domain.auth0.com/login/callback`
6. Click **Save** → **Continue** → **Register**

### 6.3: Create Private Key

1. Click **Keys** → **+** (Add button)
2. Key Name: `Anywheredoor Auth Key`
3. Check **Sign In with Apple**
4. Click **Configure** → Select your Primary App ID
5. Click **Save** → **Continue** → **Register**
6. **Download the key file** (.p8 file) - you can only download this once!
7. Note the **Key ID** shown on the page

### 6.4: Add Apple to Auth0

1. In Auth0 Dashboard, go to **Authentication** → **Social**
2. Click on **Apple**
3. Toggle **Enable** to ON
4. Enter the following:
   - **Client ID**: Your Service ID (e.g., `com.anywheredoor.web`)
   - **Client Secret Signing Key**: Paste the contents of your .p8 file
   - **Key ID**: The Key ID from step 6.3
   - **Apple Team ID**: Found in your Apple Developer account (top right)
5. Click **Save Changes**

### 6.5: Update .env with Apple Credentials

```env
APPLE_ID="com.anywheredoor.web"
APPLE_SECRET="-----BEGIN PRIVATE KEY-----\nYour key content here\n-----END PRIVATE KEY-----"
```

## Step 7: Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Update your `.env`:
```env
NEXTAUTH_SECRET="generated-secret-here"
```

## Step 8: Test Configuration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/api/auth/signin`
3. You should see login options for Google and Apple
4. Test each provider to ensure they work correctly

## Troubleshooting

### Google OAuth Issues

- **Error: redirect_uri_mismatch**
  - Ensure the redirect URI in Google Console matches exactly: `https://your-domain.auth0.com/login/callback`
  - Check for trailing slashes or http vs https

- **Error: access_denied**
  - Add your email as a test user in Google Console OAuth consent screen
  - Ensure the app is in "Testing" mode or published

### Apple Sign In Issues

- **Error: invalid_client**
  - Verify your Service ID is correct
  - Ensure the private key (.p8) is properly formatted
  - Check that the Key ID and Team ID are correct

- **Error: invalid_request**
  - Verify the return URL matches exactly: `https://your-domain.auth0.com/login/callback`
  - Ensure your domain is added to the Service ID configuration

### Auth0 Issues

- **Error: Callback URL mismatch**
  - Add `http://localhost:3000/api/auth/callback/auth0` to Allowed Callback URLs
  - Ensure there are no typos or extra spaces

- **Error: Invalid state**
  - Clear browser cookies and try again
  - Ensure NEXTAUTH_SECRET is set and consistent

## Security Best Practices

1. **Never commit secrets to version control**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Use different Auth0 tenants for dev/staging/production**
   - Create separate tenants for each environment
   - Use different credentials for each

3. **Rotate secrets regularly**
   - Change Auth0 client secrets periodically
   - Regenerate NextAuth secret if compromised

4. **Enable MFA for Auth0 dashboard**
   - Protect your Auth0 account with multi-factor authentication

5. **Monitor Auth0 logs**
   - Check for suspicious login attempts
   - Set up alerts for failed authentications

## Next Steps

Once Auth0 is configured:
1. ✅ Task 2.1 Complete - Auth0 configured with Google and Apple
2. ➡️ Task 2.2 - Install and configure NextAuth.js in main application
3. ➡️ Task 2.3 - Write property tests for Auth0 profile extraction
4. ➡️ Task 2.4 - Write property tests for user record upsert idempotence

## Support Resources

- Auth0 Documentation: https://auth0.com/docs
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Apple Sign In Documentation: https://developer.apple.com/sign-in-with-apple/
- NextAuth.js Documentation: https://next-auth.js.org/
