# Admin Panel User Guide

Welcome to the anywheredoor Admin Panel! This guide will help you manage students, enrollments, and monitor platform analytics.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Accessing the Admin Panel](#accessing-the-admin-panel)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Students](#managing-students)
5. [Managing Enrollments](#managing-enrollments)
6. [Viewing Analytics](#viewing-analytics)
7. [Audit Logs](#audit-logs)
8. [Security Settings](#security-settings)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Admin role assigned to your account
- Access to the admin panel URL
- Google or Apple account for authentication

### System Requirements

- **Browser:** Chrome, Firefox, Safari, or Edge (latest version)
- **Internet:** Stable internet connection
- **Permissions:** Admin role in the system

---

## Accessing the Admin Panel

### Step 1: Navigate to Admin Panel

Visit the admin panel at: `https://admin.yourdomain.com`

### Step 2: Sign In

1. Click "Sign In"
2. Choose your authentication method (Google or Apple)
3. Sign in with your admin account
4. You'll be redirected to the admin dashboard

### Role Verification

- Only users with the "ADMIN" role can access the admin panel
- If you don't have admin access, contact your system administrator
- Non-admin users will see an "Access Denied" message

---

## Dashboard Overview

The admin dashboard provides a quick overview of platform metrics:

### Key Metrics

**Student Statistics:**
- Total registered students
- Active students (logged in within 30 days)
- New students this month
- Average courses per student

**Enrollment Statistics:**
- Total enrollments
- Active enrollments
- Completed enrollments
- Enrollment growth rate

**Course Statistics:**
- Total courses available
- Most popular courses
- Average completion rate
- Total learning hours

### Quick Actions

From the dashboard, you can:
- View recent enrollments
- See recent student registrations
- Access audit logs
- Navigate to detailed reports

---

## Managing Students

### Viewing Student List

1. Click "Students" in the sidebar navigation
2. The student list displays:
   - Student name and email
   - Profile photo
   - Registration date
   - Last login date
   - Number of enrollments
   - Account status

### Searching for Students

**Search Bar:**
1. Enter student name or email in the search box
2. Results update in real-time
3. Search is case-insensitive

**Filters:**
- Filter by role (Student, Instructor, Admin)
- Filter by registration date range
- Filter by enrollment count
- Filter by last login date

### Sorting Students

Click column headers to sort by:
- Name (A-Z or Z-A)
- Email (A-Z or Z-A)
- Registration date (newest or oldest)
- Last login (most recent or oldest)

### Viewing Student Details

1. Click on any student in the list
2. Student detail page shows:
   - **Profile Information:**
     - Name, email, profile photo
     - Registration date
     - Last login date
     - Account role
   - **Enrollment History:**
     - All courses enrolled
     - Enrollment dates
     - Completion status
     - Progress percentage
   - **Learning Statistics:**
     - Total courses enrolled
     - Courses completed
     - Total learning time
     - Average progress across courses
   - **Recent Activity:**
     - Recent lesson completions
     - Recent course access
     - Recent profile updates

### Student Actions

From the student detail page, you can:
- **Manually enroll** the student in a course
- **Remove enrollments** (with confirmation)
- **View audit logs** for the student
- **Export student data** (CSV format)

---

## Managing Enrollments

### Viewing All Enrollments

1. Click "Enrollments" in the sidebar
2. The enrollment list displays:
   - Student name
   - Course name
   - Enrollment date
   - Status (Active, Completed, Cancelled)
   - Progress percentage
   - Last accessed date

### Filtering Enrollments

**By Status:**
- Active enrollments
- Completed enrollments
- Cancelled enrollments

**By Course:**
- Select a specific course from dropdown
- View all enrollments for that course

**By Date Range:**
- Filter by enrollment date
- Custom date range picker

**By Progress:**
- Not started (0%)
- In progress (1-99%)
- Completed (100%)

### Creating Manual Enrollments

**Use Case:** Enroll a student in a course without payment (promotional, refund, etc.)

**Steps:**
1. Navigate to the student detail page
2. Click "Enroll in Course"
3. Select the course from the dropdown
4. Choose enrollment source:
   - Admin (manual enrollment)
   - Promotion (promotional access)
   - Refund (re-enrollment after refund)
5. Click "Create Enrollment"
6. Confirmation message appears
7. Student receives email notification

**Important Notes:**
- Manual enrollments bypass payment
- Enrollment is immediate
- Student gets full course access
- Action is logged in audit logs

### Removing Enrollments

**Use Case:** Remove access due to refund, violation, or error

**Steps:**
1. Navigate to the enrollment detail page
2. Click "Remove Enrollment"
3. Confirm the action in the dialog
4. Select reason for removal:
   - Refund processed
   - Policy violation
   - Duplicate enrollment
   - Other (specify)
5. Click "Confirm Removal"
6. Enrollment is cancelled
7. Student loses course access immediately
8. Student receives email notification

**Important Notes:**
- This action cannot be undone
- Student progress is preserved (not deleted)
- Student can re-enroll later if needed
- Action is logged in audit logs

### Bulk Operations

**Bulk Enrollment:**
1. Click "Bulk Actions" > "Bulk Enroll"
2. Upload CSV file with student emails and course IDs
3. Review the preview
4. Click "Process Enrollments"
5. View results summary

**CSV Format:**
```csv
email,courseId,source
student1@example.com,course_abc123,promotion
student2@example.com,course_abc123,promotion
```

---

## Viewing Analytics

### Enrollment Analytics

**Path:** Analytics > Enrollments

**Metrics Available:**
- Total enrollments over time (line chart)
- Enrollments by course (bar chart)
- Enrollment status distribution (pie chart)
- Enrollment sources (purchase, admin, promotion)
- Average time to completion
- Completion rate by course

**Filters:**
- Date range selector
- Course filter
- Status filter

**Export Options:**
- Export as CSV
- Export as PDF report
- Schedule automated reports

### Student Analytics

**Path:** Analytics > Students

**Metrics Available:**
- Student growth over time
- Active vs. inactive students
- Average courses per student
- Student engagement metrics
- Geographic distribution (if available)
- Device usage statistics

**Engagement Metrics:**
- Daily active users (DAU)
- Weekly active users (WAU)
- Monthly active users (MAU)
- Average session duration
- Average lessons completed per session

### Course Analytics

**Path:** Analytics > Courses

**Metrics Available:**
- Most popular courses
- Course completion rates
- Average time to complete
- Student satisfaction ratings
- Revenue by course (for paid courses)
- Enrollment trends by course

**Course Performance:**
- Completion rate
- Average progress
- Drop-off points (where students stop)
- Time spent per lesson
- Student ratings and reviews

### Revenue Analytics

**Path:** Analytics > Revenue (if applicable)

**Metrics Available:**
- Total revenue over time
- Revenue by course
- Average transaction value
- Refund rate
- Payment method distribution
- Revenue forecasting

---

## Audit Logs

### Viewing Audit Logs

**Path:** Security > Audit Logs

Audit logs track all administrative actions and important system events.

### Log Information

Each log entry includes:
- **Timestamp:** When the action occurred
- **User:** Who performed the action
- **Action:** What was done (e.g., enrollment_created, enrollment_removed)
- **Resource Type:** What was affected (e.g., enrollment, user, course)
- **Resource ID:** Specific item affected
- **Details:** Additional context (JSON format)
- **IP Address:** Where the action originated
- **User Agent:** Browser/device information

### Filtering Logs

**By Action Type:**
- Enrollment actions
- Profile updates
- Course access
- Admin actions
- Authentication events

**By User:**
- Select specific user from dropdown
- View all actions by that user

**By Date Range:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

**By Resource Type:**
- Enrollments
- Users
- Courses
- Payments

### Searching Logs

- Full-text search across all log fields
- Search by resource ID
- Search by IP address
- Search by user email

### Exporting Logs

1. Apply desired filters
2. Click "Export Logs"
3. Choose format (CSV or JSON)
4. Download file

**Use Cases:**
- Compliance reporting
- Security audits
- Troubleshooting issues
- User activity investigation

---

## Security Settings

### API Key Management

**Path:** Security > API Keys

**Viewing API Keys:**
- List of all API keys
- Key name and creation date
- Last used timestamp
- Status (active/inactive)

**Creating New API Key:**
1. Click "Generate New API Key"
2. Enter key name (e.g., "Admin Panel Production")
3. Set expiration date (optional)
4. Click "Generate"
5. **Important:** Copy the API secret immediately (shown only once)
6. Store the secret securely

**Rotating API Keys:**
1. Generate a new API key
2. Update the new key in your application
3. Test the new key
4. Deactivate the old key

**Revoking API Keys:**
1. Find the key in the list
2. Click "Revoke"
3. Confirm the action
4. Key is immediately deactivated

### Role Management

**Path:** Security > Roles

**Available Roles:**
- **ADMIN:** Full access to admin panel
- **INSTRUCTOR:** Limited access (course management only)
- **STUDENT:** No admin panel access

**Assigning Roles:**
1. Navigate to student detail page
2. Click "Change Role"
3. Select new role
4. Confirm the action
5. User's access is updated immediately

**Important Notes:**
- Only admins can assign roles
- Role changes are logged in audit logs
- Users are notified of role changes

### Security Best Practices

1. **API Keys:**
   - Rotate keys regularly (every 90 days)
   - Use different keys for different environments
   - Never commit keys to version control
   - Store keys in environment variables

2. **Access Control:**
   - Review admin users regularly
   - Remove admin access when no longer needed
   - Use principle of least privilege

3. **Monitoring:**
   - Review audit logs regularly
   - Set up alerts for suspicious activity
   - Monitor failed login attempts

---

## Troubleshooting

### Common Issues and Solutions

#### Can't Access Admin Panel

**Problem:** "Access Denied" message when trying to access admin panel

**Solutions:**
1. Verify you have admin role assigned
2. Try logging out and back in
3. Clear browser cache and cookies
4. Contact system administrator to verify your role

#### Student Data Not Syncing

**Problem:** Changes in main app not reflected in admin panel

**Solutions:**
1. Check data synchronization status (Dashboard > Sync Status)
2. Wait a few seconds and refresh the page
3. Verify API keys are configured correctly
4. Check audit logs for sync errors
5. Contact technical support if issue persists

#### Enrollment Creation Fails

**Problem:** Error when trying to manually enroll a student

**Solutions:**
1. Verify the student exists in the system
2. Check if student is already enrolled in the course
3. Verify the course exists and is published
4. Check API connection status
5. Review error message for specific details

#### Analytics Not Loading

**Problem:** Analytics page shows loading spinner indefinitely

**Solutions:**
1. Check your internet connection
2. Try refreshing the page
3. Clear browser cache
4. Try a different browser
5. Check if date range is too large (try smaller range)

#### Audit Logs Missing

**Problem:** Expected actions not appearing in audit logs

**Solutions:**
1. Check date range filter
2. Verify action type filter
3. Wait a few seconds (logs may be delayed)
4. Check if logging is enabled (contact technical support)

#### API Key Not Working

**Problem:** API requests failing with authentication error

**Solutions:**
1. Verify API key is active (not revoked)
2. Check API key hasn't expired
3. Verify signature is generated correctly
4. Check timestamp is current (within 5 minutes)
5. Ensure API secret matches the key

---

## Best Practices

### Daily Tasks

1. **Monitor Dashboard:**
   - Check for unusual activity
   - Review new student registrations
   - Monitor enrollment trends

2. **Review Recent Activity:**
   - Check recent enrollments
   - Review recent student issues
   - Monitor support tickets

### Weekly Tasks

1. **Review Analytics:**
   - Check enrollment trends
   - Review course performance
   - Identify popular courses

2. **Audit Logs Review:**
   - Review admin actions
   - Check for suspicious activity
   - Verify data integrity

### Monthly Tasks

1. **Generate Reports:**
   - Monthly enrollment report
   - Revenue report (if applicable)
   - Student growth report

2. **Security Review:**
   - Review admin user list
   - Rotate API keys if needed
   - Review access logs

3. **Data Cleanup:**
   - Archive old audit logs
   - Review inactive students
   - Clean up test data

---

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + /` - Show keyboard shortcuts
- `Esc` - Close modal/dialog
- `Ctrl/Cmd + S` - Save changes (when editing)
- `Ctrl/Cmd + E` - Export current view

---

## Getting Help

### Support Channels

**Technical Support:**
- Email: admin-support@yourdomain.com
- Response time: Within 4 hours (business hours)

**Documentation:**
- Admin docs: https://docs.yourdomain.com/admin
- API docs: https://docs.yourdomain.com/api

**Emergency Contact:**
- Phone: +91-XXX-XXX-XXXX (24/7 for critical issues)

### Before Contacting Support

Please have the following information ready:
- Your admin email address
- Description of the issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and device information
- Relevant audit log entries

---

## Frequently Asked Questions

### General

**Q: How often is data synchronized?**
A: Data is synchronized in real-time. Changes in the main application appear in the admin panel within seconds.

**Q: Can I export all student data?**
A: Yes, use the "Export" button on the students page to download a CSV file with all student information.

**Q: How long are audit logs retained?**
A: Audit logs are retained for 1 year by default. Older logs are archived.

### Enrollments

**Q: What happens when I remove an enrollment?**
A: The student immediately loses access to the course. Their progress is preserved but they cannot access course materials.

**Q: Can I re-enroll a student after removing their enrollment?**
A: Yes, you can manually enroll them again. Their previous progress will be restored.

**Q: Is there a limit to manual enrollments?**
A: No, you can create as many manual enrollments as needed.

### Security

**Q: How do I know if my API key is compromised?**
A: Monitor the "Last Used" timestamp and audit logs. If you see unexpected usage, rotate the key immediately.

**Q: Can I have multiple admin users?**
A: Yes, you can assign the admin role to multiple users.

**Q: What permissions do instructors have?**
A: Instructors can manage their own courses but cannot access student data or admin functions.

---

## Updates & Changelog

### Recent Updates

**January 2024:**
- Added bulk enrollment feature
- Improved analytics dashboard
- Enhanced audit log filtering

**December 2023:**
- Added API key rotation feature
- Improved student search performance
- Added export functionality

**November 2023:**
- Initial admin panel release
- Basic student and enrollment management
- Analytics dashboard

---

## Feedback

We value your feedback on the admin panel! Help us improve by:
- Reporting bugs: bugs@yourdomain.com
- Suggesting features: features@yourdomain.com
- Completing admin surveys

---

**Thank you for managing the anywheredoor platform!** 🚀

If you have any questions not covered in this guide, please contact our admin support team.
