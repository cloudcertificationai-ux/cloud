# Welcome Popup - Cheat Sheet

## 🚀 Quick Start

```bash
# Start dev server
npm run dev

# Visit homepage
http://localhost:3000

# Wait 2 seconds → Popup appears!
```

## 🧪 Testing

```javascript
// Reset popup (browser console)
localStorage.removeItem('welcomePopupShown');
location.reload();
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `src/components/WelcomePopup.tsx` | Main component |
| `src/app/api/demo-request/route.ts` | API endpoint |
| `src/app/page.tsx` | Integration |

## ⚙️ Common Customizations

### Change Delay
```typescript
// WelcomePopup.tsx, line ~35
setTimeout(() => setIsOpen(true), 2000); // ← Change this
```

### Add Course
```typescript
// WelcomePopup.tsx, line ~280
<option value="new-course">New Course</option>
```

### Modify Colors
```typescript
// tailwind.config.ts
primary: { 600: '#0284c7' } // ← Change this
```

## 🎨 Design Specs

| Element | Value |
|---------|-------|
| Max Width | 1024px |
| Delay | 2 seconds |
| Animation | fade-in + scale-in |
| Z-Index | 100 |
| Backdrop | black 60% opacity |

## 📋 Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Name | text | ✅ |
| Phone Number | tel | ✅ |
| Email | email | ✅ |
| Course | select | ✅ |
| WhatsApp | checkbox | ❌ |
| Terms | checkbox | ✅ |

## 🎯 Validation Rules

| Field | Rule |
|-------|------|
| Full Name | Min 2 characters |
| Phone | 10 digits |
| Email | Valid email format |
| Course | Must select one |
| Terms | Must be checked |

## 🗄️ Database

**Table**: `contactSubmission`

```typescript
{
  name: string,
  email: string,
  phone: string,
  subject: "Free Demo Request",
  message: string,
  interestedCourse: string,
  status: "NEW"
}
```

## 🔧 API Endpoint

```typescript
POST /api/demo-request

// Request
{
  fullName: string,
  email: string,
  phoneNumber: string,
  course: string,
  whatsappConsent: boolean,
  termsAccepted: boolean
}

// Response (Success)
{
  success: true,
  message: string,
  id: string
}

// Response (Error)
{
  success: false,
  message: string,
  errors?: array
}
```

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#0284c7` | Buttons, headings |
| Accent Teal | `#14b8a6` | Checkmarks, highlights |
| Error Red | `#dc2626` | Error messages |
| Gray | `#6b7280` | Body text |

## 📱 Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column |
| Tablet | 768px - 1024px | Two columns |
| Desktop | > 1024px | Two columns |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ESC | Close popup |
| Tab | Navigate fields |
| Enter | Submit form |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Popup not showing | Clear localStorage |
| Form not submitting | Check console for errors |
| Styling broken | Restart dev server |
| TypeScript errors | Run `npm run type-check` |

## 📚 Documentation

| File | Description |
|------|-------------|
| `POPUP_QUICK_START.md` | Quick reference |
| `WELCOME_POPUP_GUIDE.md` | Full documentation |
| `POPUP_LAYOUT.md` | Visual reference |
| `POPUP_IMPLEMENTATION_SUMMARY.md` | Complete summary |
| `POPUP_CHEAT_SHEET.md` | This file |

## 🔗 Quick Links

```typescript
// Component
src/components/WelcomePopup.tsx

// API
src/app/api/demo-request/route.ts

// Integration
src/app/page.tsx

// Exports
src/components/index.ts

// Config
tailwind.config.ts
```

## ✅ Checklist

- [x] Component created
- [x] API endpoint created
- [x] Integrated in homepage
- [x] TypeScript types defined
- [x] Validation implemented
- [x] Database integration
- [x] Responsive design
- [x] Accessibility features
- [x] Documentation complete
- [x] No errors or warnings

## 🎉 You're Done!

The popup is ready to use. Visit the homepage and it will appear after 2 seconds!
