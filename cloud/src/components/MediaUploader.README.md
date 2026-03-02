# MediaUploader Component

A React component for uploading media files to the VOD Media System with drag-and-drop support, file validation, progress tracking, and transcoding status monitoring.

## Features

- ✅ **Drag-and-drop zone** - Intuitive file upload interface
- ✅ **File validation** - Validates file type and size before upload
- ✅ **Progress tracking** - Real-time upload progress with percentage
- ✅ **Transcoding status** - Monitors video transcoding progress
- ✅ **Thumbnail preview** - Shows video thumbnail after successful upload
- ✅ **Error handling** - User-friendly error messages with retry option
- ✅ **Direct R2 upload** - Files upload directly to Cloudflare R2 (no server bandwidth)

## Requirements

Implements requirements from VOD Media System specification:
- **14.1**: Drag-and-drop zone
- **14.2**: File type and size validation
- **14.3**: Upload progress tracking
- **14.4**: Success message with thumbnail preview
- **14.5**: Error message with retry
- **14.6**: Transcoding status display

## Usage

### Basic Usage

```tsx
import { MediaUploader } from '@/components/MediaUploader';

function MyPage() {
  return (
    <MediaUploader
      onUploadComplete={(mediaId, media) => {
        console.log('Upload complete:', mediaId);
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error);
      }}
    />
  );
}
```

### With Form Integration

```tsx
import { MediaUploader } from '@/components/MediaUploader';
import { useState } from 'react';

function LessonForm() {
  const [mediaId, setMediaId] = useState<string>('');

  const handleSubmit = async () => {
    // Use mediaId in lesson creation
    await createLesson({ title: 'My Lesson', mediaId });
  };

  return (
    <form onSubmit={handleSubmit}>
      <MediaUploader
        onUploadComplete={(id) => setMediaId(id)}
      />
      <button type="submit" disabled={!mediaId}>
        Create Lesson
      </button>
    </form>
  );
}
```

## Props

### `onUploadComplete?: (mediaId: string, media: MediaInfo) => void`

Callback fired when upload and processing complete successfully.

**Parameters:**
- `mediaId` - The unique ID of the uploaded media
- `media` - Media information object containing:
  - `id` - Media ID
  - `originalName` - Original filename
  - `status` - Current status (UPLOADED, PROCESSING, READY, FAILED)
  - `mimeType` - File MIME type
  - `thumbnails` - Array of thumbnail URLs (for videos)

### `onUploadError?: (error: UploadError) => void`

Callback fired when upload or validation fails.

**Parameters:**
- `error` - Error object containing:
  - `code` - Machine-readable error code
  - `message` - Human-readable error message
  - `details` - Optional additional error details

### `className?: string`

Optional CSS class name for the container div.

## File Type Support

The component accepts the following file types:

### Videos (max 5GB)
- MP4 (`video/mp4`)
- MOV (`video/quicktime`)
- AVI (`video/x-msvideo`)

### Documents (max 100MB)
- PDF (`application/pdf`)

### Images (max 50MB)
- PNG (`image/png`)
- JPEG (`image/jpeg`)

### 3D Models (max 50MB)
- GLB (`model/gltf-binary`)
- GLTF (`model/gltf+json`)

## Upload Flow

1. **File Selection** - User drags file or clicks to select
2. **Validation** - File type and size validated client-side
3. **Presigned URL** - Request presigned upload URL from API
4. **R2 Upload** - File uploaded directly to Cloudflare R2
5. **Completion** - Notify API that upload is complete
6. **Transcoding** (videos only) - Monitor transcoding status
7. **Success** - Display thumbnail and media ID

## States

The component has 5 states:

- **idle** - Waiting for file selection
- **uploading** - File is being uploaded to R2
- **processing** - Video is being transcoded (videos only)
- **success** - Upload and processing complete
- **error** - Upload or validation failed

## Error Codes

- `INVALID_FILE_TYPE` - File type not allowed
- `FILE_TOO_LARGE` - File exceeds size limit
- `UPLOAD_FAILED` - Upload to R2 failed
- `TRANSCODE_FAILED` - Video transcoding failed

## Environment Variables

The component requires the following environment variable:

```env
NEXT_PUBLIC_MAIN_APP_URL=http://localhost:3000
```

This should point to the main application (anywheredoor) where the VOD Media System API endpoints are hosted.

## API Endpoints

The component calls these endpoints on the main application:

- `POST /api/admin/media/presign` - Get presigned upload URL
- `POST /api/admin/media/complete` - Notify upload completion
- `GET /api/admin/media?id={mediaId}` - Poll transcoding status

## Styling

The component uses Tailwind CSS classes and is fully responsive. It includes:

- Drag-and-drop visual feedback
- Progress bar animation
- State-based color coding (blue=uploading, green=success, red=error)
- Loading spinner for processing state
- Thumbnail preview for successful uploads

## Accessibility

- Keyboard accessible (click to open file picker)
- Screen reader friendly labels
- Clear error messages
- Visual state indicators

## Browser Support

- Modern browsers with File API support
- XMLHttpRequest Level 2 for progress tracking
- Drag and Drop API support

## Notes

- Files are uploaded directly to Cloudflare R2 (no server bandwidth used)
- Videos are automatically transcoded to HLS format
- Transcoding status is polled every 3 seconds
- Polling stops when status is READY or FAILED
- Component cleans up polling interval on unmount
