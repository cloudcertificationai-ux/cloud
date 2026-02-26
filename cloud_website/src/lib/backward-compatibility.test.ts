/**
 * Tests for backward compatibility utilities
 * 
 * Validates Requirements 20.1-20.5
 */

import {
  getVideoSourceUrl,
  hasVideoContent,
  inferLessonKind,
  isLegacyVideoLesson,
  getLessonsNeedingMigration,
  getCompletionTrackingInfo,
} from './backward-compatibility';

describe('Backward Compatibility Utilities', () => {
  describe('getVideoSourceUrl', () => {
    it('should prioritize HLS manifest URL over legacy videoUrl', () => {
      const lesson = {
        videoUrl: 'https://example.com/legacy.mp4',
        media: {
          manifestUrl: 'https://example.com/hls/master.m3u8',
        },
      };

      expect(getVideoSourceUrl(lesson)).toBe('https://example.com/hls/master.m3u8');
    });

    it('should fall back to legacy videoUrl when no manifest URL', () => {
      const lesson = {
        videoUrl: 'https://example.com/legacy.mp4',
        media: null,
      };

      expect(getVideoSourceUrl(lesson)).toBe('https://example.com/legacy.mp4');
    });

    it('should return null when no video source available', () => {
      const lesson = {
        videoUrl: null,
        media: null,
      };

      expect(getVideoSourceUrl(lesson)).toBeNull();
    });

    it('should handle media with null manifestUrl', () => {
      const lesson = {
        videoUrl: 'https://example.com/legacy.mp4',
        media: {
          manifestUrl: null,
        },
      };

      expect(getVideoSourceUrl(lesson)).toBe('https://example.com/legacy.mp4');
    });
  });

  describe('hasVideoContent', () => {
    it('should return true for legacy video lessons', () => {
      const lesson = {
        videoUrl: 'https://example.com/video.mp4',
        mediaId: null,
      };

      expect(hasVideoContent(lesson)).toBe(true);
    });

    it('should return true for new video lessons with mediaId', () => {
      const lesson = {
        videoUrl: null,
        mediaId: 'media-123',
      };

      expect(hasVideoContent(lesson)).toBe(true);
    });

    it('should return true for lessons with manifest URL', () => {
      const lesson = {
        videoUrl: null,
        mediaId: null,
        media: {
          manifestUrl: 'https://example.com/hls/master.m3u8',
        },
      };

      expect(hasVideoContent(lesson)).toBe(true);
    });

    it('should return false for article lessons', () => {
      const lesson = {
        videoUrl: null,
        mediaId: null,
        media: null,
      };

      expect(hasVideoContent(lesson)).toBe(false);
    });
  });

  describe('inferLessonKind', () => {
    it('should return VIDEO for lessons with videoUrl (Requirement 20.1)', () => {
      const lesson = {
        videoUrl: 'https://example.com/video.mp4',
        kind: null,
      };

      expect(inferLessonKind(lesson)).toBe('VIDEO');
    });

    it('should return ARTICLE for lessons without videoUrl (Requirement 20.2)', () => {
      const lesson = {
        videoUrl: null,
        kind: null,
      };

      expect(inferLessonKind(lesson)).toBe('ARTICLE');
    });

    it('should preserve existing kind if already set', () => {
      const lesson = {
        videoUrl: null,
        kind: 'QUIZ',
      };

      expect(inferLessonKind(lesson)).toBe('QUIZ');
    });
  });

  describe('isLegacyVideoLesson', () => {
    it('should return true for lessons with videoUrl but no mediaId', () => {
      const lesson = {
        videoUrl: 'https://example.com/video.mp4',
        mediaId: null,
      };

      expect(isLegacyVideoLesson(lesson)).toBe(true);
    });

    it('should return false for new video lessons with mediaId', () => {
      const lesson = {
        videoUrl: 'https://example.com/video.mp4',
        mediaId: 'media-123',
      };

      expect(isLegacyVideoLesson(lesson)).toBe(false);
    });

    it('should return false for lessons without videoUrl', () => {
      const lesson = {
        videoUrl: null,
        mediaId: null,
      };

      expect(isLegacyVideoLesson(lesson)).toBe(false);
    });
  });

  describe('getLessonsNeedingMigration', () => {
    it('should identify lessons needing VIDEO kind assignment', () => {
      const lessons = [
        { id: '1', videoUrl: 'https://example.com/video1.mp4', kind: null },
        { id: '2', videoUrl: 'https://example.com/video2.mp4', kind: 'ARTICLE' },
        { id: '3', videoUrl: null, kind: null },
      ];

      const result = getLessonsNeedingMigration(lessons);

      expect(result.needsVideoKind).toHaveLength(2);
      expect(result.needsVideoKind.map(l => l.id)).toEqual(['1', '2']);
    });

    it('should identify lessons needing ARTICLE kind assignment', () => {
      const lessons = [
        { id: '1', videoUrl: null, kind: null },
        { id: '2', videoUrl: null, kind: 'VIDEO' },
        { id: '3', videoUrl: 'https://example.com/video.mp4', kind: null },
      ];

      const result = getLessonsNeedingMigration(lessons);

      expect(result.needsArticleKind).toHaveLength(2);
      expect(result.needsArticleKind.map(l => l.id)).toEqual(['1', '2']);
    });

    it('should calculate total needing migration', () => {
      const lessons = [
        { id: '1', videoUrl: 'https://example.com/video.mp4', kind: null },
        { id: '2', videoUrl: null, kind: null },
        { id: '3', videoUrl: 'https://example.com/video.mp4', kind: 'VIDEO' },
      ];

      const result = getLessonsNeedingMigration(lessons);

      expect(result.totalNeedingMigration).toBe(2);
    });

    it('should return empty arrays when no migration needed', () => {
      const lessons = [
        { id: '1', videoUrl: 'https://example.com/video.mp4', kind: 'VIDEO' },
        { id: '2', videoUrl: null, kind: 'ARTICLE' },
      ];

      const result = getLessonsNeedingMigration(lessons);

      expect(result.needsVideoKind).toHaveLength(0);
      expect(result.needsArticleKind).toHaveLength(0);
      expect(result.totalNeedingMigration).toBe(0);
    });
  });

  describe('getCompletionTrackingInfo', () => {
    it('should document completion tracking for all lesson types (Requirement 20.5)', () => {
      const info = getCompletionTrackingInfo();

      // Verify all lesson types are documented
      expect(info.VIDEO).toBeDefined();
      expect(info.ARTICLE).toBeDefined();
      expect(info.QUIZ).toBeDefined();
      expect(info.MCQ).toBeDefined();
      expect(info.ASSIGNMENT).toBeDefined();
      expect(info.AR).toBeDefined();
      expect(info.LIVE).toBeDefined();

      // Verify legacy and new VIDEO tracking
      expect(info.VIDEO.legacy.tracked).toBe(true);
      expect(info.VIDEO.new.tracked).toBe(true);

      // Verify course completion formula
      expect(info.courseCompletion.formula).toBe('(completedLessons / totalLessons) * 100');
      expect(info.courseCompletion.note).toContain('All lesson types contribute equally');
    });

    it('should confirm all lesson types are tracked', () => {
      const info = getCompletionTrackingInfo();

      const lessonTypes = ['VIDEO', 'ARTICLE', 'QUIZ', 'MCQ', 'ASSIGNMENT', 'AR', 'LIVE'];
      
      lessonTypes.forEach(type => {
        if (type === 'VIDEO') {
          expect(info[type].legacy.tracked).toBe(true);
          expect(info[type].new.tracked).toBe(true);
        } else {
          expect(info[type].tracked).toBe(true);
        }
      });
    });
  });

  describe('Integration: Legacy to New Migration Flow', () => {
    it('should handle complete migration workflow', () => {
      // Step 1: Identify lessons needing migration
      const lessons = [
        { id: '1', videoUrl: 'https://example.com/video.mp4', kind: null },
        { id: '2', videoUrl: null, kind: null },
      ];

      const migrationNeeds = getLessonsNeedingMigration(lessons);
      expect(migrationNeeds.totalNeedingMigration).toBe(2);

      // Step 2: Infer correct kind for each lesson
      const lesson1Kind = inferLessonKind(lessons[0]);
      const lesson2Kind = inferLessonKind(lessons[1]);

      expect(lesson1Kind).toBe('VIDEO');
      expect(lesson2Kind).toBe('ARTICLE');

      // Step 3: Verify video source URL resolution
      const lesson1Updated = { ...lessons[0], kind: lesson1Kind };
      const videoUrl = getVideoSourceUrl(lesson1Updated);

      expect(videoUrl).toBe('https://example.com/video.mp4');

      // Step 4: Confirm legacy status
      expect(isLegacyVideoLesson(lesson1Updated)).toBe(true);
    });

    it('should handle transition from legacy to new video format', () => {
      // Original legacy lesson
      const legacyLesson = {
        videoUrl: 'https://example.com/video.mp4',
        mediaId: null,
        media: null,
      };

      expect(isLegacyVideoLesson(legacyLesson)).toBe(true);
      expect(getVideoSourceUrl(legacyLesson)).toBe('https://example.com/video.mp4');

      // After uploading to new system
      const upgradedLesson = {
        videoUrl: 'https://example.com/video.mp4', // Keep for backward compat
        mediaId: 'media-123',
        media: {
          manifestUrl: 'https://example.com/hls/master.m3u8',
        },
      };

      expect(isLegacyVideoLesson(upgradedLesson)).toBe(false);
      expect(getVideoSourceUrl(upgradedLesson)).toBe('https://example.com/hls/master.m3u8');
    });
  });
});

