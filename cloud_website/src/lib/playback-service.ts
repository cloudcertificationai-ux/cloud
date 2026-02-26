import prisma from '@/lib/db';
import { getR2Client } from '@/lib/r2-client';
import * as crypto from 'crypto';
import {
  logSignatureTampering,
  logInvalidSignature,
  logExpiredToken,
  logUserIdMismatch,
} from '@/lib/security-logger';

/**
 * PlaybackService handles secure video playback with enrollment verification
 * and Cloudflare signed URL generation
 */

interface GeneratePlaybackTokenParams {
  mediaId: string;
  userId: string;
  lessonId: string;
}

interface GeneratePlaybackTokenResult {
  signedUrl: string;
  expiresAt: Date;
}

/**
 * Verify that a user has an active enrollment in a course
 */
export async function verifyEnrollment(
  userId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    select: {
      status: true,
    },
  });

  return enrollment?.status === 'ACTIVE';
}

/**
 * Generate a signed playback token for a media resource
 * Verifies enrollment before generating the token
 */
export async function generatePlaybackToken(
  params: GeneratePlaybackTokenParams
): Promise<GeneratePlaybackTokenResult> {
  const { mediaId, userId, lessonId } = params;

  // Get lesson with course information
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      media: true,
    },
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  if (!lesson.media) {
    throw new Error('Media not found for lesson');
  }

  if (lesson.media.id !== mediaId) {
    throw new Error('Media ID does not match lesson');
  }

  const courseId = lesson.module.courseId;

  // Verify enrollment
  const isEnrolled = await verifyEnrollment(userId, courseId);
  if (!isEnrolled) {
    throw new Error('User is not enrolled in this course');
  }

  // Get the manifest URL or R2 key
  const manifestUrl = lesson.media.manifestUrl;
  if (!manifestUrl) {
    throw new Error('Media is not ready for playback');
  }

  // Generate signed URL with 5-minute expiration
  const expiresIn = 5 * 60; // 5 minutes in seconds
  const signedUrl = await signUrl(manifestUrl, expiresIn, userId);
  
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    signedUrl,
    expiresAt,
  };
}

/**
 * Sign a URL with Cloudflare signed URL format
 * Includes user ID binding and expiration timestamp
 */
export async function signUrl(
  url: string,
  expiresIn: number,
  userId: string
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const keyPairId = process.env.CLOUDFLARE_KEY_PAIR_ID;
  const privateKeyBase64 = process.env.CLOUDFLARE_PRIVATE_KEY;

  if (!accountId || !keyPairId || !privateKeyBase64) {
    // Fallback: If Cloudflare signed URLs are not configured, return the original URL
    // This allows the system to work without signed URLs in development
    console.warn(
      'Cloudflare signed URL configuration missing. Returning unsigned URL.'
    );
    return url;
  }

  // Calculate expiration timestamp
  const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

  // Parse the URL to add query parameters
  const urlObj = new URL(url);

  // Add expiration and user ID to query parameters
  urlObj.searchParams.set('exp', expirationTime.toString());
  urlObj.searchParams.set('uid', userId);

  // Create the string to sign (URL path + query parameters)
  const stringToSign = `${urlObj.pathname}${urlObj.search}`;

  // Decode the base64 private key
  const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');

  // Sign the string using RSA-SHA256
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  sign.end();

  const signature = sign.sign(privateKey, 'base64');

  // URL-safe base64 encoding
  const urlSafeSignature = signature
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Add signature and key pair ID to query parameters
  urlObj.searchParams.set('sig', urlSafeSignature);
  urlObj.searchParams.set('kid', keyPairId);

  return urlObj.toString();
}

/**
 * Rewrite HLS manifest to add signed tokens to segment URLs
 * This ensures all segments are also protected with signed URLs
 */
export async function rewriteManifest(
  manifestContent: string,
  userId: string
): Promise<string> {
  const expiresIn = 5 * 60; // 5 minutes

  // Split manifest into lines
  const lines = manifestContent.split('\n');
  const rewrittenLines: string[] = [];

  for (const line of lines) {
    // Check if line is a segment URL (doesn't start with #)
    if (line.trim() && !line.startsWith('#')) {
      // This is a URL line - sign it
      try {
        const signedUrl = await signUrl(line.trim(), expiresIn, userId);
        rewrittenLines.push(signedUrl);
      } catch (error) {
        console.error('Failed to sign segment URL:', error);
        // Keep original URL if signing fails
        rewrittenLines.push(line);
      }
    } else {
      // This is a comment or metadata line - keep as is
      rewrittenLines.push(line);
    }
  }

  return rewrittenLines.join('\n');
}

/**
 * Validate a signed URL signature
 * Used to verify incoming playback requests
 * Logs security events for invalid signatures (Requirement 16.5)
 */
export async function validateSignature(
  url: string,
  signature: string,
  userId: string,
  requestMetadata?: { ipAddress?: string; userAgent?: string }
): Promise<boolean> {
  const keyPairId = process.env.CLOUDFLARE_KEY_PAIR_ID;
  const privateKeyBase64 = process.env.CLOUDFLARE_PRIVATE_KEY;

  if (!keyPairId || !privateKeyBase64) {
    // If signing is not configured, allow access
    return true;
  }

  try {
    const urlObj = new URL(url);
    const exp = urlObj.searchParams.get('exp');
    const uid = urlObj.searchParams.get('uid');
    const sig = urlObj.searchParams.get('sig');
    const kid = urlObj.searchParams.get('kid');

    // Verify all required parameters are present
    if (!exp || !uid || !sig || !kid) {
      await logInvalidSignature(userId, {
        url,
        reason: 'Missing required signature parameters',
        ...requestMetadata,
      });
      return false;
    }

    // Verify user ID matches
    if (uid !== userId) {
      await logUserIdMismatch(userId, {
        expectedUserId: uid,
        url,
        ...requestMetadata,
      });
      return false;
    }

    // Verify key pair ID matches
    if (kid !== keyPairId) {
      await logInvalidSignature(userId, {
        url,
        reason: 'Key pair ID mismatch',
        ...requestMetadata,
      });
      return false;
    }

    // Verify expiration
    const expirationTime = parseInt(exp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > expirationTime) {
      await logExpiredToken(userId, {
        url,
        expirationTime,
        currentTime,
        ...requestMetadata,
      });
      return false;
    }

    // Verify signature
    const urlSafeSignature = sig;
    const base64Signature = urlSafeSignature
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Reconstruct the string that was signed
    const stringToSign = `${urlObj.pathname}?exp=${exp}&uid=${uid}`;

    // Verify the signature
    const privateKey = Buffer.from(privateKeyBase64, 'base64').toString(
      'utf-8'
    );
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(stringToSign);
    verify.end();

    const isValid = verify.verify(privateKey, base64Signature, 'base64');
    
    if (!isValid) {
      await logSignatureTampering(userId, {
        url,
        providedSignature: sig,
        ...requestMetadata,
      });
    }

    return isValid;
  } catch (error) {
    console.error('Signature validation error:', error);
    await logInvalidSignature(userId, {
      url,
      reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ...requestMetadata,
    });
    return false;
  }
}
