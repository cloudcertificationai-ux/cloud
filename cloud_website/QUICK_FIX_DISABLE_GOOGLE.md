# Quick Fix: Disable Google OAuth (Use Auth0 Only)

If you want to use Auth0 only and disable Google OAuth temporarily, follow these steps:

## Option 1: Comment Out Google Provider (Recommended for Testing)

Edit `anywheredoor/src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Temporarily disable Google OAuth
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       prompt: 'consent',
    //       access_type: 'offline',
    //       response_type: 'code'
    //     }
    //   }
    // }),
    
    // Keep Auth0 enabled
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
    }),
    
    // Also disable Apple if not configured
    // AppleProvider({
    //   clientId: process.env.APPLE_ID!,
    //   clientSecret: process.env.APPLE_SECRET!,
    // }),
  ],
  // ... rest of config
}
```

## Option 2: Set Dummy Values (Not Recommended)

Add dummy values to `.env` to prevent errors:

```env
# Google OAuth (dummy values - won't work but prevents errors)
GOOGLE_CLIENT_ID="dummy-client-id"
GOOGLE_CLIENT_SECRET="dummy-client-secret"
```

**Note**: This will still show the Google button but it won't work.

## Option 3: Use Auth0 with Google Social Connection

Instead of direct Google OAuth, use Auth0's Google connection:

1. Go to Auth0 Dashboard: https://manage.auth0.com/
2. Navigate to **Authentication** → **Social**
3. Click on **Google**
4. Click **"Create Connection"** or **"Enable"**
5. You'll need to provide Google OAuth credentials here
6. Once enabled, users can sign in with Google through Auth0

This is actually the **recommended approach** because:
- ✅ Single authentication provider (Auth0)
- ✅ Centralized user management
- ✅ Easier to manage multiple social logins
- ✅ Better security and monitoring

## After Making Changes

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test with Auth0:
   - Go to: http://localhost:3000/auth/signin
   - You should only see the Auth0 button (if you commented out Google)
   - Click it and sign in

## Recommended Next Steps

1. **For now**: Comment out Google and Apple providers in `auth.ts`
2. **Use Auth0**: Configure Google as a social connection in Auth0
3. **Later**: If you need direct Google OAuth, follow `GOOGLE_OAUTH_SETUP.md`

## Which Approach Should You Use?

### Use Auth0 with Social Connections if:
- ✅ You want centralized authentication
- ✅ You want to add multiple social logins easily
- ✅ You want better user management and analytics
- ✅ You're building an enterprise application

### Use Direct Google OAuth if:
- You need specific Google API access beyond authentication
- You want to minimize third-party dependencies
- You have specific Google Workspace integration needs

**For most applications, Auth0 with social connections is the better choice.**
