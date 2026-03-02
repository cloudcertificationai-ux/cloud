# Quick Start Guide - Admin Panel Authentication

## 🚀 Get Started in 4 Steps

### 1️⃣ Install Dependencies
```bash
cd anywheredoor_admin
npm install
```

### 2️⃣ Configure Environment
Create `.env` file (copy from `.env.example`):
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here-min-32-chars
DATABASE_URL=postgresql://user:pass@localhost:5432/anywheredoor_admin
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 3️⃣ Setup Database
```bash
# Run migration to add password field
npm run migrate
```

### 4️⃣ Create Admin User
```bash
npm run create-admin
```

Follow the prompts:
```
Enter admin email: admin@example.com
Enter admin name: Admin User
Enter password (min 8 characters): ********
Confirm password: ********
```

## ✅ You're Ready!

Start the application:
```bash
npm run dev
```

Visit: http://localhost:3001/auth/signin

Sign in with your credentials!

## 📚 Need More Help?

- **Full Setup Guide**: See `AUTHENTICATION_SETUP.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **Troubleshooting**: Check the docs above

## 🔑 Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run create-admin` | Create new admin user |
| `npm run migrate` | Run database migrations |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## 🛡️ Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- Only ADMIN role users can sign in
- Sessions expire after 24 hours
- All auth events are logged in audit logs

## ❓ Common Issues

**"Invalid email or password"**
- Check credentials are correct
- Verify user exists: `SELECT * FROM "User" WHERE email = 'your@email.com';`

**"Access denied"**
- Ensure user role is 'ADMIN'
- Check: `SELECT email, role FROM "User";`

**Migration fails**
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

## 🎯 What Changed from Auth0?

- ❌ Removed: Auth0, Google, Apple OAuth
- ✅ Added: Email/password authentication
- ✅ Simpler: No external dependencies
- ✅ Faster: JWT sessions (no DB lookups)
- ✅ Secure: Bcrypt password hashing

## 📞 Support

Need help? Check the detailed documentation:
- `AUTHENTICATION_SETUP.md` - Complete setup guide
- `MIGRATION_SUMMARY.md` - What changed and why
