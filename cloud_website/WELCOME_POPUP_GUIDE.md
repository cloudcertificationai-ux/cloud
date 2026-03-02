# Welcome Popup Implementation Guide

## Overview
A professional welcome popup modal has been added to the homepage that appears once per user session. The popup is designed to match the website's theme and collect user information for demo requests.

## Features

### 1. One-Time Display
- The popup appears automatically 2 seconds after the homepage loads
- Uses localStorage to track if the user has already seen it
- Will not show again once dismissed or submitted

### 2. Responsive Design
- Fully responsive layout that works on mobile, tablet, and desktop
- Two-column layout on desktop (branding + form)
- Single column on mobile devices
- Maximum height with scrolling for smaller screens

### 3. Form Fields
- Full Name (required)
- Phone Number with country code selector (required)
- Email Address (required)
- Course Selection dropdown (required)
- WhatsApp consent checkbox (optional)
- Terms & Conditions acceptance (required)

### 4. Validation
- Client-side validation for all required fields
- Email format validation
- Phone number format validation (10 digits)
- Error messages displayed inline

### 5. Design Elements
- Left panel with gradient background matching website theme
- Trust indicators (50K+ students, 4.8/5 rating, etc.)
- Professional icons and checkmarks
- Smooth animations (fade-in, scale-in)
- Close button with hover effects

## Files Created

### 1. Component
- `src/components/WelcomePopup.tsx` - Main popup component

### 2. API Route
- `src/app/api/demo-request/route.ts` - Handles form submissions

### 3. Integration
- Updated `src/app/page.tsx` to include the WelcomePopup component

## How It Works

### User Flow
1. User visits the homepage
2. After 2 seconds, the popup appears with a fade-in animation
3. User fills out the form
4. On submit:
   - Form is validated
   - Data is sent to `/api/demo-request`
   - Saved to database (contactSubmission table)
   - Success message is shown
   - Popup closes and localStorage is updated
5. User won't see the popup again on subsequent visits

### Technical Flow
```
Homepage Load
    ↓
Check localStorage ('welcomePopupShown')
    ↓
If not shown → Wait 2 seconds → Show popup
    ↓
User submits form
    ↓
Validate data (client-side)
    ↓
POST to /api/demo-request
    ↓
Validate data (server-side with Zod)
    ↓
Save to database (Prisma)
    ↓
Return success response
    ↓
Close popup + Set localStorage
```

## Customization

### Change Delay Time
Edit the timeout in `WelcomePopup.tsx`:
```typescript
const timer = setTimeout(() => {
  setIsOpen(true);
}, 2000); // Change this value (in milliseconds)
```

### Reset for Testing
To see the popup again during development:
```javascript
// Run in browser console
localStorage.removeItem('welcomePopupShown');
```

### Modify Courses List
Edit the course options in `WelcomePopup.tsx`:
```typescript
<select id="course" name="course" ...>
  <option value="">Select a course</option>
  <option value="web-development">Web Development</option>
  // Add or modify options here
</select>
```

### Change Colors
The popup uses Tailwind classes that reference the theme colors:
- `primary-600` - Main blue color
- `accent-500` - Teal/green for checkmarks
- `error-500` - Red for error messages

These are defined in `tailwind.config.ts`.

## Database Schema

The form data is saved to the `contactSubmission` table with the following structure:
```typescript
{
  name: string,           // Full name
  email: string,          // Email address
  phone: string,          // Phone number
  subject: string,        // "Free Demo Request"
  message: string,        // Course interest + WhatsApp consent
  interestedCourse: string, // Selected course
  status: string,         // "NEW"
}
```

## Future Enhancements

### Recommended Additions
1. Email notifications to admin when form is submitted
2. Confirmation email to user
3. WhatsApp integration for users who opt-in
4. Analytics tracking (Google Analytics event)
5. A/B testing different popup designs
6. Toast notifications instead of alert()
7. Multi-step form for better UX
8. Social proof (recent signups counter)

### Email Integration Example
```typescript
// In /api/demo-request/route.ts
import { sendEmail } from '@/lib/email';

// After saving to database
await sendEmail({
  to: validatedData.email,
  subject: 'Thank you for requesting a demo',
  template: 'demo-confirmation',
  data: { name: validatedData.fullName }
});
```

## Accessibility

The popup includes:
- ARIA labels and roles
- Keyboard navigation support (ESC to close)
- Focus management
- Screen reader announcements
- Proper form labels and error messages

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Manual Testing Checklist
- [ ] Popup appears after 2 seconds on homepage
- [ ] Popup doesn't appear on subsequent visits
- [ ] All form validations work correctly
- [ ] Form submits successfully
- [ ] Error messages display properly
- [ ] Close button works
- [ ] ESC key closes popup
- [ ] Clicking backdrop closes popup
- [ ] Responsive on mobile devices
- [ ] Animations are smooth

### Reset Testing State
```javascript
// Browser console
localStorage.removeItem('welcomePopupShown');
location.reload();
```

## Troubleshooting

### Popup Not Appearing
1. Check browser console for errors
2. Verify localStorage is not set: `localStorage.getItem('welcomePopupShown')`
3. Check if you're on the homepage (not other pages)
4. Clear localStorage and refresh

### Form Not Submitting
1. Check browser console for API errors
2. Verify database connection
3. Check Prisma schema includes contactSubmission table
4. Verify API route is accessible at `/api/demo-request`

### Styling Issues
1. Ensure Tailwind CSS is properly configured
2. Check that custom colors are defined in `tailwind.config.ts`
3. Verify animations are working (check browser DevTools)

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the implementation files
3. Test with localStorage cleared
4. Verify database schema matches expectations
