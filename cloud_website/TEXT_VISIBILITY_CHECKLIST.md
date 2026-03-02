# Text Visibility Verification Checklist

## How to Use This Checklist
1. Open http://localhost:3000 in your browser
2. Go through each page listed below
3. Check that ALL text is clearly visible and readable
4. Mark each item as ✅ (pass) or ❌ (fail)

## Pages to Check

### Main Pages
- [ ] **Homepage** (/)
  - [ ] Hero section headline and subheadline
  - [ ] Success metrics text
  - [ ] "Graduates now lead teams at" section
  - [ ] Career-Focused Learning Paths section
  - [ ] Category cards text
  - [ ] Trust Indicators section
  - [ ] Testimonials section
  - [ ] All button text

- [ ] **Courses Page** (/courses)
  - [ ] Page title and description
  - [ ] Category filter buttons
  - [ ] Course card titles and descriptions
  - [ ] Price and duration text
  - [ ] Instructor names
  - [ ] Filter sidebar text
  - [ ] Sort controls text

- [ ] **Individual Course Pages** (/courses/[any-course])
  - [ ] Course title and description
  - [ ] Instructor information
  - [ ] Course details (duration, level, etc.)
  - [ ] Curriculum section
  - [ ] Prerequisites
  - [ ] Testimonials
  - [ ] Enrollment button

- [ ] **About Page** (/about)
  - [ ] Hero section text
  - [ ] Mission statement
  - [ ] Team section
  - [ ] Values section
  - [ ] CTA section text

- [ ] **Contact Page** (/contact)
  - [ ] Hero section text
  - [ ] Form labels
  - [ ] Contact information
  - [ ] Office locations
  - [ ] Social media links

- [ ] **For Business Page** (/for-business)
  - [ ] Hero section text
  - [ ] Enterprise solutions description
  - [ ] Features list
  - [ ] Pricing information
  - [ ] Learning Hub+ section
  - [ ] All feature descriptions

### Additional Pages
- [ ] **Skills Pages** (/skills/[category])
  - [ ] Category description
  - [ ] Learning path text
  - [ ] Course recommendations

- [ ] **Resources Page** (/resources)
  - [ ] Blog post titles
  - [ ] Author names
  - [ ] Publication dates
  - [ ] Category tags

- [ ] **FAQ Page** (/faq)
  - [ ] Questions and answers
  - [ ] Category headings

- [ ] **Help Page** (/help)
  - [ ] Help topics
  - [ ] Support information

- [ ] **Privacy Policy** (/privacy)
  - [ ] All policy text
  - [ ] Section headings

- [ ] **Terms of Service** (/terms)
  - [ ] All terms text
  - [ ] Section headings

### Components to Check on All Pages
- [ ] **Header/Navigation**
  - [ ] Logo text
  - [ ] Navigation menu items
  - [ ] Search bar placeholder
  - [ ] Mobile menu items

- [ ] **Footer**
  - [ ] Footer links
  - [ ] Copyright text
  - [ ] Social media links
  - [ ] Newsletter signup text

## Specific Areas to Focus On

### Light Backgrounds (white, gray-50, gray-100)
Check that text is DARK and clearly visible:
- Paragraph text should be dark gray or navy
- Headings should be dark
- Links should be blue and visible
- Secondary text should still be readable

### Dark Backgrounds (blue-900, blue-800, navy, gradients)
Check that text is LIGHT and clearly visible:
- Paragraph text should be white or very light
- Headings should be white
- Links should be light colored
- All text should have good contrast

### Hover States
- [ ] Check that hover states don't make text invisible
- [ ] Verify button hover states are visible
- [ ] Check link hover colors

### Mobile View
- [ ] Test all pages on mobile viewport (375px width)
- [ ] Check that text is still visible on small screens
- [ ] Verify mobile menu text visibility

## Common Issues to Look For
1. ❌ Very light gray text on white background
2. ❌ White text on light blue background
3. ❌ Light blue text on white background
4. ❌ Text that disappears on hover
5. ❌ Placeholder text that's too light
6. ❌ Disabled button text that's invisible

## Contrast Testing Tools
Use these tools to verify contrast ratios:
- Chrome DevTools: Inspect element > Accessibility tab
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAVE Browser Extension: https://wave.webaim.org/extension/

## Minimum Standards
- **WCAG AA**: 4.5:1 contrast ratio for normal text
- **WCAG AAA**: 7:1 contrast ratio for normal text (preferred)
- **Large text**: 3:1 contrast ratio minimum

## Report Issues
If you find any text visibility issues:
1. Note the page URL
2. Note the specific section/component
3. Take a screenshot
4. Note the text color and background color
5. Report to the development team

## Sign-Off
- [ ] All pages checked
- [ ] All text is visible and readable
- [ ] Contrast ratios meet WCAG AA standards
- [ ] No accessibility issues found

**Tested by:** _______________
**Date:** _______________
**Browser:** _______________
**Device:** _______________
