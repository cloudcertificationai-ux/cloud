/**
 * MediaUploader Usage Example
 * 
 * This file demonstrates how to use the MediaUploader component
 * in the admin panel for uploading media to the VOD Media System.
 */

'use client';

import { MediaUploader } from './MediaUploader';
import { useState } from 'react';

export function MediaUploaderExample() {
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Media</h1>
      
      <MediaUploader
        onUploadComplete={(mediaId, media) => {
          console.log('Upload complete:', { mediaId, media });
          setUploadedMediaId(mediaId);
          setError(null);
        }}
        onUploadError={(error) => {
          console.error('Upload error:', error);
          setError(error.message);
          setUploadedMediaId(null);
        }}
      />

      {uploadedMediaId && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Media uploaded successfully! Media ID: <code className="font-mono">{uploadedMediaId}</code>
          </p>
          <p className="text-xs text-green-600 mt-1">
            You can now use this media ID when creating lessons.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Integration with Lesson Creation Form
 * 
 * Example of using MediaUploader in a lesson creation form:
 */

export function LessonFormWithMediaUpload() {
  const [mediaId, setMediaId] = useState<string>('');
  const [lessonData, setLessonData] = useState({
    title: '',
    content: '',
    kind: 'VIDEO' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit lesson with mediaId
    const response = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lessonData,
        mediaId: mediaId || undefined,
      }),
    });

    if (response.ok) {
      console.log('Lesson created successfully');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Title
        </label>
        <input
          type="text"
          value={lessonData.title}
          onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Type
        </label>
        <select
          value={lessonData.kind}
          onChange={(e) => setLessonData({ ...lessonData, kind: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="VIDEO">Video</option>
          <option value="ARTICLE">Article</option>
          <option value="QUIZ">Quiz</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
      </div>

      {lessonData.kind === 'VIDEO' && (
        <div>
          <MediaUploader
            onUploadComplete={(id) => {
              setMediaId(id);
            }}
            onUploadError={(error) => {
              console.error('Upload failed:', error);
            }}
          />
          {mediaId && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Video uploaded (ID: {mediaId})
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={lessonData.kind === 'VIDEO' && !mediaId}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Lesson
      </button>
    </form>
  );
}
