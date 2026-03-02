# Welcome Popup Layout

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [X Close Button]                                               │
│                                                                 │
│  ┌──────────────────┬──────────────────────────────────────┐  │
│  │                  │                                      │  │
│  │  LEFT PANEL      │  RIGHT PANEL                         │  │
│  │  (Blue Gradient) │  (White Background)                  │  │
│  │                  │                                      │  │
│  │  ⚡ Begin        │  Request A Free Demo                 │  │
│  │  your journey    │  Enter your email and phone number.  │  │
│  │  with us...      │                                      │  │
│  │                  │  ┌────────────────────────────────┐ │  │
│  │  ┌────────────┐  │  │ Full Name*                     │ │  │
│  │  │ Program    │  │  └────────────────────────────────┘ │  │
│  │  │ Designed   │  │                                      │  │
│  │  │ By         │  │  ┌──────┬──────────────────────────┐│  │
│  │  │            │  │  │🇮🇳(+91)│ Phone No*              ││  │
│  │  │ [Partners] │  │  └──────┴──────────────────────────┘│  │
│  │  └────────────┘  │                                      │  │
│  │                  │  ┌────────────────────────────────┐ │  │
│  │  Trust &         │  │ Email Address*                 │ │  │
│  │  Benefits:       │  └────────────────────────────────┘ │  │
│  │                  │                                      │  │
│  │  ✓ 50,000+       │  ┌────────────────────────────────┐ │  │
│  │    Students      │  │ Course You Are Looking For*    │ │  │
│  │    Trained       │  │ [Dropdown]                     │ │  │
│  │                  │  └────────────────────────────────┘ │  │
│  │  ✓ 4.8/5         │                                      │  │
│  │    Average       │  ┌────────────────────────────────┐ │  │
│  │    Rating        │  │ 📱 Connect on whatsapp [Toggle]│ │  │
│  │                  │  └────────────────────────────────┘ │  │
│  │  ✓ Industry-     │                                      │  │
│  │    Certified     │  ☐ By registering here, I agree to  │  │
│  │    Instructors   │     Terms & Conditions              │  │
│  │                  │                                      │  │
│  │  ✓ 92% Job       │  ┌────────────────────────────────┐ │  │
│  │    Placement     │  │        Continue                │ │  │
│  │    Rate          │  └────────────────────────────────┘ │  │
│  │                  │                                      │  │
│  └──────────────────┴──────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥768px)
- Two-column layout
- Left panel: 40% width
- Right panel: 60% width
- Side-by-side display

### Mobile (<768px)
- Single column layout
- Left panel stacks on top
- Right panel below
- Full width for both sections

## Color Scheme

### Left Panel
- Background: Gradient from `primary-600` to `primary-800` (#0284c7 → #075985)
- Text: White
- Icons: White with `accent-500` background (#14b8a6)
- Checkmarks: `accent-500` circles

### Right Panel
- Background: White
- Heading: `primary-600` (#0284c7)
- Text: Gray-600, Gray-700
- Input borders: Gray-300
- Error text: `error-600` (#dc2626)
- Button: `primary-600` background, white text

## Animations

### Popup Entrance
1. Backdrop: Fade in (opacity 0 → 0.6)
2. Modal: Scale in (scale 0.9 → 1.0)
3. Duration: 300ms

### Interactive Elements
- Close button: Scale on hover (1.0 → 1.1)
- Submit button: Scale on hover (1.0 → 1.02)
- Inputs: Ring effect on focus

## Dimensions

### Desktop
- Max width: 1024px (4xl)
- Max height: 90vh
- Padding: 40px (10)

### Mobile
- Max width: 100% - 32px (p-4)
- Max height: 90vh
- Padding: 32px (8)

## Z-Index Layers

```
100 - Popup backdrop
100 - Popup modal
10  - Close button (relative to modal)
```

## Form Layout

### Input Fields
- Full width
- Height: 40px (py-2.5)
- Border radius: 8px (rounded-lg)
- Border: 1px solid gray-300
- Focus: 2px ring primary-500

### Spacing
- Between fields: 20px (space-y-5)
- Label to input: 4px (mb-1)
- Error message: 4px (mt-1)

## Accessibility Features

### ARIA Attributes
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="welcome-popup-title"`
- `aria-label` on close button

### Keyboard Support
- ESC key closes popup
- Tab navigation through form
- Enter submits form

### Focus Management
- Focus ring on all interactive elements
- Visible focus indicators
- Logical tab order

## Trust Indicators Layout

```
┌─────────────────────────────────┐
│ Program Designed By             │
│ ┌──────────┐  ┌──────────┐     │
│ │ Industry │  │   Top    │     │
│ │ Partners │  │ Experts  │     │
│ └──────────┘  └──────────┘     │
└─────────────────────────────────┘

Trust & Benefits:
┌─────────────────────────────────┐
│ ✓ 50,000+ Students Trained      │
│ ✓ 4.8/5 Average Rating          │
│ ✓ Industry-Certified Instructors│
│ ✓ 92% Job Placement Rate        │
└─────────────────────────────────┘
```

## Form Validation States

### Default State
- Border: gray-300
- Background: white

### Focus State
- Border: transparent
- Ring: 2px primary-500
- Background: white

### Error State
- Border: error-500
- Background: white
- Error message: error-600 text below

### Disabled State
- Opacity: 50%
- Cursor: not-allowed
- Background: gray-50

## Button States

### Default
- Background: primary-600
- Text: white
- Shadow: subtle

### Hover
- Background: primary-700
- Scale: 1.02
- Shadow: medium

### Active
- Background: primary-800
- Scale: 1.0

### Disabled
- Opacity: 50%
- Cursor: not-allowed
- No hover effects
