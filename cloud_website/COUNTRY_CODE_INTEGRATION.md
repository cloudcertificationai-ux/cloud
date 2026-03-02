# Country Code Integration - Complete Guide

## ✅ Implementation Complete

The free demo request popup now includes dynamic country code selection using the API: `https://apihut.in/api/country/phone-codes`

## 🎯 What Was Updated

### 1. **WelcomePopup Component** (`src/components/WelcomePopup.tsx`)
- Added country code API integration
- Dynamic dropdown with all countries
- Stores selected country code
- Fallback countries if API fails

### 2. **Database Schema** (Both Projects)
- Added `countryCode` field to `ContactSubmission` model
- Default value: `+91` (India)
- Stores selected country code with each request

### 3. **API Endpoint** (`src/app/api/demo-request/route.ts`)
- Updated to accept `countryCode`
- Validates country code
- Stores in database
- Combines country code + phone number

### 4. **Admin Panel** (`cloud/src/app/admin/demo-requests/page.tsx`)
- Updated interface to include `countryCode`
- Displays country code with phone number

## 📊 API Integration

### Country Codes API
```
URL: https://apihut.in/api/country/phone-codes
Method: GET
Response: Array of country objects
```

### Response Format
```typescript
[
  {
    name: "India",
    dial_code: "+91",
    code: "IN",
    flag: "🇮🇳" // Optional
  },
  {
    name: "United States",
    dial_code: "+1",
    code: "US",
    flag: "🇺🇸"
  },
  // ... more countries
]
```

## 🔄 Data Flow

```
User Opens Popup
    ↓
Fetch Country Codes from API
    ↓
Display Dropdown (Default: +91)
    ↓
User Selects Country
    ↓
User Enters Phone Number
    ↓
Submit Form
    ↓
API Receives: countryCode + phoneNumber
    ↓
Combine: "+91 1234567890"
    ↓
Save to Database
    ↓
Display in Admin Panel
```

## 💾 Database Schema

### ContactSubmission Table
```typescript
{
  id: string
  name: string
  email: string
  phone: string              // Full number: "+91 1234567890"
  countryCode: string        // Selected code: "+91"
  subject: string
  message: string
  interestedCourse: string
  status: enum
  notes: string | null
  respondedAt: Date | null
  respondedBy: string | null
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 UI Features

### Country Code Dropdown
- Searchable dropdown
- Shows country code + country name
- Format: `IN +91`, `US +1`, etc.
- Default: India (+91)
- Loading state while fetching
- Fallback if API fails

### Phone Number Input
- Separate from country code
- Validates 10 digits
- Combined on submit
- Clear error messages

## 🔧 Implementation Details

### 1. Fetch Country Codes
```typescript
useEffect(() => {
  const fetchCountryCodes = async () => {
    try {
      const response = await fetch('https://apihut.in/api/country/phone-codes');
      const data = await response.json();
      setCountryCodes(data);
    } catch (error) {
      // Fallback to default countries
      setCountryCodes([
        { name: 'India', dial_code: '+91', code: 'IN' },
        { name: 'United States', dial_code: '+1', code: 'US' },
        { name: 'United Kingdom', dial_code: '+44', code: 'GB' },
      ]);
    }
  };
  fetchCountryCodes();
}, []);
```

### 2. Form Data Structure
```typescript
interface WelcomeFormData {
  fullName: string;
  countryCode: string;      // New field
  phoneNumber: string;
  email: string;
  course: string;
  whatsappConsent: boolean;
  termsAccepted: boolean;
}
```

### 3. API Validation
```typescript
const demoRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  countryCode: z.string().min(1),  // New field
  phoneNumber: z.string().min(10),
  course: z.string().min(1),
  whatsappConsent: z.boolean().optional(),
  termsAccepted: z.boolean(),
});
```

### 4. Database Storage
```typescript
const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

await prisma.contactSubmission.create({
  data: {
    name: fullName,
    email: email,
    phone: fullPhoneNumber,
    countryCode: countryCode,  // New field
    // ... other fields
  },
});
```

## 🗄️ Database Migration

### Run Migrations

**For cloud_website:**
```bash
cd cloud_website
npx prisma migrate dev --name add_country_code
npx prisma generate
```

**For cloud (admin):**
```bash
cd cloud
npx prisma migrate dev --name add_country_code
npx prisma generate
```

### Migration SQL
```sql
ALTER TABLE "ContactSubmission" 
ADD COLUMN "countryCode" TEXT DEFAULT '+91';
```

## 📱 Admin Panel Display

### Request Table
Shows phone number with country code:
```
+91 1234567890
+1 5551234567
+44 2071234567
```

### Detail Modal
Displays:
- Country Code: +91
- Phone Number: Full number with code
- Separate fields for clarity

## 🔍 Fallback Handling

### If API Fails
Default countries provided:
- 🇮🇳 India (+91)
- 🇺🇸 United States (+1)
- 🇬🇧 United Kingdom (+44)

### If No Country Selected
- Default: +91 (India)
- Validation ensures selection
- Error message if missing

## ✨ Features

### User Experience
- ✅ Dynamic country selection
- ✅ All countries available
- ✅ Easy to search/select
- ✅ Clear display format
- ✅ Loading indicator
- ✅ Error handling

### Data Integrity
- ✅ Country code stored separately
- ✅ Full phone number stored
- ✅ Validation on both fields
- ✅ Default values set
- ✅ Database constraints

### Admin Benefits
- ✅ See country code
- ✅ Know user location
- ✅ Better contact info
- ✅ International support
- ✅ Complete data

## 🧪 Testing

### Test Cases

1. **Default Selection**
   - Open popup
   - Verify +91 is selected
   - Submit form
   - Check database

2. **Change Country**
   - Select different country
   - Enter phone number
   - Submit form
   - Verify correct code saved

3. **API Failure**
   - Block API request
   - Verify fallback countries
   - Form still works
   - Data saves correctly

4. **Validation**
   - Try without country code
   - Try without phone number
   - Verify error messages
   - Check validation works

## 📊 Data Examples

### Stored in Database
```
Name: John Doe
Email: john@example.com
Phone: +1 5551234567
Country Code: +1
Course: Web Development
```

### Admin Panel Display
```
┌─────────────────────────────────┐
│ Contact Info                    │
│ John Doe                        │
│ john@example.com                │
│ +1 5551234567                   │
│ Country: +1 (United States)     │
└─────────────────────────────────┘
```

## 🚀 Deployment

### Before Deploying

1. **Run Migrations**
   ```bash
   # Website database
   cd cloud_website
   npx prisma migrate deploy
   
   # Admin database
   cd cloud
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Test API Connection**
   - Verify API is accessible
   - Check fallback works
   - Test form submission

4. **Verify Database**
   - Check column exists
   - Verify default value
   - Test data insertion

## 🔐 Security

### API Security
- Public API (no auth needed)
- HTTPS connection
- Fallback for failures
- No sensitive data exposed

### Data Validation
- Server-side validation
- Type checking
- SQL injection protection
- XSS prevention

## 📈 Future Enhancements

### Possible Improvements
1. **Flag Icons** - Show country flags
2. **Search** - Search countries by name
3. **Popular Countries** - Show common ones first
4. **Auto-detect** - Detect user's country
5. **Format Validation** - Country-specific formats
6. **WhatsApp Integration** - Use country code for WhatsApp

## 🎉 Summary

The popup now:
- ✅ Fetches country codes from API
- ✅ Displays dynamic dropdown
- ✅ Stores country code in database
- ✅ Shows in admin panel
- ✅ Has fallback handling
- ✅ Validates properly
- ✅ Works internationally

All phone numbers are now stored with their country codes for better international support!
