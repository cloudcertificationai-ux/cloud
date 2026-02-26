'use client';

/**
 * MediaManager Component
 * 
 * Comprehensive media management interface for course content.
 * Features:
 * - Drag-and-drop file upload
 * - Upload progress tracking
 * - Media library view
 * - File type filtering
 * - Error handling with retry
 */

import { useState, useCallback, useEffect } from 'react';
import { MediaUploader } from './MediaUploader';
import { UploadError } from '@/hooks/useMediaUpload';
import toast from 'react-hot-toast';

export interface MediaItem {
  id: string;
  url: string;
  key: string;
  type: 'video' | 'pdf' | 'image' | '3d-model';
  filename: string;
  uploadedAt: Date;
}

export interface MediaManagerProps {
  courseId: string;
  onMediaSelect?: (mediaUrl: string) => void;
  allowedTypes?: Array<'video' | 'pdf' | 'image' | '3d-model'>;
  showLibrary?: boolean;
}

export function MediaManager({
  courseId,
  onMediaSelect,
  allowedTypes = ['video', 'pdf', 'image', '3d-model'],
  showLibrary = true,
}: MediaManagerProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyRecent, setShowOnlyRecent] = useState(courseId === 'new-course');
  const [sessionUploadIds, setSessionUploadIds] = useState<Set<string>>(new Set());

  /**
   * Fetch existing media on mount
   */
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/media?limit=100&status=READY');
        
        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Map API response to MediaItem format
          const mediaItems: MediaItem[] = result.data.map((item: any) => {
            // Determine type from mimeType
            let type: 'video' | 'pdf' | 'image' | '3d-model' = 'image';
            if (item.mimeType?.startsWith('video/')) {
              type = 'video';
            } else if (item.mimeType === 'application/pdf') {
              type = 'pdf';
            } else if (item.mimeType?.startsWith('image/')) {
              type = 'image';
            } else if (item.mimeType?.startsWith('model/')) {
              type = '3d-model';
            }

            // Use manifestUrl for videos (HLS), otherwise use r2Key to construct URL
            const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '';
            const url = item.manifestUrl || (r2PublicUrl ? `${r2PublicUrl}/${item.r2Key}` : item.r2Key);

            return {
              id: item.id,
              url,
              key: item.r2Key,
              type,
              filename: item.originalName,
              uploadedAt: new Date(item.createdAt),
            };
          });

          setUploadedMedia(mediaItems);
        }
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to load media library');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  /**
   * Handle successful upload
   */
  const handleUploadComplete = useCallback(
    (mediaId: string, media: any) => {
      console.log('Upload complete - mediaId:', mediaId, 'media:', media);
      
      // Determine media type from mimeType
      let type: 'video' | 'pdf' | 'image' | '3d-model' = 'image';
      if (media.mimeType?.startsWith('video/')) {
        type = 'video';
      } else if (media.mimeType === 'application/pdf') {
        type = 'pdf';
      } else if (media.mimeType?.startsWith('image/')) {
        type = 'image';
      } else if (media.mimeType?.startsWith('model/')) {
        type = '3d-model';
      }

      // Construct URL from manifestUrl (for videos) or r2Key
      const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '';
      const url = media.manifestUrl || (r2PublicUrl ? `${r2PublicUrl}/${media.r2Key}` : media.r2Key);
      
      // Use originalName from API response
      const filename = media.originalName || media.r2Key?.split('/').pop() || 'unknown';

      // Add to media library
      const newMedia: MediaItem = {
        id: mediaId,
        url,
        key: media.r2Key || '',
        type,
        filename,
        uploadedAt: new Date(media.createdAt || Date.now()),
      };

      console.log('Adding new media to library:', newMedia);
      setUploadedMedia((prev) => [newMedia, ...prev]);
      
      // Track this upload in the current session
      setSessionUploadIds((prev) => new Set(prev).add(mediaId));

      // Notify parent component
      onMediaSelect?.(url);

      // Show success toast
      toast.success('Media uploaded successfully!');
    },
    [onMediaSelect]
  );

  /**
   * Handle upload error
   */
  const handleUploadError = useCallback((error: UploadError) => {
    toast.error(error.message || 'Upload failed');
  }, []);

  /**
   * Handle media selection from library
   */
  const handleMediaClick = useCallback(
    (media: MediaItem) => {
      onMediaSelect?.(media.url);
      toast.success('Media selected');
    },
    [onMediaSelect]
  );

  /**
   * Filter media by type and recency
   */
  const filteredMedia = uploadedMedia
    .filter((media) => {
      // Filter by type
      if (selectedFilter !== 'all' && media.type !== selectedFilter) {
        return false;
      }
      
      // Filter by recency if enabled
      if (showOnlyRecent) {
        // Show only media uploaded in this session
        return sessionUploadIds.has(media.id);
      }
      
      return true;
    });

  /**
   * Get accepted file types for uploader
   */
  const getAcceptedTypes = () => {
    const typeMap: Record<string, string[]> = {
      video: ['video/*'],
      pdf: ['application/pdf'],
      image: ['image/*'],
      '3d-model': ['model/*'],
    };

    return allowedTypes.flatMap((type) => typeMap[type] || []);
  };

  /**
   * Get max file size based on allowed types
   */
  const getMaxSize = () => {
    if (allowedTypes.includes('video')) return 500;
    if (allowedTypes.includes('3d-model')) return 100;
    if (allowedTypes.includes('pdf')) return 50;
    return 10;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <MediaUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Media Library */}
      {showLibrary && (
        <div>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading media library...</p>
            </div>
          ) : uploadedMedia.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
                  
                  {/* Show Recent Toggle */}
                  {courseId === 'new-course' && (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showOnlyRecent}
                        onChange={(e) => setShowOnlyRecent(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Show only uploads from this session
                    </label>
                  )}
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All ({uploadedMedia.length})
                  </button>
                  {allowedTypes.map((type) => {
                    const count = uploadedMedia.filter((m) => m.type === type).length;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedFilter(type)}
                        className={`px-3 py-1 text-sm rounded-md capitalize ${
                          selectedFilter === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleMediaClick(media)}
                    className="relative group cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                  >
                    {/* Media Preview */}
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="text-4xl">🖼️</div>';
                          }}
                        />
                      ) : media.type === 'video' ? (
                        <div className="relative w-full h-full bg-gray-900">
                          {/* Try to show video thumbnail or video preview */}
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            onError={(e) => {
                              // Fallback to icon if video fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="text-white text-center">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                              <p className="text-xs">Video</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-4xl mb-2">
                            {media.type === 'pdf' ? '📄' : '🎨'}
                          </div>
                          <p className="text-xs text-gray-600 capitalize">{media.type}</p>
                        </div>
                      )}
                    </div>

                    {/* Media Info */}
                    <div className="p-2 bg-white space-y-1">
                      <p className="text-xs text-gray-900 truncate font-medium" title={media.filename}>
                        {media.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(media.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                        Select
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredMedia.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {showOnlyRecent && sessionUploadIds.size === 0 ? (
                    <>
                      <p className="font-medium">No media uploaded yet in this session</p>
                      <p className="text-sm mt-2">Upload files above or uncheck "Show only uploads from this session" to see all media</p>
                    </>
                  ) : showOnlyRecent ? (
                    <>
                      <p className="font-medium">No {selectedFilter !== 'all' ? selectedFilter : ''} files uploaded in this session</p>
                      <p className="text-sm mt-2">Upload files above or change the filter</p>
                    </>
                  ) : (
                    <>
                      <p>No {selectedFilter !== 'all' ? selectedFilter : ''} media files uploaded yet</p>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No media files uploaded yet</p>
              <p className="text-sm mt-2">Upload your first file above to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
