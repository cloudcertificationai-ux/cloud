// src/components/VideoPlayer.tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { PlayIcon, PauseIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseId: string;
  onProgressUpdate: (lessonId: string, completed: boolean, timeSpent: number, lastPosition: number) => Promise<void>;
  initialPosition?: number;
  isCompleted?: boolean;
  manifestUrl?: string; // HLS manifest URL (optional, for new HLS videos)
  captions?: Array<{ label: string; src: string; srclang: string }>; // Optional captions
}

export default function VideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onProgressUpdate,
  initialPosition = 0,
  isCompleted = false,
  manifestUrl,
  captions = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const [timeSpent, setTimeSpent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualities, setQualities] = useState<Array<{ height: number; index: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = auto
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const lastSaveTimeRef = useRef(0);
  const watchStartTimeRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Initialize HLS or native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sourceUrl = manifestUrl || videoUrl;
    const isHLS = sourceUrl.includes('.m3u8');

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for adaptive streaming
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        // Extract quality levels
        const levels = data.levels.map((level, index) => ({
          height: level.height,
          index,
        }));
        setQualities(levels);
        setError(null);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error occurred. Please check your connection.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error occurred. Attempting to recover...');
              hls.recoverMediaError();
              break;
            default:
              setError('An error occurred while loading the video.');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = sourceUrl;
      setError(null);
    } else {
      // Fallback to native video for non-HLS
      video.src = sourceUrl;
      setError(null);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [manifestUrl, videoUrl]);

  // Load initial position
  useEffect(() => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  // Track time spent watching
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      watchStartTimeRef.current = Date.now();
      interval = setInterval(() => {
        if (watchStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - watchStartTimeRef.current) / 1000);
          setTimeSpent(prev => prev + elapsed);
          watchStartTimeRef.current = Date.now();
        }
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
      if (watchStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - watchStartTimeRef.current) / 1000);
        setTimeSpent(prev => prev + elapsed);
        watchStartTimeRef.current = null;
      }
    };
  }, [isPlaying]);

  // Save progress periodically (every 5 seconds instead of 30)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (videoRef.current && currentTime > 0) {
        const now = Date.now();
        // Save every 5 seconds
        if (now - lastSaveTimeRef.current > 5000) {
          saveProgress(false);
          lastSaveTimeRef.current = now;
        }
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [currentTime, timeSpent]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (currentTime > 0) {
        saveProgress(completed);
      }
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const saveProgress = useCallback(async (isCompleted: boolean) => {
    if (!videoRef.current) return;

    try {
      await onProgressUpdate(
        lessonId,
        isCompleted,
        timeSpent,
        Math.floor(videoRef.current.currentTime)
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [lessonId, timeSpent, onProgressUpdate]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Mark as completed when 90% watched
      if (!completed && duration > 0) {
        const percentWatched = (videoRef.current.currentTime / duration) * 100;
        if (percentWatched >= 90) {
          setCompleted(true);
          saveProgress(true);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCompleted(true);
    saveProgress(true);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleRetry = () => {
    setError(null);
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const changeQuality = (qualityIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
      setCurrentQuality(qualityIndex);
      setShowQualityMenu(false);
    }
  };

  const toggleCaptions = () => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0];
      if (captionsEnabled) {
        track.mode = 'hidden';
        setCaptionsEnabled(false);
      } else {
        track.mode = 'showing';
        setCaptionsEnabled(true);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      >
        {captions.map((caption, index) => (
          <track
            key={index}
            kind="subtitles"
            src={caption.src}
            srcLang={caption.srclang}
            label={caption.label}
            default={index === 0}
          />
        ))}
      </video>

      {/* Completion Badge */}
      {completed && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium z-10">
          <CheckCircleIcon className="w-4 h-4" />
          Completed
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white p-6 max-w-md">
            <p className="mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Caption Toggle */}
            {captions.length > 0 && (
              <button
                onClick={toggleCaptions}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  captionsEnabled ? 'bg-blue-600' : 'bg-white/20 hover:bg-white/30'
                }`}
                aria-label={captionsEnabled ? 'Disable captions' : 'Enable captions'}
                aria-pressed={captionsEnabled}
              >
                CC
              </button>
            )}

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
                aria-label="Playback speed"
                aria-expanded={showSpeedMenu}
                aria-haspopup="menu"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div 
                  className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden"
                  role="menu"
                  aria-label="Playback speed options"
                >
                  {playbackSpeeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors ${
                        speed === playbackSpeed ? 'bg-blue-600' : ''
                      }`}
                      role="menuitem"
                      aria-label={`${speed}x speed`}
                      aria-current={speed === playbackSpeed ? 'true' : 'false'}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Selector (HLS only) */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
                  aria-label="Video quality"
                >
                  {currentQuality === -1 ? 'Auto' : `${qualities.find(q => q.index === currentQuality)?.height}p`}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => changeQuality(-1)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors ${
                        currentQuality === -1 ? 'bg-blue-600' : ''
                      }`}
                    >
                      Auto
                    </button>
                    {qualities.map((quality) => (
                      <button
                        key={quality.index}
                        onClick={() => changeQuality(quality.index)}
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors ${
                          quality.index === currentQuality ? 'bg-blue-600' : ''
                        }`}
                      >
                        {quality.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
