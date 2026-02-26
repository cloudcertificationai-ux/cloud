/**
 * Cloudflare R2 Configuration for Media Upload
 * 
 * This module configures the R2 client for uploading course media assets
 * (videos, PDFs, images, 3D models) to Cloudflare R2 storage.
 */

import { S3Client } from '@aws-sdk/client-s3';

// Validate required environment variables
const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_DOMAIN',
] as const;

function validateEnvVars() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing R2 environment variables: ${missing.join(', ')}. ` +
      'Media upload functionality will not work until these are configured.'
    );
  }
}

// Validate on module load
validateEnvVars();

// R2 Client Configuration (using S3-compatible API)
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ACCOUNT_ID 
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// R2 Bucket Configuration
export const R2_CONFIG = {
  bucket: process.env.R2_BUCKET_NAME || '',
  accountId: process.env.R2_ACCOUNT_ID || '',
  publicDomain: process.env.R2_PUBLIC_DOMAIN || '',
} as const;

// File Upload Constraints
export const UPLOAD_CONSTRAINTS = {
  maxFileSize: {
    video: 500 * 1024 * 1024, // 500 MB
    pdf: 50 * 1024 * 1024, // 50 MB
    image: 10 * 1024 * 1024, // 10 MB
    '3d-model': 100 * 1024 * 1024, // 100 MB
  },
  allowedMimeTypes: {
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    '3d-model': ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
  },
  presignedUrlExpiry: 3600, // 1 hour in seconds
} as const;

// Media type definitions
export type MediaType = 'video' | 'pdf' | 'image' | '3d-model';

// Helper to get file extension from mime type
export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'model/gltf-binary': 'glb',
    'model/gltf+json': 'gltf',
    'application/octet-stream': 'glb', // Default for 3D models
  };

  return mimeToExt[mimeType] || 'bin';
}

// Helper to determine media type from mime type
export function getMediaType(mimeType: string): MediaType | null {
  for (const [type, mimeTypes] of Object.entries(UPLOAD_CONSTRAINTS.allowedMimeTypes)) {
    if ((mimeTypes as readonly string[]).includes(mimeType)) {
      return type as MediaType;
    }
  }
  return null;
}

// Helper to validate file size
export function validateFileSize(size: number, mediaType: MediaType): boolean {
  const maxSize = UPLOAD_CONSTRAINTS.maxFileSize[mediaType];
  return size <= maxSize;
}

// Helper to validate mime type
export function validateMimeType(mimeType: string, mediaType: MediaType): boolean {
  const allowedTypes = UPLOAD_CONSTRAINTS.allowedMimeTypes[mediaType] as readonly string[];
  return allowedTypes.includes(mimeType);
}

// Generate R2 object key for uploaded file
export function generateR2Key(courseId: string, mediaType: MediaType, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `courses/${courseId}/${mediaType}/${timestamp}-${sanitizedFilename}`;
}

// Get public URL from R2 key
export function getPublicUrl(key: string): string {
  if (R2_CONFIG.publicDomain) {
    return `${R2_CONFIG.publicDomain}/${key}`;
  }
  // Fallback to bucket name (requires public bucket or custom domain)
  console.warn('R2_PUBLIC_DOMAIN not configured. Using bucket name as fallback.');
  return `https://${R2_CONFIG.bucket}/${key}`;
}
