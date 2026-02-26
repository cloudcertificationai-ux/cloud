/**
 * Media Upload API Endpoint
 * 
 * POST /api/admin/media/upload
 * 
 * Generates presigned R2 upload URLs for course media assets.
 * Validates file type and size before generating upload URL.
 * Returns both the presigned upload URL and the final public URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import {
  r2Client,
  R2_CONFIG,
  UPLOAD_CONSTRAINTS,
  MediaType,
  validateFileSize,
  validateMimeType,
  generateR2Key,
  getPublicUrl,
  getMediaType,
} from '@/lib/r2-config';

// Request validation schema
const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  courseId: z.string().min(1),
});

type UploadRequest = z.infer<typeof uploadRequestSchema>;

// Response type
interface UploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

// Error response type
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
  };
}

/**
 * POST /api/admin/media/upload
 * 
 * Generate presigned R2 upload URL
 */
export async function POST(request: NextRequest) {
  try {
    // Check R2 configuration
    if (!R2_CONFIG.bucket || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'R2_NOT_CONFIGURED',
            message: 'R2 storage is not configured. Please set up Cloudflare R2 credentials and bucket name.',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = uploadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid upload request',
            details: errors as Record<string, string[]>,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const { filename, mimeType, fileSize, courseId }: UploadRequest = validationResult.data;

    // Determine media type from mime type
    const mediaType = getMediaType(mimeType);
    if (!mediaType) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `File type '${mimeType}' is not supported`,
            details: {
              allowedTypes: [
                'Supported types: video/mp4, video/webm, application/pdf, image/jpeg, image/png, image/webp, model/gltf-binary',
              ],
            },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!validateMimeType(mimeType, mediaType)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'INVALID_MIME_TYPE',
            message: `MIME type '${mimeType}' is not allowed for ${mediaType} files`,
            details: {
              allowedMimeTypes: [...UPLOAD_CONSTRAINTS.allowedMimeTypes[mediaType]],
            },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(fileSize, mediaType)) {
      const maxSizeMB = UPLOAD_CONSTRAINTS.maxFileSize[mediaType] / (1024 * 1024);
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds maximum allowed size for ${mediaType} files`,
            details: {
              maxSize: [`Maximum size: ${maxSizeMB} MB`],
              providedSize: [`Provided size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`],
            },
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Generate R2 key
    const key = generateR2Key(courseId, mediaType, filename);

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
      ContentType: mimeType,
      ContentLength: fileSize,
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: UPLOAD_CONSTRAINTS.presignedUrlExpiry,
    });

    // Generate public URL
    const publicUrl = getPublicUrl(key);

    // Return response
    const response: UploadResponse = {
      uploadUrl,
      publicUrl,
      key,
      expiresIn: UPLOAD_CONSTRAINTS.presignedUrlExpiry,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Media upload error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
