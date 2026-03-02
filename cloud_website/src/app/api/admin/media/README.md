# Admin Media API Endpoints

This directory contains the admin API endpoints for managing media uploads in the VOD Media System.

## Endpoints

### POST /api/admin/media/presign
Generate a presigned upload URL for media files.

**Authentication:** Required (Admin or Instructor role)

**Request Body:**
```json
{
  "fileName": "video.mp4",
  "fileType": "video/mp4",
  "fileSize": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2.example.com/presigned-url",
    "mediaId": "media-123",
    "expiresAt": "2024-01-01T12:15:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Validation:**
- File type must be one of: MP4, MOV, AVI, PDF, PNG, JPG, GLB, GLTF
- File size limits:
  - Videos: 5GB
  - Documents: 100MB
  - Images: 50MB
  - 3D Models: 50MB

---

### POST /api/admin/media/complete
Notify completion of media upload and trigger transcoding for videos.

**Authentication:** Required (Admin or Instructor role)

**Request Body:**
```json
{
  "mediaId": "media-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media-123",
    "originalName": "video.mp4",
    "r2Key": "media/media-123/video.mp4",
    "status": "PROCESSING",
    "mimeType": "video/mp4",
    "fileSize": "1000000",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Notes:**
- For video files, status will be set to "PROCESSING" and transcoding job will be enqueued
- For non-video files, status will be set to "READY" immediately

---

### GET /api/admin/media
List media with pagination and filtering.

**Authentication:** Required (Admin or Instructor role)

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page
- `status` (optional): Filter by status (UPLOADED, PROCESSING, READY, FAILED)
- `type` (optional): Filter by MIME type prefix (e.g., "video", "image")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "media-123",
      "originalName": "video.mp4",
      "r2Key": "media/media-123/video.mp4",
      "manifestUrl": "https://cdn.example.com/media/media-123/master.m3u8",
      "thumbnails": ["thumb1.jpg", "thumb2.jpg"],
      "duration": 120,
      "width": 1920,
      "height": 1080,
      "fileSize": "1000000",
      "mimeType": "video/mp4",
      "status": "READY",
      "metadata": {},
      "uploadedBy": "user-123",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### DELETE /api/admin/media/[id]
Delete media and cleanup R2 objects.

**Authentication:** Required (Admin or Instructor role)

**Response:**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Notes:**
- Deletes the media record from the database
- Deletes all associated R2 objects (original file, HLS segments, manifests, thumbnails)
- Invalidates Redis cache

---

### PATCH /api/admin/media/[id]
Update media metadata.

**Authentication:** Required (Admin or Instructor role)

**Request Body:**
```json
{
  "originalName": "updated-video.mp4",
  "metadata": {
    "description": "Updated description"
  }
}
```

**Allowed Fields:**
- `originalName`
- `manifestUrl`
- `thumbnails`
- `duration`
- `width`
- `height`
- `status`
- `metadata`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media-123",
    "originalName": "updated-video.mp4",
    "r2Key": "media/media-123/video.mp4",
    "manifestUrl": "https://cdn.example.com/media/media-123/master.m3u8",
    "thumbnails": ["thumb1.jpg", "thumb2.jpg"],
    "duration": 120,
    "width": 1920,
    "height": 1080,
    "fileSize": "1000000",
    "mimeType": "video/mp4",
    "status": "READY",
    "metadata": {
      "description": "Updated description"
    },
    "uploadedBy": "user-123",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:01:00Z"
  },
  "timestamp": "2024-01-01T12:01:00Z"
}
```

---

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": true,
  "message": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE"
}
```

### Common Error Codes:
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Insufficient permissions
- `VALIDATION_ERROR` (400): Invalid request data
- `MEDIA_NOT_FOUND` (404): Media not found
- `PRESIGN_GENERATION_FAILED` (500): Failed to generate presigned URL
- `UPLOAD_COMPLETION_FAILED` (500): Failed to complete upload
- `MEDIA_LIST_FAILED` (500): Failed to list media
- `MEDIA_DELETE_FAILED` (500): Failed to delete media
- `MEDIA_UPDATE_FAILED` (500): Failed to update media

---

## Authorization

All endpoints require:
1. Valid NextAuth session
2. User role must be either `ADMIN` or `INSTRUCTOR`

Students and unauthenticated users will receive 401 or 403 errors.

---

## Implementation Details

- **Service Layer:** Uses `MediaService` from `@/lib/media-service`
- **Storage:** Cloudflare R2 (S3-compatible)
- **Caching:** Redis for media metadata (1-hour TTL)
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** NextAuth with Auth0

---

## Testing

Unit tests are located in `__tests__/admin-media-api.test.ts`.

To run tests:
```bash
npm test -- admin-media-api.test.ts
```

---

## Related Files

- Service: `anywheredoor/src/lib/media-service.ts`
- R2 Client: `anywheredoor/src/lib/r2-client.ts`
- Database Schema: `anywheredoor/prisma/schema.prisma`
- Error Utilities: `anywheredoor/src/lib/api-errors.ts`
