# Admin Media Management Guide

This guide provides comprehensive instructions for instructors and administrators on managing media content, quizzes, and assignments in the AnyWhereDoor VOD system.

## Table of Contents

1. [Media Upload Process](#media-upload-process)
2. [File Requirements](#file-requirements)
3. [Transcode Status Monitoring](#transcode-status-monitoring)
4. [Quiz Creation Workflow](#quiz-creation-workflow)
5. [Assignment Creation Workflow](#assignment-creation-workflow)
6. [Media Library Organization](#media-library-organization)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)

---

## Media Upload Process

### Overview

The media upload process uses direct-to-R2 uploads, meaning files are uploaded directly from your browser to Cloudflare R2 storage without passing through the application server. This provides faster uploads and reduces server load.

### Step-by-Step Upload

1. **Access Media Library**
   - Log in to the admin panel (http://localhost:3001)
   - Navigate to **Media Library** in the sidebar
   - Click **Upload Media** button

2. **Select File**
   - Click the upload zone or drag and drop a file
   - Supported file types are validated immediately
   - File size is checked before upload begins

3. **Upload Progress**
   - A progress bar shows upload percentage
   - Upload happens directly to R2 (no server bottleneck)
   - You can continue working while upload completes

4. **Upload Completion**
   - Success message appears with media preview
   - For videos: Transcoding begins automatically
   - For other files: Media is immediately ready for use

5. **Add to Lesson**
   - Navigate to your course
   - Edit or create a lesson
   - Select the uploaded media from the media picker
   - Save the lesson

### Upload States

| State | Description | What You See |
|-------|-------------|--------------|
| **Idle** | No upload in progress | Upload zone with drag-and-drop area |
| **Uploading** | File transferring to R2 | Progress bar with percentage |
| **Processing** | Video being transcoded | "Processing video..." with spinner |
| **Ready** | Media ready for use | Success message with thumbnail |
| **Failed** | Upload or transcode failed | Error message with retry button |

---

## File Requirements

### Supported File Types

#### Videos
- **Formats**: MP4, MOV, AVI
- **Max Size**: 5 GB
- **Recommended Codecs**: H.264 video, AAC audio
- **Recommended Resolution**: 1080p or higher
- **Aspect Ratio**: 16:9 (recommended), 4:3, 21:9 supported

#### Documents
- **Formats**: PDF
- **Max Size**: 100 MB
- **Recommended**: Optimized PDFs with embedded fonts

#### Images
- **Formats**: PNG, JPG, JPEG
- **Max Size**: 50 MB
- **Recommended**: High-resolution images (1920x1080 or higher)

#### 3D Models
- **Formats**: GLB, GLTF
- **Max Size**: 50 MB
- **Recommended**: Optimized models with compressed textures

### File Naming Conventions

**Best Practices:**
- Use descriptive names: `module-1-introduction.mp4`
- Avoid special characters: Use hyphens or underscores
- Include version numbers if applicable: `lesson-2-v2.mp4`
- Keep names under 100 characters

**Avoid:**
- Spaces in filenames (use hyphens instead)
- Special characters: `!@#$%^&*()`
- Non-ASCII characters
- Very long filenames (>100 characters)

### Video Encoding Best Practices

For optimal transcoding results and faster processing:

#### Pre-Upload Encoding

**Recommended Settings:**
- **Container**: MP4
- **Video Codec**: H.264 (x264)
- **Audio Codec**: AAC
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 fps or 60 fps
- **Bitrate**: 5-8 Mbps for 1080p
- **Audio Bitrate**: 128-192 kbps

**FFmpeg Command Example:**
```bash
ffmpeg -i input.mov \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

#### Why Pre-Encode?

1. **Faster Transcoding**: Already-optimized videos transcode faster
2. **Better Quality**: Control encoding parameters before upload
3. **Smaller Files**: Reduced upload time and storage costs
4. **Compatibility**: Ensures videos work across all devices

#### Tools for Encoding

- **HandBrake** (Free, GUI): https://handbrake.fr/
- **FFmpeg** (Free, CLI): https://ffmpeg.org/
- **Adobe Media Encoder** (Paid): Professional encoding tool
- **Compressor** (macOS, Paid): Apple's encoding tool

---

## Transcode Status Monitoring

### Understanding Transcode Status

After uploading a video, it goes through several stages:

1. **UPLOADED** (Initial)
   - Video uploaded to R2 successfully
   - Transcode job queued in BullMQ
   - Duration: Instant

2. **PROCESSING** (Active)
   - FFmpeg generating HLS variants
   - Creating thumbnails and extracting metadata
   - Duration: 1-10 minutes depending on video length and size

3. **READY** (Complete)
   - All HLS variants generated (1080p, 720p, 480p)
   - Thumbnails created (5 thumbnails at 0%, 25%, 50%, 75%, 100%)
   - Metadata extracted (duration, resolution, codec)
   - Video ready for student playback

4. **FAILED** (Error)
   - Transcoding encountered an error
   - Error details logged for troubleshooting
   - Retry option available

### Monitoring Transcode Progress

#### In the Admin Panel

1. Navigate to **Media Library**
2. Find your uploaded video
3. Status badge shows current state:
   - 🟡 **Processing**: Transcoding in progress
   - 🟢 **Ready**: Available for use
   - 🔴 **Failed**: Error occurred

4. Click on the media item for details:
   - Transcode progress percentage
   - Estimated time remaining
   - Generated variants and thumbnails

#### Via API

Query transcode job status programmatically:

```typescript
// Get job status
const response = await fetch(`/api/admin/media/${mediaId}/transcode-status`);
const { status, progress, error } = await response.json();

console.log(`Status: ${status}, Progress: ${progress}%`);
```

### Transcode Error Handling

#### Common Errors and Solutions

**Error: "Unsupported codec"**
- **Cause**: Video uses a codec FFmpeg doesn't support
- **Solution**: Re-encode video with H.264 codec before upload
- **Command**: See [Pre-Upload Encoding](#pre-upload-encoding)

**Error: "File too large"**
- **Cause**: Video exceeds 5 GB limit
- **Solution**: Compress video or split into multiple parts
- **Tool**: Use HandBrake with "Web Optimized" preset

**Error: "Corrupted video file"**
- **Cause**: Upload interrupted or file damaged
- **Solution**: Re-upload the video
- **Prevention**: Ensure stable internet connection during upload

**Error: "Transcode timeout"**
- **Cause**: Video too long or complex (>2 hours)
- **Solution**: Contact administrator to increase timeout
- **Workaround**: Split video into shorter segments

**Error: "Out of memory"**
- **Cause**: Worker insufficient resources for large video
- **Solution**: Administrator needs to scale worker resources
- **Temporary**: Upload smaller videos until resolved

#### Retry Failed Transcodes

1. Navigate to the failed media item
2. Click **Retry Transcode** button
3. System re-queues the job
4. Monitor status as before

If retry fails again:
1. Download the original file
2. Re-encode using recommended settings
3. Upload the re-encoded version

---

## Quiz Creation Workflow

### Step 1: Create Quiz

1. Navigate to **Quizzes** in the admin panel
2. Click **Create Quiz**
3. Fill in quiz details:
   - **Title**: Clear, descriptive name
   - **Description**: What the quiz covers
   - **Time Limit**: Minutes allowed (0 = unlimited)
   - **Passing Score**: Percentage required to pass (e.g., 70%)

### Step 2: Add Questions

For each question:

1. Click **Add Question**
2. Select question type:
   - **Single Choice**: One correct answer
   - **Multiple Choice**: Multiple correct answers
   - **Text Answer**: Free-form text response

3. Enter question text
4. Add answer options (for MCQ):
   - Click **Add Option**
   - Enter option text
   - Mark correct answer(s)

5. Add explanation (optional but recommended):
   - Shown to students after submission
   - Helps reinforce learning

6. Set point value (default: 1 point)

### Step 3: Review and Save

1. Review all questions for accuracy
2. Check correct answers are marked
3. Verify passing score is appropriate
4. Click **Save Quiz**

### Step 4: Attach to Lesson

1. Navigate to your course
2. Create or edit a lesson
3. Set lesson kind to **QUIZ** or **MCQ**
4. Select the quiz from the dropdown
5. Save the lesson

### Quiz Best Practices

**Question Writing:**
- Use clear, unambiguous language
- Avoid trick questions
- Test understanding, not memorization
- Include explanations for learning

**Answer Options:**
- Make distractors plausible but incorrect
- Avoid "all of the above" or "none of the above"
- Keep options similar in length
- Randomize option order (automatic)

**Difficulty Balance:**
- Mix easy, medium, and hard questions
- Start with easier questions to build confidence
- Place harder questions in the middle
- End with moderate difficulty

**Time Limits:**
- Allow 1-2 minutes per question
- Add buffer time for reading
- Consider: 10 questions = 15-20 minutes

---

## Assignment Creation Workflow

### Step 1: Create Assignment

1. Navigate to **Assignments** in the admin panel
2. Click **Create Assignment**
3. Fill in assignment details:
   - **Title**: Clear assignment name
   - **Description**: Detailed instructions (supports Markdown)
   - **Due Date**: Deadline for submission
   - **Max Marks**: Total points available
   - **Requirements**: File format, size, specific criteria

### Step 2: Set Submission Requirements

Specify what students should submit:

**File Requirements:**
- Accepted formats (e.g., PDF, DOCX, ZIP)
- Maximum file size (default: 100 MB)
- Naming conventions (if any)

**Content Requirements:**
- What should be included
- Formatting guidelines
- Citation requirements (if applicable)

**Example Requirements:**
```markdown
## Submission Requirements

- **Format**: PDF only
- **File Size**: Maximum 10 MB
- **File Name**: `firstname-lastname-assignment1.pdf`
- **Content**: 
  - Cover page with name and date
  - 5-10 pages of content
  - References in APA format
  - Code snippets (if applicable)
```

### Step 3: Attach to Lesson

1. Navigate to your course
2. Create or edit a lesson
3. Set lesson kind to **ASSIGNMENT**
4. Select the assignment from the dropdown
5. Save the lesson

### Step 4: Grade Submissions

1. Navigate to **Assignments** > **Submissions**
2. Filter by assignment
3. For each submission:
   - Click **View Submission**
   - Download and review the file
   - Enter marks awarded (0 to max marks)
   - Provide detailed feedback
   - Click **Save Grade**

4. Student receives notification of grade
5. Lesson marked as complete for the student

### Assignment Best Practices

**Clear Instructions:**
- Break down requirements into steps
- Provide examples or templates
- Specify evaluation criteria
- Include rubric if applicable

**Reasonable Deadlines:**
- Allow sufficient time for completion
- Consider course workload
- Communicate deadline clearly
- Set reminders before due date

**Effective Feedback:**
- Be specific and constructive
- Highlight strengths and areas for improvement
- Reference rubric criteria
- Provide actionable suggestions

**Late Submission Policy:**
- Define policy clearly in requirements
- System automatically marks late submissions
- Decide on penalty (if any)
- Communicate policy to students

---

## Media Library Organization

### Search and Filter

The media library provides powerful search and filtering:

**Search by:**
- File name
- Media type (video, document, image, 3D model)
- Upload date
- Status (uploaded, processing, ready, failed)
- Uploader (instructor name)

**Filter Options:**
- **Status**: Show only ready media or processing videos
- **Type**: Filter by MIME type
- **Date Range**: Find media uploaded in specific period
- **Course**: Show media used in specific course

### Organizing Media

**Naming Strategy:**
- Use consistent prefixes: `course-name-module-lesson`
- Include version numbers: `v1`, `v2`
- Add dates for time-sensitive content: `2024-01-15`

**Tagging (Future Feature):**
- Add tags for easy categorization
- Use tags like: `intro`, `advanced`, `demo`, `tutorial`

**Folders (Future Feature):**
- Organize by course or module
- Create folder structure matching course hierarchy

### Bulk Operations

**Bulk Upload:**
1. Select multiple files in file picker
2. All files upload simultaneously
3. Monitor progress for each file

**Bulk Delete:**
1. Select multiple media items (checkbox)
2. Click **Delete Selected**
3. Confirm deletion
4. All selected items removed from R2 and database

**Bulk Status Check:**
1. Filter by status "Processing"
2. View all transcoding videos at once
3. Identify stuck or failed jobs

---

## Best Practices

### Video Content

**Recording Quality:**
- Use good lighting and clear audio
- Record in quiet environment
- Use external microphone if possible
- Test recording setup before full recording

**Video Length:**
- Keep videos under 15 minutes for engagement
- Break long topics into multiple videos
- Include clear intro and outro
- Add chapter markers (future feature)

**Accessibility:**
- Add captions/subtitles (upload VTT file)
- Provide transcripts in lesson description
- Use clear speech and avoid jargon
- Ensure good contrast in slides

### Quiz Design

**Effective Assessment:**
- Align questions with learning objectives
- Test application, not just recall
- Use varied question types
- Provide immediate feedback

**Question Bank:**
- Create more questions than needed
- Randomize question selection (future feature)
- Update questions based on student performance
- Remove ambiguous questions

### Assignment Design

**Meaningful Work:**
- Align with course objectives
- Require critical thinking
- Allow creativity within guidelines
- Provide real-world context

**Grading Efficiency:**
- Use rubrics for consistency
- Grade in batches
- Provide template feedback for common issues
- Use assignment analytics to identify trends

### Storage Management

**Optimize Storage:**
- Delete unused media regularly
- Compress videos before upload
- Use appropriate quality for content type
- Archive old course media

**Backup Strategy:**
- R2 provides durability, but consider backups
- Export media list periodically
- Keep local copies of critical content
- Document media usage in courses

---

## Error Handling

### Upload Errors

**"Upload failed: Network error"**
- Check internet connection
- Retry upload
- Try smaller file if issue persists

**"File type not supported"**
- Verify file extension matches content
- Convert to supported format
- Check file isn't corrupted

**"File too large"**
- Compress video or document
- Split into multiple parts
- Contact admin for limit increase

### Transcode Errors

**"Transcode failed: Codec error"**
- Re-encode with H.264 codec
- Use recommended encoding settings
- Try different source file

**"Transcode timeout"**
- Video may be too long
- Contact administrator
- Split into shorter segments

### Quiz Errors

**"Cannot save quiz: Validation error"**
- Check all required fields filled
- Verify at least one question added
- Ensure correct answers marked
- Check passing score is 0-100

**"Question options missing"**
- Add at least 2 options for MCQ
- Mark at least one correct answer
- Verify option text not empty

### Assignment Errors

**"Cannot create assignment: Invalid date"**
- Ensure due date is in the future
- Check date format is correct
- Verify timezone settings

**"Submission failed: File too large"**
- Student needs to compress file
- Adjust max file size in requirements
- Provide compression guidelines

### Getting Help

If you encounter persistent issues:

1. **Check System Status**: Look for maintenance notifications
2. **Review Logs**: Admin panel shows recent errors
3. **Contact Support**: Use help desk with error details
4. **Documentation**: Refer to [VOD System Setup Guide](./VOD_SYSTEM_SETUP.md)

---

## Quick Reference

### File Size Limits

| Type | Max Size |
|------|----------|
| Videos | 5 GB |
| Documents | 100 MB |
| Images | 50 MB |
| 3D Models | 50 MB |

### Supported Formats

| Type | Formats |
|------|---------|
| Videos | MP4, MOV, AVI |
| Documents | PDF |
| Images | PNG, JPG, JPEG |
| 3D Models | GLB, GLTF |

### Transcode Output

| Quality | Resolution | Bitrate |
|---------|------------|---------|
| 1080p | 1920x1080 | 3000 kbps |
| 720p | 1280x720 | 1500 kbps |
| 480p | 854x480 | 700 kbps |

### Lesson Types

| Type | Requires | Completion Trigger |
|------|----------|-------------------|
| VIDEO | Media (video) | 90% watched |
| ARTICLE | Content (text) | Manual mark complete |
| QUIZ/MCQ | Quiz | Pass quiz |
| ASSIGNMENT | Assignment | Graded by instructor |
| AR | Media (3D model) | Manual mark complete |
| LIVE | External link | Manual mark complete |

---

## Additional Resources

- [VOD System Setup Guide](./VOD_SYSTEM_SETUP.md) - Technical setup instructions
- [Design Document](./.kiro/specs/vod-media-system/design.md) - System architecture
- [Requirements Document](./.kiro/specs/vod-media-system/requirements.md) - Feature specifications
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/) - R2 storage details
- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216) - Streaming protocol

---

**Last Updated**: February 2026  
**Version**: 1.0
