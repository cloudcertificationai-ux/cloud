# Database Migration Guide - Country Code Field

## 🎯 What Changed

Added `countryCode` field to `ContactSubmission` table in both databases.

## 📋 Migration Steps

### 1. Cloud Website Database

```bash
cd /Users/dragoax/yash/cloud/cloud_website

# Run migration
npx prisma migrate dev --name add_country_code

# Generate Prisma client
npx prisma generate

# Verify migration
npx prisma studio
```

### 2. Cloud Admin Database

```bash
cd /Users/dragoax/yash/cloud/cloud

# Run migration
npx prisma migrate dev --name add_country_code

# Generate Prisma client
npx prisma generate

# Verify migration
npx prisma studio
```

## 🔍 Verify Migration

### Check Database
```sql
-- Connect to your database and run:
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'ContactSubmission' 
AND column_name = 'countryCode';

-- Should return:
-- column_name  | data_type | column_default
-- countryCode  | text      | '+91'
```

### Test Insert
```sql
-- Test inserting a record
INSERT INTO "ContactSubmission" (
  id, name, email, phone, countryCode, subject, message, status
) VALUES (
  'test123', 'Test User', 'test@example.com', 
  '+1 5551234567', '+1', 'Free Demo Request', 
  'Test message', 'NEW'
);

-- Verify
SELECT name, phone, countryCode FROM "ContactSubmission" WHERE id = 'test123';
```

## ⚠️ Important Notes

### Existing Data
- Existing records will have `countryCode = '+91'` (default)
- No data loss
- All existing phone numbers remain unchanged

### New Records
- Must include `countryCode` field
- Validated by API
- Stored with phone number

## 🔄 Rollback (If Needed)

If you need to rollback:

```bash
# Cloud Website
cd cloud_website
npx prisma migrate resolve --rolled-back add_country_code

# Cloud Admin
cd cloud
npx prisma migrate resolve --rolled-back add_country_code
```

Then manually remove the column:
```sql
ALTER TABLE "ContactSubmission" DROP COLUMN "countryCode";
```

## ✅ Verification Checklist

- [ ] Migration ran successfully (cloud_website)
- [ ] Migration ran successfully (cloud)
- [ ] Prisma client generated (cloud_website)
- [ ] Prisma client generated (cloud)
- [ ] Column exists in database
- [ ] Default value is '+91'
- [ ] Can insert new records
- [ ] Popup shows country dropdown
- [ ] Form submits successfully
- [ ] Data appears in admin panel

## 🚀 After Migration

1. **Restart Development Servers**
   ```bash
   # Cloud Website
   cd cloud_website
   npm run dev
   
   # Cloud Admin
   cd cloud
   npm run dev
   ```

2. **Test the Flow**
   - Open website homepage
   - Wait for popup
   - Select country code
   - Fill form
   - Submit
   - Check admin panel

3. **Verify Data**
   - Login to admin panel
   - Go to Demo Requests
   - Check phone numbers show country codes
   - Verify new field displays

## 📊 Database Schema

### Before
```sql
CREATE TABLE "ContactSubmission" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  interestedCourse TEXT,
  status TEXT DEFAULT 'NEW',
  notes TEXT,
  respondedAt TIMESTAMP,
  respondedBy TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### After
```sql
CREATE TABLE "ContactSubmission" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  countryCode TEXT DEFAULT '+91',  -- NEW FIELD
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  interestedCourse TEXT,
  status TEXT DEFAULT 'NEW',
  notes TEXT,
  respondedAt TIMESTAMP,
  respondedBy TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🎉 Done!

Your databases are now updated to store country codes with phone numbers!
