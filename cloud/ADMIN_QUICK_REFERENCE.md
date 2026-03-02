# Admin Panel Quick Reference

## 🔐 Default Login Credentials

```
Email:    admin@anywheredoor.com
Password: Admin@123456
URL:      http://localhost:3001
```

⚠️ **Change password after first login!**

## 🚀 Quick Start

```bash
# 1. Create default admin user
cd anywheredoor_admin
npm run create-default-admin

# 2. Start the admin panel
npm run dev

# 3. Open browser
# Navigate to http://localhost:3001
```

## 📝 Admin User Management Commands

```bash
# Create default admin (quick setup)
npm run create-default-admin

# Create custom admin (interactive)
npm run create-admin

# List all admin users
npm run list-admins

# Reset admin password
npm run reset-password

# Run database migrations
npm run migrate
```

## 🔧 Common Tasks

### First Time Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run migrations**
   ```bash
   npm run migrate
   ```

4. **Create admin user**
   ```bash
   npm run create-default-admin
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Creating Additional Admins

```bash
# Interactive creation
npm run create-admin

# Follow the prompts:
# - Enter email
# - Enter name
# - Enter password (min 8 chars)
# - Confirm password
```

### Resetting a Password

```bash
npm run reset-password

# Follow the prompts:
# - Enter admin email
# - Enter new password
# - Confirm new password
```

### Listing All Admins

```bash
npm run list-admins

# Shows:
# - Email
# - Name
# - ID
# - Created date
# - Last login
# - Email verification status
```

## 🗄️ Database Commands

```bash
# Run migrations
npm run migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## 🔍 Troubleshooting

### Can't login?

1. Check credentials are correct
2. Verify user exists: `npm run list-admins`
3. Check database connection in `.env`
4. Reset password: `npm run reset-password`

### Database connection error?

```bash
# Check DATABASE_URL in .env
# Format: postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL

# Run migrations
npm run migrate
```

### Script won't run?

```bash
# Install dependencies
npm install

# Try with npx
npx ts-node scripts/create-default-admin.ts
```

## 📚 File Locations

```
anywheredoor_admin/
├── .env                              # Environment variables
├── ADMIN_LOGIN_CREDENTIALS.md       # Detailed credentials guide
├── scripts/
│   ├── create-default-admin.ts      # Quick admin creation
│   ├── create-admin-user.ts         # Interactive admin creation
│   ├── list-admin-users.ts          # List all admins
│   └── reset-admin-password.ts      # Password reset
└── src/
    └── app/
        └── auth/
            └── signin/              # Login page
```

## 🌐 URLs

- **Admin Panel**: http://localhost:3001
- **Sign In**: http://localhost:3001/auth/signin
- **Dashboard**: http://localhost:3001/admin
- **Student App**: http://localhost:3000

## 🔑 User Roles

- **ADMIN**: Full access to admin panel
- **INSTRUCTOR**: Can create/manage courses
- **STUDENT**: Can enroll in courses

## 📊 Admin Panel Features

- ✅ Course management (CRUD)
- ✅ Curriculum builder (drag-and-drop)
- ✅ Media upload (R2)
- ✅ Student management
- ✅ Enrollment tracking
- ✅ Analytics dashboard
- ✅ Audit logging
- ✅ User management

## 🔒 Security Checklist

- [ ] Change default password
- [ ] Use strong passwords (12+ chars)
- [ ] Enable HTTPS in production
- [ ] Set up IP whitelisting
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Regular password rotation
- [ ] Unique admin accounts per person

## 📞 Need Help?

1. Check `ADMIN_LOGIN_CREDENTIALS.md` for detailed guide
2. Review error messages in console
3. Check application logs
4. Verify database connection
5. Ensure migrations are up to date

---

**Quick Access**: Save this file for easy reference!
