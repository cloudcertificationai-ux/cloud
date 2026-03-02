# Media Upload Usage Guide

This guide demonstrates how to use the media upload functionality in the admin panel.

## Quick Start

### 1. Basic MediaUploader Component

Use the `MediaUploader` component for simple file uploads:

```tsx
'use client';

import { MediaUploader } from '@/components/MediaUploader';
import { useState } from 'react';

export default function MyPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  return (
    <div>
      <MediaUploader
        courseId="course-123"
        acceptedTypes={['image/*', 'video/*']}
        maxSizeMB={100}
        onUploadComplete={(cdnUrl, key) => {
          console.log('Uploaded:', cdnUrl);
          setUploadedUrl(cdnUrl);
        }}
        onUploadError={(error) => {
          console.error('Upload failed:', error);
        }}
        label="Upload Course Thumbnail"
        description="Drag and drop an image or video"
      />

      {uploadedUrl && (
        <div className="mt-4">
          <p>Uploaded URL: {uploadedUrl}</p>
          <img src={uploadedUrl} alt="Uploaded" className="w-64 h-64 object-cover" />
        </div>
      )}
    </div>
  );
}
```

### 2. Full MediaManager Component

Use the `MediaManager` component for comprehensive media management with library:

```tsx
'use client';

import { MediaManager } from '@/components/MediaManager';
import { useState } from 'react';

export default function CourseMediaPage() {
  const [selectedMedia, setSelectedMedia] = useState<string>('');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Course Media</h1>

      <MediaManager
        courseId="course-123"
        onMediaSelect={(url) => {
          console.log('Selected media:', url);
          setSelectedMedia(url);
        }}
        allowedTypes={['video', 'image', 'pdf']}
        showLibrary={true}
      />

      {selectedMedia && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="font-medium">Selected Media:</p>
          <p className="text-sm text-gray-600 break-all">{selectedMedia}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Using the useMediaUpload Hook Directly

For custom upload flows, use the `useMediaUpload` hook:

```tsx
'use client';

import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useRef } from 'react';

export default function CustomUploadPage() {
  const { upload, isUploading, progress, error, reset } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload(file, 'course-123');
      console.log('Upload successful:', result.cdnUrl);
      alert(`File uploaded: ${result.cdnUrl}`);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="p-6">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {isUploading && progress && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-sm mt-2">Uploading: {progress.percentage}%</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
          <p>{error.message}</p>
          <button
            onClick={reset}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
```

## Integration with Course Form

### Example: Course Thumbnail Upload

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MediaUploader } from '@/components/MediaUploader';

const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  thumbnailUrl: z.string().url().optional(),
  // ... other fields
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CourseForm() {
  const { register, handleSubmit, setValue, watch } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const thumbnailUrl = watch('thumbnailUrl');

  const onSubmit = async (data: CourseFormData) => {
    console.log('Submitting course:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          {...register('title')}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Slug</label>
        <input
          {...register('slug')}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <MediaUploader
          courseId="new-course"
          acceptedTypes={['image/*']}
          maxSizeMB={10}
          onUploadComplete={(cdnUrl) => {
            setValue('thumbnailUrl', cdnUrl);
          }}
          label="Course Thumbnail"
          description="Upload a thumbnail image (max 10 MB)"
        />

        {thumbnailUrl && (
          <div className="mt-4">
            <img
              src={thumbnailUrl}
              alt="Thumbnail preview"
              className="w-64 h-36 object-cover rounded"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Course
      </button>
    </form>
  );
}
```

### Example: Video Lesson Upload

```tsx
'use client';

import { MediaUploader } from '@/components/MediaUploader';
import { useState } from 'react';

export default function VideoLessonForm() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [lessonData, setLessonData] = useState({
    title: '',
    videoUrl: '',
    duration: 0,
  });

  const handleVideoUpload = (cdnUrl: string) => {
    setVideoUrl(cdnUrl);
    setLessonData((prev) => ({ ...prev, videoUrl: cdnUrl }));
  };

  const handleSubmit = async () => {
    // Submit lesson data to API
    console.log('Creating lesson:', lessonData);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Lesson Title</label>
        <input
          value={lessonData.title}
          onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <MediaUploader
        courseId="course-123"
        acceptedTypes={['video/*']}
        maxSizeMB={500}
        onUploadComplete={handleVideoUpload}
        label="Video Content"
        description="Upload lesson video (max 500 MB)"
      />

      {videoUrl && (
        <div className="mt-4">
          <video src={videoUrl} controls className="w-full max-w-2xl" />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!lessonData.title || !lessonData.videoUrl}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Create Lesson
      </button>
    </div>
  );
}
```

## API Reference

### MediaUploader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `courseId` | `string` | Required | Course ID for organizing uploads |
| `acceptedTypes` | `string[]` | `['image/*', 'video/*', 'application/pdf', 'model/*']` | Accepted MIME types |
| `maxSizeMB` | `number` | `500` | Maximum file size in MB |
| `onUploadComplete` | `(cdnUrl: string, key: string) => void` | Required | Callback when upload succeeds |
| `onUploadError` | `(error: UploadError) => void` | Optional | Callback when upload fails |
| `label` | `string` | `'Upload Media'` | Label text |
| `description` | `string` | `'Drag and drop...'` | Description text |

### MediaManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `courseId` | `string` | Required | Course ID for organizing uploads |
| `onMediaSelect` | `(mediaUrl: string) => void` | Optional | Callback when media is selected |
| `allowedTypes` | `Array<'video' \| 'pdf' \| 'image' \| '3d-model'>` | `['video', 'pdf', 'image', '3d-model']` | Allowed media types |
| `showLibrary` | `boolean` | `true` | Show media library |

### useMediaUpload Hook

Returns:

```typescript
{
  upload: (file: File, courseId: string) => Promise<UploadResult>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;
  reset: () => void;
}
```

Types:

```typescript
interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  cdnUrl: string;
  key: string;
}

interface UploadError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
```

## File Size Limits

Default limits by media type:

- **Video**: 500 MB
- **PDF**: 50 MB
- **Image**: 10 MB
- **3D Model**: 100 MB

These can be customized in `src/lib/s3-config.ts`:

```typescript
export const UPLOAD_CONSTRAINTS = {
  maxFileSize: {
    video: 500 * 1024 * 1024,
    pdf: 50 * 1024 * 1024,
    image: 10 * 1024 * 1024,
    '3d-model': 100 * 1024 * 1024,
  },
  // ...
};
```

## Supported File Types

### Video
- `video/mp4`
- `video/webm`
- `video/ogg`

### PDF
- `application/pdf`

### Image
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### 3D Model
- `model/gltf-binary` (.glb)
- `model/gltf+json` (.gltf)
- `application/octet-stream` (fallback)

## Error Handling

The upload system handles various error scenarios:

### Validation Errors
- File too large
- Invalid file type
- Missing required fields

### Network Errors
- Connection timeout
- Network failure
- S3 upload failure

### Retry Logic
- Automatic retry on network errors (up to 3 attempts)
- Exponential backoff between retries
- Manual retry button on failure

## Testing

### Manual Testing Checklist

1. **Upload Success**
   - [ ] Upload image file
   - [ ] Upload video file
   - [ ] Upload PDF file
   - [ ] Verify file appears in S3 bucket
   - [ ] Verify CDN URL is accessible

2. **Validation**
   - [ ] Try uploading file larger than limit
   - [ ] Try uploading unsupported file type
   - [ ] Verify error messages are clear

3. **Progress Tracking**
   - [ ] Verify progress bar updates during upload
   - [ ] Verify percentage is accurate

4. **Error Handling**
   - [ ] Disconnect network during upload
   - [ ] Verify retry logic works
   - [ ] Verify error messages display correctly

5. **Drag and Drop**
   - [ ] Drag file over upload area
   - [ ] Verify visual feedback
   - [ ] Drop file and verify upload starts

## Troubleshooting

### Upload fails immediately
- Check S3 environment variables are set
- Verify AWS credentials are valid
- Check S3 bucket exists and is accessible

### Upload fails during transfer
- Check network connection
- Verify S3 bucket CORS configuration
- Check file size is within limits

### CDN URL not accessible
- Verify S3 bucket policy allows public read
- Check CDN domain configuration
- Verify file was uploaded successfully

### Progress not updating
- Check browser console for errors
- Verify XMLHttpRequest is supported
- Check for CORS issues

## Next Steps

1. Set up AWS S3 bucket (see `S3_SETUP_GUIDE.md`)
2. Configure environment variables
3. Test upload functionality
4. Integrate with course creation forms
5. Implement media library persistence (optional)
