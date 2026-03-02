# API Documentation

## Overview

This document provides comprehensive documentation for all external API endpoints in the anywheredoor platform. The API follows REST principles and uses JSON for request and response payloads.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://yourdomain.com/api`

## Authentication

### User Authentication

Most endpoints require user authentication via NextAuth.js session cookies. Users must be logged in through one of the supported OAuth providers (Google, Apple, Auth0).

**Authentication Flow:**
1. User initiates login via `/auth/signin`
2. User is redirected to OAuth provider
3. After successful authentication, session cookie is set
4. Session cookie is automatically included in subsequent requests

**Session Cookie:** `next-auth.session-token` (httpOnly, secure in production)

### API Key Authentication (Admin Endpoints)

Admin endpoints require API key authentication for cross-application communication.

**Headers Required:**
```
X-API-Key: <your-api-key>
X-Signature: <hmac-sha256-signature>
X-Timestamp: <unix-timestamp>
```

**Signature Generation:**
```typescript
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(`${method}${path}${timestamp}${JSON.stringify(body)}`)
  .digest('hex')
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **User Endpoints:** 100 requests per minute per user
- **Admin Endpoints:** 1000 requests per minute per API key

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_abc123"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Endpoints

### Authentication

#### POST /api/auth/signin
Initiates OAuth authentication flow.

**Authentication:** None (public)

**Request Body:**
```json
{
  "provider": "google" | "apple" | "auth0",
  "callbackUrl": "/dashboard"
}
```

**Response:** Redirects to OAuth provider

---

### Enrollments

#### POST /api/enrollments
Create a new course enrollment.

**Authentication:** Required (user session)

**Request Body:**
```json
{
  "courseId": "course_abc123",
  "courseSlug": "web-development-bootcamp"
}
```

**Success Response (Free Course):**
```json
{
  "success": true,
  "enrollment": {
    "id": "enr_xyz789",
    "userId": "user_123",
    "courseId": "course_abc123",
    "enrolledAt": "2024-01-15T10:30:00.000Z",
    "lastAccessedAt": null,
    "completionPercentage": 0,
    "status": "ACTIVE",
    "source": "free",
    "lastUpdatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Success Response (Paid Course):**
```json
{
  "requiresPayment": true,
  "purchaseId": "pur_def456",
  "amount": 9900,
  "currency": "INR"
}
```

**Error Response (Not Authenticated):**
```json
{
  "error": "Unauthorized",
  "requiresAuth": true,
  "redirectTo": "/auth/signin?callbackUrl=/courses/web-development-bootcamp"
}
```

**Error Response (Already Enrolled):**
```json
{
  "error": "Already enrolled in this course"
}
```

**Status Codes:**
- `200` - Success (enrollment created or payment required)
- `400` - Already enrolled
- `401` - Not authenticated
- `404` - Course or user not found
- `500` - Server error

---

#### GET /api/enrollments
Get all enrollments for the authenticated user.

**Authentication:** Required (user session)

**Query Parameters:** None

**Success Response:**
```json
{
  "data": [
    {
      "id": "enr_xyz789",
      "userId": "user_123",
      "courseId": "course_abc123",
      "enrolledAt": "2024-01-15T10:30:00.000Z",
      "lastAccessedAt": "2024-01-16T14:20:00.000Z",
      "completionPercentage": 45.5,
      "status": "ACTIVE",
      "source": "purchase",
      "course": {
        "id": "course_abc123",
        "title": "Web Development Bootcamp",
        "slug": "web-development-bootcamp",
        "thumbnailUrl": "https://...",
        "instructor": {
          "name": "John Doe"
        }
      },
      "lastUpdatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "timestamp": "2024-01-16T15:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### POST /api/enrollments/complete-intent
Complete a pending enrollment after authentication.

**Authentication:** Required (user session)

**Request Body:**
```json
{
  "courseId": "course_abc123",
  "courseSlug": "web-development-bootcamp"
}
```

**Success Response:**
```json
{
  "success": true,
  "enrollment": {
    "id": "enr_xyz789",
    "userId": "user_123",
    "courseId": "course_abc123",
    "enrolledAt": "2024-01-15T10:30:00.000Z",
    "status": "ACTIVE"
  }
}
```

---

### Profile

#### GET /api/profile
Get the authenticated user's profile.

**Authentication:** Required (user session)

**Success Response:**
```json
{
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://...",
    "role": "STUDENT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "id": "prof_456",
      "bio": "Aspiring web developer",
      "location": "Mumbai, India",
      "timezone": "Asia/Kolkata",
      "phone": "+91-9876543210"
    },
    "lastUpdatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

#### PUT /api/profile
Update the authenticated user's profile.

**Authentication:** Required (user session)

**Request Body:**
```json
{
  "name": "John Doe",
  "image": "https://...",
  "bio": "Full-stack developer",
  "location": "Delhi, India",
  "timezone": "Asia/Kolkata",
  "phone": "+91-9876543210"
}
```

**Success Response:**
```json
{
  "data": {
    "success": true,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://...",
      "role": "STUDENT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z",
      "lastUpdatedAt": "2024-01-15T10:35:00.000Z"
    },
    "profile": {
      "id": "prof_456",
      "userId": "user_123",
      "bio": "Full-stack developer",
      "location": "Delhi, India",
      "timezone": "Asia/Kolkata",
      "phone": "+91-9876543210"
    }
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - User not found
- `500` - Server error

---

### Progress Tracking

#### POST /api/progress
Update lesson progress for a course.

**Authentication:** Required (user session)

**Request Body:**
```json
{
  "courseId": "course_abc123",
  "lessonId": "lesson_789",
  "completed": true,
  "timeSpent": 1800,
  "lastPosition": 0
}
```

**Success Response:**
```json
{
  "data": {
    "success": true,
    "progress": {
      "id": "prog_xyz",
      "userId": "user_123",
      "courseId": "course_abc123",
      "lessonId": "lesson_789",
      "completed": true,
      "timeSpent": 1800,
      "lastPosition": 0,
      "timestamp": "2024-01-15T10:40:00.000Z",
      "lastUpdatedAt": "2024-01-15T10:40:00.000Z"
    },
    "completionStatus": {
      "status": "ACTIVE",
      "completionPercentage": 50.0,
      "completedLessons": 5,
      "totalLessons": 10
    }
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

**Error Response (Not Enrolled):**
```json
{
  "error": "Not enrolled in this course"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing courseId or lessonId)
- `401` - Not authenticated
- `403` - Not enrolled in course
- `404` - User not found
- `500` - Server error

---

#### GET /api/progress/:courseId
Get progress for a specific course.

**Authentication:** Required (user session)

**Path Parameters:**
- `courseId` - Course ID

**Success Response:**
```json
{
  "data": {
    "courseId": "course_abc123",
    "totalLessons": 10,
    "completedLessons": 5,
    "completionPercentage": 50.0,
    "lastLesson": "lesson_789",
    "timeSpent": 9000,
    "lessons": [
      {
        "lessonId": "lesson_789",
        "completed": true,
        "timeSpent": 1800,
        "lastPosition": 0,
        "timestamp": "2024-01-15T10:40:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `403` - Not enrolled in course
- `404` - Course not found
- `500` - Server error

---

### Courses

#### GET /api/courses
Get list of all courses.

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- `category` - Filter by category slug
- `level` - Filter by level (beginner, intermediate, advanced)
- `featured` - Filter featured courses (true/false)
- `search` - Search by title or description

**Success Response:**
```json
{
  "data": [
    {
      "id": "course_abc123",
      "title": "Web Development Bootcamp",
      "slug": "web-development-bootcamp",
      "summary": "Learn full-stack web development",
      "priceCents": 9900,
      "currency": "INR",
      "published": true,
      "featured": true,
      "level": "beginner",
      "durationMin": 3600,
      "rating": 4.8,
      "thumbnailUrl": "https://...",
      "instructor": {
        "id": "inst_123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "category": {
        "id": "cat_456",
        "name": "Web Development",
        "slug": "web-development"
      },
      "_count": {
        "enrollments": 1250
      }
    }
  ],
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Payments

#### POST /api/payments/stripe/checkout
Create a Stripe checkout session for course purchase.

**Authentication:** Required (user session)

**Request Body:**
```json
{
  "purchaseId": "pur_def456",
  "successUrl": "https://yourdomain.com/courses/web-development-bootcamp?success=true",
  "cancelUrl": "https://yourdomain.com/courses/web-development-bootcamp?canceled=true"
}
```

**Success Response:**
```json
{
  "sessionId": "cs_test_abc123",
  "url": "https://checkout.stripe.com/pay/cs_test_abc123"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid purchase ID
- `401` - Not authenticated
- `404` - Purchase not found
- `500` - Server error

---

### Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Authentication:** Stripe signature verification

**Headers Required:**
```
stripe-signature: <stripe-signature>
```

**Request Body:** Stripe event payload

**Handled Events:**
- `checkout.session.completed` - Complete purchase and create enrollment

**Success Response:**
```json
{
  "received": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid signature or event
- `500` - Server error

---

## Admin API Endpoints

All admin endpoints require API key authentication and are rate-limited separately.

### Students

#### GET /api/admin/students
List all students with pagination and search.

**Authentication:** Required (API key)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by name or email
- `sortBy` - Sort field: name, email, createdAt (default: createdAt)
- `sortOrder` - Sort order: asc, desc (default: desc)

**Success Response:**
```json
{
  "data": {
    "students": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "name": "John Doe",
        "image": "https://...",
        "role": "STUDENT",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-15T10:00:00.000Z",
        "_count": {
          "enrollments": 3
        },
        "lastUpdatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2024-01-15T11:30:00.000Z",
  "requestId": "req_abc123"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `401` - Invalid API key
- `403` - Invalid signature
- `429` - Rate limit exceeded
- `500` - Server error

---

#### GET /api/admin/students/:id
Get detailed information for a specific student.

**Authentication:** Required (API key)

**Path Parameters:**
- `id` - User ID

**Success Response:**
```json
{
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://...",
      "role": "STUDENT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:00:00.000Z"
    },
    "enrollments": [
      {
        "id": "enr_xyz789",
        "courseId": "course_abc123",
        "enrolledAt": "2024-01-10T00:00:00.000Z",
        "completionPercentage": 45.5,
        "status": "ACTIVE",
        "course": {
          "title": "Web Development Bootcamp",
          "slug": "web-development-bootcamp"
        }
      }
    ],
    "stats": {
      "totalEnrollments": 3,
      "completedCourses": 1,
      "totalTimeSpent": 27000,
      "averageProgress": 62.3
    }
  },
  "timestamp": "2024-01-15T11:35:00.000Z",
  "requestId": "req_def456"
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid API key
- `403` - Invalid signature
- `404` - Student not found
- `429` - Rate limit exceeded
- `500` - Server error

---

### Enrollments (Admin)

#### POST /api/admin/enrollments
Create an enrollment for a student (admin action).

**Authentication:** Required (API key)

**Request Body:**
```json
{
  "userId": "user_123",
  "courseId": "course_abc123",
  "source": "admin"
}
```

**Success Response:**
```json
{
  "data": {
    "success": true,
    "enrollment": {
      "id": "enr_xyz789",
      "userId": "user_123",
      "courseId": "course_abc123",
      "enrolledAt": "2024-01-15T11:40:00.000Z",
      "status": "ACTIVE",
      "source": "admin"
    }
  },
  "timestamp": "2024-01-15T11:40:00.000Z",
  "requestId": "req_ghi789"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid request or already enrolled
- `401` - Invalid API key
- `403` - Invalid signature
- `404` - User or course not found
- `429` - Rate limit exceeded
- `500` - Server error

---

#### DELETE /api/admin/enrollments/:id
Remove an enrollment (admin action).

**Authentication:** Required (API key)

**Path Parameters:**
- `id` - Enrollment ID

**Success Response:**
```json
{
  "data": {
    "success": true,
    "message": "Enrollment removed successfully"
  },
  "timestamp": "2024-01-15T11:45:00.000Z",
  "requestId": "req_jkl012"
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid API key
- `403` - Invalid signature
- `404` - Enrollment not found
- `429` - Rate limit exceeded
- `500` - Server error

---

### Analytics (Admin)

#### GET /api/admin/analytics/enrollments
Get enrollment statistics.

**Authentication:** Required (API key)

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `courseId` - Filter by course (optional)

**Success Response:**
```json
{
  "data": {
    "totalEnrollments": 1250,
    "activeEnrollments": 980,
    "completedEnrollments": 270,
    "enrollmentsByMonth": {
      "2024-01": 150,
      "2024-02": 200,
      "2024-03": 180
    },
    "topCourses": [
      {
        "courseId": "course_abc123",
        "title": "Web Development Bootcamp",
        "enrollments": 450
      }
    ]
  },
  "timestamp": "2024-01-15T12:00:00.000Z",
  "requestId": "req_mno345"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid date range
- `401` - Invalid API key
- `403` - Invalid signature
- `429` - Rate limit exceeded
- `500` - Server error

---

#### GET /api/admin/analytics/students
Get student statistics.

**Authentication:** Required (API key)

**Success Response:**
```json
{
  "data": {
    "totalStudents": 850,
    "activeStudents": 620,
    "newStudentsThisMonth": 45,
    "averageCoursesPerStudent": 2.3,
    "averageCompletionRate": 68.5
  },
  "timestamp": "2024-01-15T12:05:00.000Z",
  "requestId": "req_pqr678"
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid API key
- `403` - Invalid signature
- `429` - Rate limit exceeded
- `500` - Server error

---

### Audit Logs (Admin)

#### GET /api/admin/audit-logs
Get audit logs with filtering.

**Authentication:** Required (API key)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 200)
- `action` - Filter by action type
- `userId` - Filter by user ID
- `resourceType` - Filter by resource type
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Success Response:**
```json
{
  "data": {
    "logs": [
      {
        "id": "log_abc123",
        "userId": "user_123",
        "action": "enrollment_created",
        "resourceType": "enrollment",
        "resourceId": "enr_xyz789",
        "details": {
          "courseId": "course_abc123",
          "source": "free"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5000,
      "totalPages": 100,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2024-01-15T12:10:00.000Z",
  "requestId": "req_stu901"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `401` - Invalid API key
- `403` - Invalid signature
- `429` - Rate limit exceeded
- `500` - Server error

---

## Data Synchronization

### Webhook Events

The system emits webhook events for data synchronization between applications.

#### POST /api/webhooks/enrollment-changed
Notifies when an enrollment is created, updated, or deleted.

**Authentication:** Webhook signature verification

**Request Body:**
```json
{
  "event": "enrollment.created" | "enrollment.updated" | "enrollment.deleted",
  "enrollmentId": "enr_xyz789",
  "data": {
    "id": "enr_xyz789",
    "userId": "user_123",
    "courseId": "course_abc123",
    "status": "ACTIVE"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

#### POST /api/webhooks/profile-updated
Notifies when a user profile is updated.

**Authentication:** Webhook signature verification

**Request Body:**
```json
{
  "event": "profile.updated",
  "userId": "user_123",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://...",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## Code Examples

### JavaScript/TypeScript

#### Making an authenticated request
```typescript
// User endpoint (with session cookie)
const response = await fetch('/api/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    courseId: 'course_abc123',
    courseSlug: 'web-development-bootcamp',
  }),
  credentials: 'include', // Include session cookie
})

const data = await response.json()
```

#### Admin API request with signature
```typescript
import crypto from 'crypto'

const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET
const method = 'GET'
const path = '/api/admin/students'
const timestamp = Date.now().toString()
const body = ''

// Generate signature
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(`${method}${path}${timestamp}${body}`)
  .digest('hex')

const response = await fetch(`https://yourdomain.com${path}`, {
  method,
  headers: {
    'X-API-Key': apiKey,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
  },
})

const data = await response.json()
```

### cURL

#### User enrollment
```bash
curl -X POST https://yourdomain.com/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<session-token>" \
  -d '{
    "courseId": "course_abc123",
    "courseSlug": "web-development-bootcamp"
  }'
```

#### Admin API request
```bash
API_KEY="your-api-key"
API_SECRET="your-api-secret"
METHOD="GET"
PATH="/api/admin/students"
TIMESTAMP=$(date +%s)
BODY=""

SIGNATURE=$(echo -n "${METHOD}${PATH}${TIMESTAMP}${BODY}" | \
  openssl dgst -sha256 -hmac "${API_SECRET}" | \
  awk '{print $2}')

curl -X GET "https://yourdomain.com${PATH}?page=1&limit=20" \
  -H "X-API-Key: ${API_KEY}" \
  -H "X-Signature: ${SIGNATURE}" \
  -H "X-Timestamp: ${TIMESTAMP}"
```

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API documentation
- All core endpoints documented
- Authentication and security guidelines added
- Code examples provided

---

## Support

For API support or questions:
- Email: api-support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Status Page: https://status.yourdomain.com
