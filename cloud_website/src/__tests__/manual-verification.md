# Manual Verification Checklist for Core Student Features

This document provides a comprehensive checklist for manually verifying all core student features as part of Task 12 checkpoint.

## Prerequisites

Before starting verification:
- [ ] Database is running and migrations are applied (`npx prisma migrate dev`)
- [ ] Application is running (`npm run dev`)
- [ ] At least one test user account exists
- [ ] At least one test course exists in the database

## 1. Enrollment Flow Verification

### 1.1 Unauthenticated Enrollment Attempt
- [ ] Navigate to a course page while logged out
- [ ] Click "Enroll" button
- [ ] **Expected**: Redirected to `/auth/signin` with callback URL
- [ ] **Expected**: After login, automatically redirected back to course page

### 1.2 Authenticated Free Course Enrollment
- [ ] Log in to the application
- [ ] Navigate to a free course (priceCents = 0)
- [ ] Click "Enroll" button
- [ ] **Expected**: Enrollment created immediately
- [ ] **Expected**: Success message displayed
- [ ] **Expected**: Button changes to "Go to Course" or "Continue Learning"

### 1.3 Authenticated Paid Course Enrollment
- [ ] Log in to the application
- [ ] Navigate to a paid course (priceCents > 0)
- [ ] Click "Enroll" button
- [ ] **Expected**: Redirected to Stripe Checkout
- [ ] **Expected**: After successful payment, enrollment created
- [ ] **Expected**: Webhook processes payment and creates enrollment

### 1.4 Duplicate Enrollment Prevention
- [ ] Attempt to enroll in a course you're already enrolled in
- [ ] **Expected**: Error message "Already enrolled in this course"
- [ ] **Expected**: No duplicate enrollment record created

### 1.5 Enrollment Visibility
- [ ] After enrolling, navigate to dashboard
- [ ] **Expected**: Newly enrolled course appears in "My Courses"
- [ ] **Expected**: Enrollment date is displayed correctly
- [ ] **Expected**: Course shows 0% completion initially

## 2. Progress Tracking Verification

### 2.1 Lesson Completion Recording
- [ ] Navigate to an enrolled course
- [ ] Start a lesson (video or reading)
- [ ] Complete the lesson
- [ ] **Expected**: Lesson marked as completed
- [ ] **Expected**: Progress saved to database
- [ ] **Expected**: Completion timestamp recorded

### 2.2 Progress Calculation
- [ ] Complete 2 out of 5 lessons in a course
- [ ] Check course progress
- [ ] **Expected**: Shows "2/5 lessons completed"
- [ ] **Expected**: Shows "40% complete"
- [ ] **Expected**: Progress bar reflects 40%

### 2.3 Last Accessed Lesson
- [ ] Access a specific lesson in a course
- [ ] Navigate away and return to the course
- [ ] **Expected**: System remembers last accessed lesson
- [ ] **Expected**: "Continue where you left off" shows correct lesson

### 2.4 Video Position Tracking
- [ ] Watch a video lesson partway through
- [ ] Navigate away
- [ ] Return to the same lesson
- [ ] **Expected**: Video resumes from last position
- [ ] **Expected**: Position saved in database

### 2.5 Course Completion Detection
- [ ] Complete all lessons in a course
- [ ] **Expected**: Course status changes to "COMPLETED"
- [ ] **Expected**: Completion percentage shows 100%
- [ ] **Expected**: Dashboard shows course as completed
- [ ] **Expected**: Audit log entry created for completion

### 2.6 Time Spent Tracking
- [ ] Spend time on various lessons
- [ ] Check progress data
- [ ] **Expected**: Time spent is tracked per lesson
- [ ] **Expected**: Total time spent is calculated correctly

## 3. Student Dashboard Verification

### 3.1 Dashboard Access
- [ ] Log in as a student
- [ ] Navigate to `/dashboard`
- [ ] **Expected**: Dashboard loads successfully
- [ ] **Expected**: User name displayed in header
- [ ] **Expected**: User profile photo displayed (if available)

### 3.2 Enrollment Statistics
- [ ] View dashboard statistics cards
- [ ] **Expected**: "Enrolled Courses" count is correct
- [ ] **Expected**: "Completed Courses" count is correct
- [ ] **Expected**: "In Progress" count is correct
- [ ] **Expected**: All counts match actual enrollments

### 3.3 Enrolled Courses List
- [ ] View "My Courses" section
- [ ] **Expected**: All enrolled courses are displayed
- [ ] **Expected**: Each course shows:
  - Course title
  - Course thumbnail
  - Instructor name
  - Enrollment date
  - Completion percentage
  - Progress bar
  - "Continue Learning" button

### 3.4 Empty State
- [ ] Create a new user with no enrollments
- [ ] Navigate to dashboard
- [ ] **Expected**: Empty state message displayed
- [ ] **Expected**: "Browse Courses" button shown
- [ ] **Expected**: Encouraging message to start learning

### 3.5 Course Navigation
- [ ] Click on a course card in dashboard
- [ ] **Expected**: Navigates to course content page
- [ ] **Expected**: Shows last accessed lesson
- [ ] **Expected**: Can resume learning immediately

### 3.6 Progress Display Accuracy
- [ ] Compare dashboard progress with actual lesson completion
- [ ] **Expected**: Progress percentages match reality
- [ ] **Expected**: Completed lesson counts are accurate
- [ ] **Expected**: Last accessed dates are correct

### 3.7 Dashboard Performance
- [ ] Load dashboard with multiple enrollments (5+)
- [ ] **Expected**: Page loads within 2 seconds
- [ ] **Expected**: No layout shifts or flickering
- [ ] **Expected**: Images load progressively

## 4. Profile Management Verification

### 4.1 Profile Access
- [ ] Log in to the application
- [ ] Navigate to `/profile`
- [ ] **Expected**: Profile page loads successfully
- [ ] **Expected**: All profile fields are displayed

### 4.2 Profile Display
- [ ] View profile page
- [ ] **Expected**: Name is displayed correctly
- [ ] **Expected**: Email is displayed correctly
- [ ] **Expected**: Profile photo is displayed (if set)
- [ ] **Expected**: Role badge is shown
- [ ] **Expected**: Member since date is shown
- [ ] **Expected**: Last updated date is shown

### 4.3 Profile Editing
- [ ] Click "Edit Profile" button
- [ ] **Expected**: Form fields become editable
- [ ] **Expected**: Current values are pre-filled
- [ ] **Expected**: "Save Changes" and "Cancel" buttons appear

### 4.4 Basic Information Update
- [ ] Edit name field
- [ ] Edit phone number
- [ ] Edit location
- [ ] Edit timezone
- [ ] Click "Save Changes"
- [ ] **Expected**: Success message displayed
- [ ] **Expected**: Changes persisted to database
- [ ] **Expected**: Updated values displayed immediately

### 4.5 Profile Photo Update
- [ ] Enter a new profile photo URL
- [ ] Click "Save Changes"
- [ ] **Expected**: New photo URL saved
- [ ] **Expected**: Photo displayed in profile
- [ ] **Expected**: Photo displayed in header/dashboard

### 4.6 Bio Update
- [ ] Edit bio textarea
- [ ] Enter multi-line text
- [ ] Click "Save Changes"
- [ ] **Expected**: Bio saved with line breaks preserved
- [ ] **Expected**: Bio displayed correctly on profile page

### 4.7 Profile Synchronization
- [ ] Update profile in main application
- [ ] Check admin panel (if available)
- [ ] **Expected**: Changes reflected in admin panel
- [ ] **Expected**: Last updated timestamp is current

### 4.8 Email Immutability
- [ ] Try to edit email field
- [ ] **Expected**: Email field is read-only
- [ ] **Expected**: Message "Email cannot be changed" is shown

### 4.9 Cancel Changes
- [ ] Edit multiple fields
- [ ] Click "Cancel" button
- [ ] **Expected**: All changes are reverted
- [ ] **Expected**: Original values are restored
- [ ] **Expected**: Edit mode is exited

### 4.10 Validation
- [ ] Try to save with invalid phone number format
- [ ] Try to save with invalid URL for photo
- [ ] **Expected**: Validation errors displayed (if implemented)
- [ ] **Expected**: Form submission prevented until valid

## 5. Integration Verification

### 5.1 Enrollment to Dashboard Flow
- [ ] Enroll in a new course
- [ ] Navigate to dashboard
- [ ] **Expected**: New enrollment appears immediately
- [ ] **Expected**: Shows 0% completion
- [ ] **Expected**: Enrollment date is today

### 5.2 Progress to Dashboard Flow
- [ ] Complete a lesson in a course
- [ ] Navigate to dashboard
- [ ] **Expected**: Progress percentage updated
- [ ] **Expected**: Completed lesson count increased
- [ ] **Expected**: Last accessed date updated

### 5.3 Profile to Dashboard Flow
- [ ] Update profile name
- [ ] Navigate to dashboard
- [ ] **Expected**: Updated name shown in dashboard header
- [ ] **Expected**: Profile photo updated (if changed)

### 5.4 Course Completion to Dashboard Flow
- [ ] Complete all lessons in a course
- [ ] Navigate to dashboard
- [ ] **Expected**: Course shows 100% completion
- [ ] **Expected**: Course moved to "Completed" section
- [ ] **Expected**: Completion badge/indicator shown

## 6. Error Handling Verification

### 6.1 Network Errors
- [ ] Disconnect network
- [ ] Try to enroll in a course
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Retry option available

### 6.2 Session Expiration
- [ ] Let session expire (or manually clear cookies)
- [ ] Try to access dashboard
- [ ] **Expected**: Redirected to login page
- [ ] **Expected**: Message "Session expired" shown
- [ ] **Expected**: After login, redirected back to intended page

### 6.3 Invalid Course Access
- [ ] Try to access a non-existent course
- [ ] **Expected**: 404 error page shown
- [ ] **Expected**: Option to browse courses

### 6.4 Unauthorized Access
- [ ] Log out
- [ ] Try to access `/dashboard` directly
- [ ] **Expected**: Redirected to login page
- [ ] **Expected**: Callback URL preserved

## 7. Data Consistency Verification

### 7.1 Database Consistency
- [ ] Check database directly (using Prisma Studio or SQL)
- [ ] **Expected**: Enrollment records match UI display
- [ ] **Expected**: Progress records match UI display
- [ ] **Expected**: Profile data matches UI display
- [ ] **Expected**: No orphaned records

### 7.2 Timestamp Accuracy
- [ ] Check enrollment timestamps
- [ ] Check progress timestamps
- [ ] Check profile update timestamps
- [ ] **Expected**: All timestamps are accurate
- [ ] **Expected**: Timezone handling is correct

### 7.3 Referential Integrity
- [ ] Check foreign key relationships
- [ ] **Expected**: All enrollments reference valid users and courses
- [ ] **Expected**: All progress records reference valid enrollments
- [ ] **Expected**: All profiles reference valid users

## Verification Results

### Summary
- Total Checks: 80+
- Passed: ___
- Failed: ___
- Blocked: ___

### Issues Found
1. 
2. 
3. 

### Notes
- 
- 
- 

### Sign-off
- Verified by: _______________
- Date: _______________
- Status: [ ] PASS [ ] FAIL [ ] NEEDS WORK
