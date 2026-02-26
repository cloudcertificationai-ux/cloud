/**
 * HLS manifest validation and fallback utilities
 */

export interface ManifestValidationResult {
  isValid: boolean;
  error?: string;
  fallbackUrl?: string;
}

/**
 * Validate HLS manifest content
 */
export function validateManifest(manifestContent: string): boolean {
  if (!manifestContent || manifestContent.trim().length === 0) {
    return false;
  }

  // Check for required HLS manifest markers
  const hasM3U8Header = manifestContent.includes('#EXTM3U');
  
  if (!hasM3U8Header) {
    return false;
  }

  // Check for either master playlist or media playlist markers
  const isMasterPlaylist = manifestContent.includes('#EXT-X-STREAM-INF');
  const isMediaPlaylist = manifestContent.includes('#EXTINF');

  if (!isMasterPlaylist && !isMediaPlaylist) {
    return false;
  }

  // Check for common corruption indicators
  const hasNullBytes = manifestContent.includes('\0');
  const hasInvalidChars = /[^\x20-\x7E\n\r\t]/.test(manifestContent);

  if (hasNullBytes || hasInvalidChars) {
    return false;
  }

  return true;
}

/**
 * Parse manifest and detect corruption
 */
export function parseManifest(manifestContent: string): ManifestValidationResult {
  try {
    // Validate basic structure
    if (!validateManifest(manifestContent)) {
      return {
        isValid: false,
        error: 'Invalid or corrupted manifest structure',
      };
    }

    // Additional validation: check for valid URLs
    const lines = manifestContent.split('\n');
    let hasValidUrls = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed.length === 0) {
        continue;
      }

      // Check if line looks like a valid URL or path
      if (trimmed.includes('.m3u8') || trimmed.includes('.ts')) {
        hasValidUrls = true;
        break;
      }
    }

    if (!hasValidUrls) {
      return {
        isValid: false,
        error: 'Manifest contains no valid segment references',
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };
  }
}

/**
 * Get fallback URL for corrupted manifest
 */
export function getFallbackUrl(media: {
  r2Key: string;
  manifestUrl?: string | null;
}): string | null {
  // Extract original file from r2Key
  // Format: media/{mediaId}/{originalFileName}
  const parts = media.r2Key.split('/');
  
  if (parts.length < 3) {
    return null;
  }

  const mediaId = parts[1];
  const originalFileName = parts[2];

  // Construct public URL for original file
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_DOMAIN;
  
  if (!publicDomain) {
    console.error('R2_PUBLIC_DOMAIN not configured');
    return null;
  }

  return `https://${publicDomain}/media/${mediaId}/${originalFileName}`;
}

/**
 * Validate manifest and provide fallback if corrupted
 */
export async function validateManifestWithFallback(
  manifestUrl: string,
  media: { r2Key: string; manifestUrl?: string | null }
): Promise<ManifestValidationResult> {
  try {
    // Fetch manifest content
    const response = await fetch(manifestUrl);
    
    if (!response.ok) {
      return {
        isValid: false,
        error: `Failed to fetch manifest: ${response.status}`,
        fallbackUrl: getFallbackUrl(media) || undefined,
      };
    }

    const manifestContent = await response.text();

    // Validate manifest
    const validationResult = parseManifest(manifestContent);

    if (!validationResult.isValid) {
      return {
        ...validationResult,
        fallbackUrl: getFallbackUrl(media) || undefined,
      };
    }

    return validationResult;
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to validate manifest',
      fallbackUrl: getFallbackUrl(media) || undefined,
    };
  }
}
