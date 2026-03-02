# Fix: OAuthAccountNotLinked Error

## Problem

When users sign in with Google via Auth0, they see the error:
```
OAuthAccountNotLinked - An account with this email already exists
```

Even though the authentication was successful and the user was created in the database.

## Root Cause

The issue occurs because:

1. User authenticates successfully with Auth0/Google ✅
2. NextAuth Prisma adapter creates the User record ✅  
3. NextAuth tries to create the Account record (linking provider to user)
4. If an Account with the same email exists from a previous attempt, it fails ❌
5. NextAuth shows `OAuthAccountNotLinked` error

The `allowDangerousEmailAccountLinking` option was removed in newer NextAuth versions, so we need a custom solution.

## Solution Implemented

### 1. Custom Prisma Adapter

Created a custom adapter that wraps the standard Prisma adapter and handles account linking gracefully:

```typescript
function CustomPrismaAdapter(p: typeof prisma): Adapter {
  const baseAdapter = PrismaAdapter(p)
  
  return {
    ...baseAdapter,
    async linkAccount(account) {
      try {
        // Try to link the account
        return await p.account.create({ data: account })
      } catch (error: any) {
        // If account already exists (P2002 = unique constraint violation)
        if (error.code === 'P2002') {
          // Fetch and return the existing account
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
    },
  }
}
```

### 2. Simplified SignIn Callback

Removed the complex upsert logic that was causing conflicts. The Prisma adapter now handles user/account creation automatically.

## How to Fix Existing Users

If you have users stuck with this error, run this cleanup script:

```bash
cd anywheredoor
npx tsx scripts/fix-oauth-accounts.ts
```

Or manually in Prisma Studio:

1. Open Prisma Studio: `npx prisma studio`
2. Go to the `Account` table
3. Find duplicate accounts for the same user
4. Delete the older/broken account records
5. Keep only one account per provider per user

## Testing the Fix

1. Clear your browser cookies for localhost:3000
2. Start the dev server: `npm run dev`
3. Go to http://localhost:3000/auth/signin
4. Click "Continue with Google"
5. Sign in with Google
6. You should be redirected to the dashboard ✅

## What Changed

### Before:
- User signs in → Account creation fails → Error shown
- `allowDangerousEmailAccountLinking` doesn't work in NextAuth 4.24+

### After:
- User signs in → Account creation attempted
- If account exists → Fetch existing account → Continue
- If account doesn't exist → Create new account → Continue
- No error shown ✅

## Verification

Check the logs when signing in. You should see:

```
=== SignIn Callback START ===
User: user@example.com Provider: auth0
Existing user found: Yes
Account already linked: true
=== SignIn Callback END ===
```

And the user should be redirected to the dashboard without errors.

## Database Schema

The Account table has a unique constraint:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  // ... other fields
  
  @@unique([provider, providerAccountId])
}
```

This ensures one account per provider per user. Our custom adapter respects this constraint.

## Additional Notes

- This fix works for all OAuth providers (Google, Apple, GitHub, etc.)
- The custom adapter is backward compatible
- Existing users are not affected
- New users will work seamlessly
- Account linking is now automatic and error-free

## Rollback

If you need to rollback to the standard adapter:

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // ... rest of config
}
```

But you'll need to handle the OAuthAccountNotLinked error manually.
