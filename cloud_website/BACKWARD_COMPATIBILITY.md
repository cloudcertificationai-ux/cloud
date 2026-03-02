# Backward Compatibility Implementation

This document describes the backward compatibility implementation for the VOD Media System, ensuring that existing lessons continue to work seamlessly during and after the migration to the new system.

## Overview

The VOD Media System introduces new lesson types (VIDEO, ARTICLE, QUIZ, MCQ, ASSIGNMENT, AR, LIVE) and a new media management system. To ensure existing courses continue to work, we've implemented comprehensive backward compatibility support.

## Requirements Satisfied

### Requirement 20.1: Legacy Video Lesson Migration
- **Implementation**: Migration script sets `kind=VIDEO` for lessons with `videoUrl`
- **Location**: `prisma/migrations/migrate-lesson-kinds.ts`
- **Status**: ✅ Complete

### Requirement 20.2: Legacy Article Lesson Migration
- **Implementation**: Migration script sets `kind=ARTICLE` for lessons without `videoUrl`
- **Location**: `prisma/migrations/migrate-lesson-kinds.ts`
- **Status**: ✅ Complete

### Requirement 20.3: Dual Field Support
- **Implementation**: System checks both `videoUrl` and `mediaId` fields
- **Location**: `src/components/LessonPlayer.tsx` (VideoLessonRenderer)
- **Status**: ✅ Complete

### Requirement 20.4: Legacy Video URL Serving
- **Implementation**: Serves `videoUrl` directly if `mediaId` is null
- **Location**: `src/components/LessonPlayer.tsx`, `src/lib/backward-compatibility.ts`
- **Status**: ✅ Complete

### Requirement 20.5: Unified Completion Calculation
- **Implementation**: All lesson types contribute equally to course completion
- **Location**: `src/lib/progress-tracker.ts` (calculateCourseCompletion)
- **Status**: ✅ Complete

## Key Components

### 1. Migration Script
**File**: `prisma/migrations/migrate-lesson-kinds.ts`

Automatically sets the `kind` field for existing lessons:
- Lessons with `videoUrl` → `kind=VIDEO`
- Lessons without `videoUrl` → `kind=ARTICLE`

**Usage**:
```bash
npx tsx prisma/migrations/migrate-lesson-kinds.ts
```

**Features**:
- Counts lessons needing migration
- Updates lessons in batches
- Provides detailed migration summary
- Shows final lesson kind distribution

### 2. Backward Compatibility Utilities
**File**: `src/lib/backward-compatibility.ts`

Provides helper functions for handling legacy data:

#### `getVideoSourceUrl(lesson)`
Returns the appropriate video URL, prioritizing new HLS manifest over legacy videoUrl.

```typescript
const videoUrl = getVideoSourceUrl(lesson);
// Returns: manifestUrl || videoUrl || null
```

#### `hasVideoContent(lesson)`
Checks if a lesson has video content in any format (legacy or new).

#### `inferLessonKind(lesson)`
Determines the appropriate lesson kind based on legacy data.

#### `isLegacyVideoLesson(lesson)`
Identifies lessons using legacy videoUrl without mediaId.

#### `getLessonsNeedingMigration(lessons)`
Analyzes lessons to identify which need kind field migration.

#### `getCompletionTrackingInfo()`
Documents completion tracking behavior for all lesson types.

### 3. Video Player Integration
**File**: `src/components/LessonPlayer.tsx`

The `VideoLessonRenderer` component automatically handles both formats:

```typescript
// Use media URL if available, otherwise fall back to legacy videoUrl
const videoUrl = lesson.media?.manifestUrl || lesson.videoUrl || '';
```

This ensures:
- New HLS videos play with adaptive streaming
- Legacy videos continue to work without changes
- Smooth transition as videos are migrated

### 4. API Support
**File**: `src/app/api/lessons/[id]/route.ts`

The lesson retrieval API returns both fields:
- `videoUrl` - Legacy field (maintained for backward compatibility)
- `media` - New media object with HLS manifest

Clients can use either field, with new clients preferring the media object.

## Progress Tracking

All lesson types are tracked consistently:

| Lesson Type | Completion Method | Tracked |
|-------------|------------------|---------|
| VIDEO (legacy) | 90% watch threshold via heartbeat | ✅ |
| VIDEO (new) | 90% watch threshold via heartbeat | ✅ |
| ARTICLE | Manual mark complete after reading | ✅ |
| QUIZ/MCQ | Auto-complete when quiz is passed | ✅ |
| ASSIGNMENT | Auto-complete when submission is graded | ✅ |
| AR | Manual mark complete (placeholder) | ✅ |
| LIVE | Manual mark complete (placeholder) | ✅ |

**Course Completion Formula**:
```
completionPercentage = (completedLessons / totalLessons) * 100
```

All lesson types contribute equally, regardless of kind or legacy status.

## Migration Path

### Phase 1: Schema Update (Complete)
- ✅ Add `kind` enum field to Lesson model
- ✅ Add `mediaId`, `quizId`, `assignmentId` foreign keys
- ✅ Keep `videoUrl` field for backward compatibility

### Phase 2: Data Migration (Ready)
- Run migration script: `npx tsx prisma/migrations/migrate-lesson-kinds.ts`
- Script sets appropriate `kind` for all existing lessons
- No downtime required

### Phase 3: Gradual Transition (Ongoing)
- New lessons use new media system
- Legacy lessons continue to work
- Instructors can optionally re-upload videos to new system
- Both formats supported indefinitely

### Phase 4: Optional Cleanup (Future)
- After all videos migrated to new system
- Can deprecate `videoUrl` field
- Not required - legacy support can remain

## Testing

### Unit Tests
**File**: `src/lib/backward-compatibility.test.ts`

Comprehensive test coverage:
- ✅ Video source URL resolution
- ✅ Video content detection
- ✅ Lesson kind inference
- ✅ Legacy lesson identification
- ✅ Migration needs analysis
- ✅ Completion tracking documentation
- ✅ Integration workflows

**Run tests**:
```bash
npm test -- backward-compatibility.test.ts
```

### Integration Tests
**File**: `src/__tests__/api-integration/backward-compatibility.test.ts`

Tests API-level backward compatibility:
- ✅ Lesson retrieval with legacy data
- ✅ Progress tracking for legacy lessons
- ✅ Course completion calculation

## Monitoring

The system logs migration and compatibility events:

1. **Migration Script**: Logs lesson counts and migration results
2. **API Requests**: Tracks usage of legacy vs new video fields
3. **Progress Tracking**: Records completion for all lesson types
4. **Analytics**: Monitors playback sessions for both formats

## Troubleshooting

### Issue: Lesson shows "No video available"
**Cause**: Both `videoUrl` and `mediaId` are null
**Solution**: Check lesson data, ensure at least one video field is set

### Issue: Progress not tracking for legacy lessons
**Cause**: VideoPlayer not receiving correct videoUrl
**Solution**: Verify `getVideoSourceUrl()` returns valid URL

### Issue: Course completion stuck
**Cause**: Some lessons not marked complete
**Solution**: Check all lesson types are being tracked (see Progress Tracking table)

### Issue: Migration script fails
**Cause**: Database connection or permission issues
**Solution**: Verify DATABASE_URL and database access

## Best Practices

1. **Always test migration script on staging first**
2. **Keep videoUrl field populated even after migration** (for rollback safety)
3. **Monitor completion rates after migration** (should remain consistent)
4. **Use backward compatibility utilities** instead of direct field access
5. **Document any custom lesson types** in completion tracking info

## Future Enhancements

Potential improvements for backward compatibility:

1. **Automatic video migration tool** - Bulk upload legacy videos to new system
2. **Dual-write strategy** - Update both videoUrl and mediaId during transition
3. **Analytics dashboard** - Track legacy vs new format usage
4. **Deprecation warnings** - Notify instructors of legacy video usage
5. **Batch migration API** - Allow instructors to migrate courses via UI

## Support

For questions or issues with backward compatibility:

1. Check this documentation first
2. Review test files for examples
3. Check migration script logs
4. Contact development team with specific error messages

## Summary

The backward compatibility implementation ensures:
- ✅ Zero downtime during migration
- ✅ Existing courses continue to work
- ✅ Progress tracking remains consistent
- ✅ Smooth transition to new system
- ✅ Rollback capability if needed
- ✅ Comprehensive test coverage

All requirements (20.1-20.5) are fully satisfied and tested.

