# Admin User Credentials

## Default Admin Account

**Email:** admin@anywheredoor.com  
**Password:** Admin@123456

## Sign In URL

- **Local Development:** http://localhost:3001/auth/signin
- **Production:** Update NEXTAUTH_URL in .env file

## Creating Additional Admin Users

To create more admin users, run:

```bash
cd anywheredoor_admin
node scripts/create-admin-simple.js
```

You can modify the script to create users with different credentials.

## Security Notes

1. **Change the default password** after first login
2. Store credentials securely (use a password manager)
3. Never commit credentials to version control
4. Use strong, unique passwords for production environments
5. Enable 2FA if available in production

## User Roles

The system supports three roles:
- **ADMIN** - Full access to admin panel
- **INSTRUCTOR** - Can manage courses
- **STUDENT** - Regular user access

## Troubleshooting

If you can't sign in:
1. Verify the database connection in `.env`
2. Check that the user exists: `npx prisma studio`
3. Re-run the creation script to reset the password
4. Check the audit logs for any issues

## Next Steps

1. Sign in to the admin panel
2. Change your password
3. Create additional admin users if needed
4. Configure API keys for main app integration
