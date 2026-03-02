# Text Visibility Quick Reference Card

## 🚨 Problem
Text not visible due to light colors on light backgrounds.

## ✅ Solution
Global CSS fixes applied + component updates.

---

## Quick Color Guide

### Light Backgrounds (white, gray-50, gray-100)

```tsx
// ✅ USE THESE
text-gray-900  // Headings
text-gray-800  // Subheadings  
text-gray-700  // Body text
text-gray-600  // Secondary text
text-blue-600  // Links
```

```tsx
// ❌ DON'T USE THESE
text-white     // Invisible!
text-gray-50   // Invisible!
text-gray-100  // Invisible!
text-blue-50   // Invisible!
```

### Dark Backgrounds (blue-900, gray-900, gradients)

```tsx
// ✅ USE THESE
text-white     // Headings
text-gray-100  // Body text
text-gray-200  // Secondary text
text-blue-200  // Links
```

---

## Quick Commands

```bash
# Check for issues
node scripts/fix-text-visibility.js

# Start dev server
npm run dev

# Run accessibility audit
# Open browser → DevTools → Lighthouse → Accessibility
```

---

## Quick Patterns

### Hero Section
```tsx
<section className="bg-gradient-to-br from-blue-900 to-blue-700">
  <h1 className="text-white">Title</h1>
  <p className="text-white">Description</p>
</section>
```

### Card
```tsx
<div className="bg-white p-6">
  <h3 className="text-gray-900">Title</h3>
  <p className="text-gray-700">Description</p>
</div>
```

### Button
```tsx
<button className="bg-blue-600 text-white">
  Click Me
</button>
```

---

## Quick Checklist

Before committing:
- [ ] Run detection script
- [ ] Test in browser
- [ ] Check contrast in DevTools
- [ ] No Lighthouse warnings

---

## Quick Fix

If text is invisible:

1. **Identify background color**
   - Light background? Use dark text
   - Dark background? Use light text

2. **Apply correct color**
   ```tsx
   // Light bg
   className="bg-white text-gray-900"
   
   // Dark bg
   className="bg-blue-900 text-white"
   ```

3. **Test**
   ```bash
   npm run dev
   # Check in browser
   ```

---

## Contrast Ratios

| Text Size | Minimum Ratio | Recommended |
|-----------|--------------|-------------|
| Normal (< 18px) | 4.5:1 | 7:1 |
| Large (≥ 18px) | 3:1 | 4.5:1 |

---

## Common Mistakes

```tsx
// ❌ WRONG
<div className="bg-white">
  <p className="text-white">Invisible!</p>
</div>

// ✅ CORRECT
<div className="bg-white">
  <p className="text-gray-900">Visible!</p>
</div>
```

```tsx
// ❌ WRONG
<div className="bg-blue-900">
  <p className="text-gray-900">Hard to read!</p>
</div>

// ✅ CORRECT
<div className="bg-blue-900">
  <p className="text-white">Easy to read!</p>
</div>
```

---

## Need Help?

1. Check `TEXT_VISIBILITY_COMPLETE_FIX.md`
2. Check `TEXT_VISIBILITY_TESTING_GUIDE.md`
3. Run detection script
4. Ask the team

---

## Status: ✅ FIXED

Global CSS rules automatically fix most issues.
Component updates handle specific cases.
Detection script monitors for regressions.
