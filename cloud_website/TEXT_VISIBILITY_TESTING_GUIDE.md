# Text Visibility Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
cd anywheredoor
npm run dev
```

### 2. Open Browser
Navigate to `http://localhost:3000`

## Pages to Test

### ✅ Homepage (`/`)
**What to check:**
- [ ] Hero section text is visible on blue gradient background
- [ ] Category cards text is visible on white background
- [ ] All headings are dark and visible
- [ ] Body text is readable (not too light)
- [ ] Trust indicators section text is visible
- [ ] Testimonials text is visible
- [ ] Footer text is visible on dark background

**Expected colors:**
- Hero text: White on dark blue gradient ✅
- Category headings: Dark gray/navy on white ✅
- Body text: Gray-600 or darker on white ✅

### ✅ Courses Page (`/courses`)
**What to check:**
- [ ] Page title and description visible
- [ ] Category filter buttons visible
- [ ] Course cards - all text visible
- [ ] Price text visible
- [ ] Rating stars and text visible
- [ ] Instructor names visible
- [ ] Filter sidebar text visible

**Expected colors:**
- Headings: Dark on light background ✅
- Course card text: Dark on white cards ✅
- Metadata (duration, level): Gray-600 or darker ✅

### ✅ Course Detail Page (`/courses/[slug]`)
**What to check:**
- [ ] Course title visible
- [ ] Course description visible
- [ ] Instructor information visible
- [ ] Curriculum section text visible
- [ ] Reviews text visible
- [ ] Pricing information visible
- [ ] Enrollment button text visible

### ✅ About Page (`/about`)
**What to check:**
- [ ] Hero section text visible on gradient
- [ ] Mission statement text visible
- [ ] Statistics numbers visible
- [ ] Partner logos section text visible
- [ ] Testimonials visible
- [ ] CTA section text visible on gradient

**Fixed:**
- Changed `text-blue-50` to `text-white` on dark gradient backgrounds ✅

### ✅ Contact Page (`/contact`)
**What to check:**
- [ ] Hero section text visible on gradient
- [ ] Form labels visible
- [ ] Form placeholder text visible (can be lighter)
- [ ] Contact information visible
- [ ] Office hours text visible
- [ ] Success/error messages visible

**Fixed:**
- Changed `text-blue-50` to `text-white` on dark gradient backgrounds ✅

### ✅ Resources Page (`/resources`)
**What to check:**
- [ ] Page title visible
- [ ] Blog post titles visible
- [ ] Author names visible
- [ ] Dates visible
- [ ] Category tags visible

### ✅ FAQ Page (`/faq`)
**What to check:**
- [ ] Question text visible
- [ ] Answer text visible
- [ ] Expand/collapse icons visible

### ✅ Help Page (`/help`)
**What to check:**
- [ ] Help topics visible
- [ ] Search bar text visible
- [ ] Category cards text visible

## Component-Specific Tests

### Header/Navigation
**What to check:**
- [ ] Logo text visible
- [ ] Navigation links visible (should be dark on white)
- [ ] Search bar placeholder visible
- [ ] Mobile menu text visible
- [ ] Dropdown menu text visible

### Footer
**What to check:**
- [ ] All footer links visible (white on dark background) ✅
- [ ] Contact information visible ✅
- [ ] Social media icons visible ✅
- [ ] Copyright text visible ✅

### Buttons
**What to check:**
- [ ] Primary button text visible (white on blue) ✅
- [ ] Secondary button text visible
- [ ] Outline button text visible
- [ ] Disabled button text visible

### Cards
**What to check:**
- [ ] Card titles visible
- [ ] Card descriptions visible
- [ ] Card metadata visible
- [ ] Card hover states maintain visibility

## Automated Testing

### Run Detection Script
```bash
cd anywheredoor
node scripts/fix-text-visibility.js
```

This will show you:
- Number of potential issues
- Files with issues
- Line numbers
- Specific problems

### Browser DevTools Testing

#### Chrome/Edge
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility"
4. Click "Generate report"
5. Look for "Contrast" issues

#### Firefox
1. Open DevTools (F12)
2. Go to Accessibility tab
3. Enable "Check for issues"
4. Look for contrast warnings

### Manual Contrast Testing
1. Right-click on text element
2. Inspect element
3. Check computed styles
4. Verify:
   - Text color
   - Background color
   - Contrast ratio (should be ≥ 4.5:1 for normal text)

## Common Issues and Fixes

### Issue 1: White text on white background
**Symptom:** Text is completely invisible
**Fix:** Change `text-white` to `text-gray-900` or `text-navy-800`

### Issue 2: Light gray text on white background
**Symptom:** Text is very faint and hard to read
**Fix:** Change `text-gray-100/200/300` to `text-gray-600` or darker

### Issue 3: Light blue text on white background
**Symptom:** Text appears washed out
**Fix:** Change `text-blue-50/100/200` to `text-blue-600` or darker

### Issue 4: Text visible in light mode but not dark mode
**Symptom:** Text disappears when switching themes
**Fix:** Use CSS variables or conditional classes based on theme

## Accessibility Standards

### WCAG AA Requirements (Minimum)
- **Normal text (< 18px):** Contrast ratio ≥ 4.5:1
- **Large text (≥ 18px or ≥ 14px bold):** Contrast ratio ≥ 3:1

### WCAG AAA Requirements (Enhanced)
- **Normal text:** Contrast ratio ≥ 7:1
- **Large text:** Contrast ratio ≥ 4.5:1

### Our Target
We aim for **WCAG AA compliance** as a minimum, with AAA where possible.

## Color Combinations Reference

### ✅ Good Combinations (High Contrast)
| Background | Text Color | Contrast Ratio |
|-----------|-----------|----------------|
| White (#ffffff) | Gray-900 (#1e293b) | 16.1:1 ✅ |
| White (#ffffff) | Gray-800 (#1f2937) | 12.6:1 ✅ |
| White (#ffffff) | Gray-700 (#374151) | 9.3:1 ✅ |
| White (#ffffff) | Gray-600 (#4b5563) | 7.0:1 ✅ |
| White (#ffffff) | Blue-600 (#2563eb) | 5.9:1 ✅ |
| Blue-900 (#1e3a8a) | White (#ffffff) | 13.6:1 ✅ |
| Blue-900 (#1e3a8a) | Gray-50 (#f9fafb) | 13.2:1 ✅ |

### ❌ Bad Combinations (Low Contrast)
| Background | Text Color | Contrast Ratio |
|-----------|-----------|----------------|
| White (#ffffff) | White (#ffffff) | 1:1 ❌ |
| White (#ffffff) | Gray-50 (#f9fafb) | 1.03:1 ❌ |
| White (#ffffff) | Gray-100 (#f3f4f6) | 1.1:1 ❌ |
| White (#ffffff) | Gray-200 (#e5e7eb) | 1.3:1 ❌ |
| White (#ffffff) | Blue-50 (#eff6ff) | 1.04:1 ❌ |
| White (#ffffff) | Blue-100 (#dbeafe) | 1.2:1 ❌ |

## Testing Checklist

### Before Deployment
- [ ] Run detection script - 0 critical issues
- [ ] Visual test all pages
- [ ] Lighthouse accessibility score ≥ 90
- [ ] No contrast warnings in DevTools
- [ ] Test on mobile devices
- [ ] Test with screen reader
- [ ] Test with high contrast mode
- [ ] Test with zoom (200%)

### After Deployment
- [ ] Spot check key pages
- [ ] Monitor user feedback
- [ ] Check analytics for bounce rates
- [ ] Review accessibility complaints

## Tools

### Online Contrast Checkers
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- [Color Review](https://color.review/)

### Browser Extensions
- [WAVE (Chrome/Firefox)](https://wave.webaim.org/extension/)
- [axe DevTools (Chrome/Firefox)](https://www.deque.com/axe/devtools/)
- [Lighthouse (Chrome)](https://developers.google.com/web/tools/lighthouse)

### Command Line Tools
```bash
# Our custom detection script
node scripts/fix-text-visibility.js

# Check specific file
grep -n "text-white\|text-gray-50\|text-blue-50" src/app/page.tsx
```

## Reporting Issues

If you find text visibility issues:

1. **Take a screenshot** showing the invisible text
2. **Note the page URL** where the issue occurs
3. **Identify the component** if possible
4. **Check browser/device** information
5. **Create an issue** with all the above information

## Quick Fixes

### Fix a Single Component
```bash
# Edit the component file
code src/components/YourComponent.tsx

# Find problematic colors
# Replace with appropriate colors from the guide
# Test locally
npm run dev

# Commit changes
git add src/components/YourComponent.tsx
git commit -m "fix: improve text visibility in YourComponent"
```

### Fix Multiple Files
```bash
# Use the auto-fix script
chmod +x scripts/auto-fix-text-visibility.sh
./scripts/auto-fix-text-visibility.sh

# Review changes
git diff

# Test thoroughly
npm run dev

# Commit if satisfied
git add .
git commit -m "fix: improve text visibility across multiple components"
```

## Support

For questions or issues:
- Check this guide first
- Run the detection script
- Review the fix summary document
- Ask the development team
