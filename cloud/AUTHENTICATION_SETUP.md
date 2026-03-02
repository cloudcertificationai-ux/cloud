# Admin Panel Authentication Setup

## Overview

The admin panel now uses **email/password authentication** instead of Auth0. This provides a simpler, self-contained authentication system that doesn't require external OAuth providers.

## Changes Made

### 1. Authentication Provider
- **Removed**: Auth0, Google OAuth, and Apple Sign In providers
- **Added**: NextAuth CredentialsProvider for email/password authentication

### 2. Database Schema
- Added `password` field to the `User` model (nullable, hashed with bcrypt)
- Migration file created: `prisma/migrations/20260201000000_add_password_field/migration.sql`

### 3. Session Strategy
- Changed from `database` to `jwt` strategy for better performance
- Sessions are now stored in JWT tokens instead of the database

### 4. Sign-In Page
- Updated to show email/password form instead of OAuth buttons
- Improved error handling and user feedback

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd anywheredoor_admin
npm install
```

### Step 2: Update Environment Variables

Update your `.env` file (remove Auth0 variables):

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/anywheredoor_admin
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 3: Run Database Migration

Apply the migration to add the password field:

```bash
npm run migrate
```

### Step 4: Create Admin User

Use the provided script to create your first admin user:

```bash
npm run create-admin
```

Follow the prompts to enter:
- Admin email
- Admin name
- Password (minimum 8 characters)
- Password confirmation

Example:
```
🔐 Admin User Creation Tool

Enter admin email: admin@anywheredoor.com
Enter admin name: Admin User
Enter password (min 8 characters): ********
Confirm password: ********

✅ Admin user created successfully!
```

### Step 5: Start the Application

```bash
npm run dev
```

Visit `http://localhost:3001/auth/signin` and sign in with your credentials.

## Creating Additional Admin Users

### Option 1: Using the Script (Recommended)

```bash
npm run create-admin
```

### Option 2: Manually via Database

```sql
-- Hash your password first using bcrypt with cost factor 12
-- Then insert the user:
INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'newadmin@example.com',
  'New Admin',
  '$2a$12$hashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW(),
  NOW()
);
```

### Option 3: Via Admin Panel (Future Enhancement)

A user management interface can be added to the admin panel to create/manage admin users through the UI.

## Security Features

### Password Hashing
- Passwords are hashed using bcrypt with a cost factor of 12
- Original passwords are never stored in the database

### Role-Based Access Control
- Only users with `role = 'ADMIN'` can sign in to the admin panel
- Role check is performed during authentication

### Audit Logging
- All login attempts are logged in the `AuditLog` table
- Successful logins, failed attempts, and user creation are tracked

### Session Management
- JWT-based sessions with 24-hour expiration
- Secure session tokens with NEXTAUTH_SECRET

## Troubleshooting

### "Invalid email or password" Error
- Verify the email and password are correct
- Check that the user exists in the database
- Ensure the password was hashed correctly

### "Access denied. Admin privileges required."
- Verify the user's role is set to 'ADMIN' in the database
- Check: `SELECT email, role FROM "User" WHERE email = 'your@email.com';`

### Migration Issues
- If migration fails, check your database connection
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct

### Cannot Create Admin User
- Check database connection
- Ensure the email doesn't already exist
- Verify bcryptjs is installed: `npm list bcryptjs`

## Migration from Auth0

If you were previously using Auth0:

1. **Export existing admin users** from your database
2. **Run the migration** to add the password field
3. **Set passwords** for existing admin users using the create-admin script or by updating the database directly
4. **Update .env** to remove Auth0 variables
5. **Restart the application**

## API Changes

### Authentication Endpoint
- Endpoint: `/api/auth/callback/credentials`
- Method: POST
- Body: `{ email, password }`

### Session Endpoint
- Endpoint: `/api/auth/session`
- Method: GET
- Returns: Current user session with JWT

## Next Steps

Consider implementing:
- Password reset functionality
- Email verification for new users
- Two-factor authentication (2FA)
- Password strength requirements
- Account lockout after failed attempts
- User management UI in admin panel

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the NextAuth.js documentation: https://next-auth.js.org
3. Check application logs for detailed error messages
