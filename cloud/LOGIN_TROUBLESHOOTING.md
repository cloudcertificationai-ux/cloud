# Login Troubleshooting Guide

## ✅ Admin User Created Successfully!

Your admin user has been created and is ready to use.

## 🔐 Login Credentials

```
Email:    admin@anywheredoor.com
Password: Admin@123456
URL:      http://localhost:3001
```

## 🔍 Common Login Issues & Solutions

### Issue 1: "Invalid email or password"

**Possible Causes:**
1. Admin user not created yet
2. Typo in email or password
3. Database connection issue
4. Password hash mismatch

**Solutions:**

1. **Verify admin user exists:**
   ```bash
   npm run list-admins
   ```
   You should see `admin@anywheredoor.com` in the list.

2. **Check credentials exactly:**
   - Email: `admin@anywheredoor.com` (all lowercase)
   - Password: `Admin@123456` (case-sensitive, includes @ symbol)

3. **Reset password if needed:**
   ```bash
   npm run reset-password
   # Enter: admin@anywheredoor.com
   # Set new password
   ```

4. **Recreate admin user:**
   ```bash
   # First, check if user exists
   npm run list-admins
   
   # If exists, reset password instead
   npm run reset-password
   
   # If doesn't exist, create it
   npm run create-default-admin
   ```

### Issue 2: JWEDecryptionFailed Error

**Cause:** NextAuth secret mismatch or corruption

**Solution:**

1. **Check NEXTAUTH_SECRET in .env:**
   ```bash
   # Should be a long random string (32+ characters)
   NEXTAUTH_SECRET="vEW4eom1J8lkSBwyM/qJsKrw7yIJNDAfkI3i2K50T6o="
   ```

2. **Generate new secret if needed:**
   ```bash
   openssl rand -base64 32
   ```
   
3. **Update .env with new secret:**
   ```env
   NEXTAUTH_SECRET="your-new-secret-here"
   ```

4. **Restart the dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Clear browser cookies:**
   - Open DevTools (F12)
   - Application tab → Cookies
   - Delete all cookies for localhost:3001
   - Try logging in again

### Issue 3: Database Connection Error

**Symptoms:**
- "Can't reach database server"
- Connection timeout
- SSL/TLS errors

**Solutions:**

1. **Check DATABASE_URL in .env:**
   ```bash
   # Should point to your Neon database
   DATABASE_URL="postgresql://..."
   DIRECT_DATABASE_URL="postgresql://..."
   ```

2. **Test database connection:**
   ```bash
   npx prisma db pull
   ```

3. **Verify database is accessible:**
   - Check Neon dashboard
   - Ensure database is not paused
   - Check network connectivity

### Issue 4: "Access denied. Admin privileges required"

**Cause:** User exists but doesn't have ADMIN role

**Solution:**

1. **Check user role:**
   ```bash
   npm run list-admins
   ```

2. **If user is not ADMIN, update via database:**
   ```bash
   npx prisma studio
   # Navigate to User table
   # Find the user
   # Change role to "ADMIN"
   # Save
   ```

### Issue 5: Session/Cookie Issues

**Symptoms:**
- Logged in but immediately logged out
- Session not persisting
- Redirect loops

**Solutions:**

1. **Clear all browser data:**
   - Clear cookies for localhost:3001
   - Clear local storage
   - Clear session storage

2. **Try incognito/private window:**
   ```
   Open new incognito window
   Navigate to http://localhost:3001
   Try logging in
   ```

3. **Check NEXTAUTH_URL:**
   ```env
   NEXTAUTH_URL="http://localhost:3001"
   ```
   Must match exactly (no trailing slash)

4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## 🧪 Testing Login

### Step-by-Step Test

1. **Verify admin user exists:**
   ```bash
   npm run list-admins
   ```
   Expected: Shows admin@anywheredoor.com

2. **Start dev server:**
   ```bash
   npm run dev
   ```
   Expected: Server starts on port 3001

3. **Open browser:**
   ```
   http://localhost:3001
   ```

4. **Navigate to sign in:**
   ```
   Click "Sign In" or go to:
   http://localhost:3001/auth/signin
   ```

5. **Enter credentials:**
   ```
   Email: admin@anywheredoor.com
   Password: Admin@123456
   ```

6. **Submit form:**
   - Should redirect to dashboard
   - Should see admin interface

### Verify Successful Login

After logging in, you should see:
- Admin dashboard
- Navigation menu
- User profile in top right
- No error messages

Check browser console (F12) for any errors.

## 🔧 Advanced Troubleshooting

### Check Database Directly

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to User table
# Find admin@anywheredoor.com
# Verify:
# - role = "ADMIN"
# - password field is not null
# - emailVerified is set
```

### Check Application Logs

Look for errors in terminal where `npm run dev` is running:
- Database connection errors
- Authentication errors
- Session errors

### Check Browser Console

Open DevTools (F12) → Console tab:
- Look for JavaScript errors
- Check network tab for failed requests
- Verify cookies are being set

### Test Password Hash

```bash
# Create a test script to verify password
node -e "
const bcrypt = require('bcryptjs');
const hash = 'YOUR_HASH_FROM_DATABASE';
const password = 'Admin@123456';
bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
});
"
```

## 📝 Quick Commands Reference

```bash
# User Management
npm run create-default-admin   # Create default admin
npm run create-admin           # Create custom admin
npm run list-admins            # List all admins
npm run reset-password         # Reset password

# Development
npm run dev                    # Start dev server
npm run migrate                # Run migrations

# Database
npx prisma studio              # Open database GUI
npx prisma db pull             # Test connection
npx prisma generate            # Regenerate client
```

## 🆘 Still Having Issues?

### Checklist

- [ ] Admin user exists (verified with `npm run list-admins`)
- [ ] Using exact credentials (case-sensitive)
- [ ] Database is accessible
- [ ] NEXTAUTH_SECRET is set in .env
- [ ] NEXTAUTH_URL matches server URL
- [ ] Dev server is running
- [ ] Browser cookies cleared
- [ ] No errors in terminal
- [ ] No errors in browser console

### Last Resort: Fresh Start

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear browser data
# - Clear all cookies for localhost:3001
# - Clear local storage
# - Clear session storage

# 3. Reset admin user
npm run reset-password
# Enter: admin@anywheredoor.com
# Set password: Admin@123456

# 4. Restart server
npm run dev

# 5. Try login in incognito window
```

## ✅ Success Indicators

When login works correctly, you'll see:

1. **Terminal logs:**
   ```
   prisma:query SELECT ... FROM "User" WHERE email = ...
   POST /api/auth/callback/credentials 200
   ```

2. **Browser:**
   - Redirects to /admin or dashboard
   - Shows admin interface
   - Profile icon in top right

3. **Database:**
   - lastLoginAt updated for user
   - New audit log entry created

## 📞 Need More Help?

1. Check `ADMIN_LOGIN_CREDENTIALS.md` for detailed setup
2. Review `ADMIN_QUICK_REFERENCE.md` for commands
3. Check application logs for specific errors
4. Verify all environment variables are set

---

**Current Status:** ✅ Admin user created and ready to use!

**Credentials:**
- Email: admin@anywheredoor.com
- Password: Admin@123456
- URL: http://localhost:3001
