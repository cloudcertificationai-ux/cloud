/**
 * JSON Serialization Helpers
 * 
 * Utilities for handling special types like BigInt in JSON responses
 */

/**
 * Convert BigInt fields to strings for JSON serialization
 */
export function serializeBigInt<T extends Record<string, any>>(obj: T): T {
  const serialized = { ...obj };
  
  for (const key in serialized) {
    if (typeof serialized[key] === 'bigint') {
      serialized[key] = serialized[key].toString() as any;
    } else if (serialized[key] && typeof serialized[key] === 'object' && !Array.isArray(serialized[key])) {
      serialized[key] = serializeBigInt(serialized[key]);
    } else if (Array.isArray(serialized[key])) {
      serialized[key] = serialized[key].map((item: any) => 
        typeof item === 'object' ? serializeBigInt(item) : item
      ) as any;
    }
  }
  
  return serialized;
}

/**
 * Serialize media object for JSON response
 */
export function serializeMedia(media: any) {
  return {
    ...media,
    fileSize: media.fileSize?.toString() || '0',
  };
}

/**
 * Serialize array of media objects for JSON response
 */
export function serializeMediaArray(mediaArray: any[]) {
  return mediaArray.map(serializeMedia);
}
