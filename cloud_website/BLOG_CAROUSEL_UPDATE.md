# Blog Carousel Update

## Changes Made

### 1. Converted Blog Grid to Horizontal Carousel
- Changed from 3-column grid to horizontal scrollable carousel
- Now displays up to 10+ blog posts (or 7 dummy posts)
- Smooth horizontal scrolling with navigation buttons

### 2. Reduced Card Size
**Before:**
- Width: Full grid column (responsive)
- Height: 48 (192px) for image
- Padding: 6 (24px)

**After:**
- Width: Fixed 280px (compact cards)
- Height: 40 (160px) for image
- Padding: 4 (16px)
- More compact text sizes

### 3. Added Navigation Buttons
- **Left Arrow Button**: Appears when content is scrollable to the left
- **Right Arrow Button**: Appears when content is scrollable to the right
- Positioned outside the carousel (left: -16px, right: -16px)
- Hover effect: Changes from white to blue
- Smooth scroll animation

### 4. Improved Spacing
- Container: `max-w-7xl` with proper padding
- Card gap: 6 (24px) between cards
- Left/right margins: Proper spacing for navigation buttons
- Scrollbar hidden for clean look

### 5. Enhanced Dummy Posts
Added 4 more dummy posts (total 7):
1. How to Advance Your Tech Career in 2026
2. Top 10 Programming Languages to Learn
3. The Future of AI and Machine Learning
4. Mastering Cloud Architecture (NEW)
5. Cybersecurity Best Practices for 2026 (NEW)
6. Building Scalable Web Applications (NEW)
7. Data Science Career Roadmap (NEW)

### 6. Updated Data Fetching
- Homepage now fetches up to 10 blog posts (increased from 3)
- Carousel can display all fetched posts
- Smooth scrolling to navigate through all posts

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Latest from Our Blog                      │
│         Stay updated with the latest insights...             │
└─────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────────┐
    │  [<]  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  [>] │
    │       │ Card │ │ Card │ │ Card │ │ Card │ │ Card │      │
    │       │  1   │ │  2   │ │  3   │ │  4   │ │  5   │      │
    │       └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
    └───────────────────────────────────────────────────────┘
                    Scrollable horizontally →

                    ┌──────────────────┐
                    │ View All Articles │
                    └──────────────────┘
```

## Card Dimensions

**Compact Card:**
- Width: 280px (fixed)
- Image Height: 160px
- Content Padding: 16px
- Title: Base size (16px), 2 lines max
- Excerpt: Small size (14px), 2 lines max
- Author Avatar: 24px
- Font sizes reduced for compact design

## Features

✅ Horizontal scrolling carousel
✅ Left/Right navigation buttons
✅ Buttons appear/disappear based on scroll position
✅ Smooth scroll animation
✅ Compact card design (280px width)
✅ Displays 10+ blog posts
✅ 7 dummy posts for fallback
✅ Responsive spacing
✅ Hidden scrollbar for clean look
✅ Hover effects on cards and buttons

## User Experience

1. **Desktop**: Shows 4-5 cards at once, scroll to see more
2. **Tablet**: Shows 2-3 cards at once
3. **Mobile**: Shows 1-2 cards at once
4. **Navigation**: Click arrows or swipe/scroll horizontally
5. **Smooth**: Animated scrolling with easing

## Browser Compatibility

- Modern browsers: Full support
- Scrollbar hidden: CSS + inline styles
- Smooth scroll: Native CSS scroll-behavior
- Touch devices: Native swipe support
