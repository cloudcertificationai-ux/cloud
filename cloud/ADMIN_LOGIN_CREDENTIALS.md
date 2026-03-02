# Admin Panel Login Credentials

## Default Admin Account

For quick setup and testing, use these default credentials:

### Login Details

```
Email:    admin@anywheredoor.com
Password: Admin@123456
```

### Admin Panel URL

- **Development**: http://localhost:3001
- **Production**: https://admin.yourdomain.com

## Creating the Admin User

### Option 1: Quick Setup (Default Admin)

Run the default admin creation script:

```bash
cd anywheredoor_admin
npx ts-node scripts/create-default-admin.ts
```

This creates an admin user with the credentials shown above.

### Option 2: Custom Admin User

For custom credentials, use the interactive script:

```bash
cd anywheredoor_admin
npx ts-node scripts/create-admin-user.ts
```

You'll be prompted to enter:
- Email address
- Full name
- Password (min 8 characters)
- Password confirmation

### Option 3: Using npm Script

Add to `package.json` scripts section:

```json
{
  "scripts": {
    "create-admin": "ts-node scripts/create-admin-user.ts",
    "create-default-admin": "ts-node scripts/create-default-admin.ts"
  }
}
```

Then run:

```bash
npm run create-default-admin
```

## First Login Steps

1. Navigate to http://localhost:3001
2. Click "Sign In" or go to `/auth/signin`
3. Enter the email and password
4. You'll be redirected to the admin dashboard

## Security Best Practices

### ⚠️ IMPORTANT

1. **Change Default Password**: Immediately change the default password after first login
2. **Production**: Never use default credentials in production
3. **Unique Accounts**: Create separate admin accounts for each administrator
4. **Strong Passwords**: Use passwords with:
   - Minimum 12 characters
   - Mix of uppercase and lowercase
   - Numbers and special characters
5. **Regular Rotation**: Change passwords every 90 days
6. **2FA**: Consider implementing two-factor authentication

## Changing Your Password

### Via Admin Panel

1. Log in to the admin panel
2. Click on your profile (top right)
3. Select "Account Settings"
4. Navigate to "Security"
5. Click "Change Password"
6. Enter current password and new password
7. Click "Update Password"

### Via Database (Emergency)

If you're locked out, you can reset the password directly:

```bash
cd anywheredoor_admin
npx ts-node scripts/reset-admin-password.ts
```

## Multiple Admin Users

To create additional admin users:

```bash
# Interactive creation
npx ts-node scripts/create-admin-user.ts

# Or use the admin panel
# 1. Log in as admin
# 2. Go to "Users" section
# 3. Click "Create User"
# 4. Set role to "ADMIN"
```

## User Roles

The system supports three roles:

- **ADMIN**: Full access to admin panel and all features
- **INSTRUCTOR**: Can create and manage courses
- **STUDENT**: Can enroll in and take courses

## Troubleshooting

### "Invalid credentials" error

- Verify email is exactly: `admin@anywheredoor.com`
- Check password is: `Admin@123456`
- Ensure the user was created successfully (check database)

### "User not found" error

- Run the create-default-admin script
- Check database connection in `.env`
- Verify Prisma migrations are up to date

### Database connection error

```bash
# Check your DATABASE_URL in .env
# Run migrations
npx prisma migrate dev

# Verify database is running
psql -h localhost -U your_username -d anywheredoor_admin
```

### Script execution error

```bash
# Install dependencies
npm install

# Ensure ts-node is available
npm install -D ts-node typescript

# Run with explicit path
npx ts-node ./scripts/create-default-admin.ts
```

## Environment Variables

Ensure these are set in `anywheredoor_admin/.env`:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/anywheredoor_admin

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars
```

## Production Setup

For production deployments:

1. **Never use default credentials**
2. Create admin users with strong, unique passwords
3. Use environment-specific credentials
4. Enable audit logging
5. Set up IP whitelisting if possible
6. Use HTTPS only
7. Implement rate limiting
8. Enable session timeout
9. Regular security audits

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify database connection
3. Ensure all migrations are applied
4. Check the audit logs for failed login attempts
5. Review the application logs

---

**Last Updated**: February 2026

**Security Notice**: These are development credentials. Always use secure, unique credentials in production environments.
