# Welcome Popup - Quick Start

## What Was Created

A professional welcome popup modal for the homepage that:
- ✅ Appears once per user (uses localStorage)
- ✅ Shows after 2 seconds on homepage load
- ✅ Matches your website's blue theme
- ✅ Collects user info for demo requests
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Includes form validation
- ✅ Saves data to database

## Files Created/Modified

### New Files
1. `src/components/WelcomePopup.tsx` - Popup component
2. `src/app/api/demo-request/route.ts` - API endpoint
3. `WELCOME_POPUP_GUIDE.md` - Detailed documentation

### Modified Files
1. `src/app/page.tsx` - Added WelcomePopup component

## How to Test

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the homepage: `http://localhost:3000`

3. Wait 2 seconds - the popup will appear

4. To test again, clear localStorage in browser console:
   ```javascript
   localStorage.removeItem('welcomePopupShown');
   location.reload();
   ```

## Features

### Left Panel (Branding)
- Gradient blue background
- "Begin your journey with us..." headline
- Trust indicators:
  - 50,000+ Students Trained
  - 4.8/5 Average Rating
  - Industry-Certified Instructors
  - 92% Job Placement Rate

### Right Panel (Form)
- Full Name (required)
- Phone Number with country code (required)
- Email Address (required)
- Course Selection dropdown (required)
- WhatsApp consent checkbox
- Terms & Conditions checkbox (required)
- Submit button

## Customization

### Change Popup Delay
In `src/components/WelcomePopup.tsx`, line ~35:
```typescript
setTimeout(() => {
  setIsOpen(true);
}, 2000); // Change to desired milliseconds
```

### Add/Remove Courses
In `src/components/WelcomePopup.tsx`, find the course dropdown (~280):
```typescript
<option value="web-development">Web Development</option>
<option value="data-science">Data Science & Analytics</option>
// Add more options here
```

### Modify Colors
Colors are defined in `tailwind.config.ts`:
- `primary-600` - Main blue (#0284c7)
- `accent-500` - Teal (#14b8a6)
- `error-500` - Red (#ef4444)

## Database

Form submissions are saved to the `contactSubmission` table:
- name
- email
- phone
- subject ("Free Demo Request")
- message (includes course interest)
- interestedCourse
- status ("NEW")

## Next Steps (Optional)

1. **Email Notifications**: Add email service to notify admins
2. **User Confirmation**: Send confirmation email to users
3. **WhatsApp Integration**: Connect WhatsApp API for opted-in users
4. **Analytics**: Track popup views and conversions
5. **Toast Notifications**: Replace alert() with toast messages

## Support

See `WELCOME_POPUP_GUIDE.md` for detailed documentation.
