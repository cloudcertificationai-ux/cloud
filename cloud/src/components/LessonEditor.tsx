'use client';

/**
 * LessonEditor Component
 * 
 * Type-specific lesson content editor with:
 * - Type selector (video, article, quiz, ar)
 * - Video lesson editor with upload
 * - Article lesson editor with rich text
 * - Quiz lesson editor with question builder
 * - AR lesson editor with 3D model upload
 * - Content validation based on lesson type
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MediaManager } from './MediaManager';
import {
  VideoCameraIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Lesson type enum
type LessonType = 'video' | 'article' | 'quiz' | 'ar';

// Quiz question structure
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Quiz content structure
interface QuizContent {
  questions: QuizQuestion[];
}

// AR content structure
interface ARContent {
  modelUrl: string;
  thumbnailUrl?: string;
  instructions?: string;
  interactionType: 'rotate' | 'scale' | 'animate';
}

// Validation schemas for different lesson types
const videoLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.literal('video'),
  videoUrl: z.string().url('Must be a valid video URL'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').optional(),
});

const articleLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.literal('article'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

const quizLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.literal('quiz'),
  content: z.string().min(1, 'Quiz must have at least one question'),
});

const arLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.literal('ar'),
  content: z.string().min(1, 'AR content is required'),
});

// Union schema
const lessonSchema = z.discriminatedUnion('type', [
  videoLessonSchema,
  articleLessonSchema,
  quizLessonSchema,
  arLessonSchema,
]);

export type LessonFormData = z.infer<typeof lessonSchema>;

export interface LessonEditorProps {
  lessonId?: string;
  moduleId: string;
  courseId: string;
  initialData?: Partial<LessonFormData> & {
    videoUrl?: string;
    duration?: number;
    content?: string;
  };
  onSave: (data: LessonFormData & { videoUrl?: string; duration?: number }) => Promise<void>;
  onCancel: () => void;
}

/**
 * Video Lesson Editor
 */
function VideoLessonEditor({
  videoUrl,
  duration,
  onVideoUrlChange,
  onDurationChange,
  courseId,
}: {
  videoUrl: string;
  duration?: number;
  onVideoUrlChange: (url: string) => void;
  onDurationChange: (duration: number) => void;
  courseId: string;
}) {
  const [showMediaManager, setShowMediaManager] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          className="input-field"
          placeholder="https://example.com/video.mp4"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes)
        </label>
        <input
          type="number"
          value={duration || ''}
          onChange={(e) => onDurationChange(parseInt(e.target.value) || 0)}
          className="input-field"
          min="1"
          placeholder="e.g., 15"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowMediaManager(!showMediaManager)}
        className="btn-secondary inline-flex items-center"
      >
        <VideoCameraIcon className="h-5 w-5 mr-2" />
        {showMediaManager ? 'Hide' : 'Upload'} Video
      </button>

      {showMediaManager && (
        <div className="border-t pt-4">
          <MediaManager
            courseId={courseId}
            onMediaSelect={onVideoUrlChange}
            allowedTypes={['video']}
            showLibrary={true}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Article Lesson Editor
 */
function ArticleLessonEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Article Content <span className="text-red-500">*</span>
      </label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="input-field font-mono text-sm"
        placeholder="Enter article content here... (Rich text editor can be integrated here)"
      />
      <p className="mt-2 text-xs text-gray-500">
        Note: A rich text editor (like TipTap or Slate) can be integrated here for better formatting
      </p>
    </div>
  );
}

/**
 * Quiz Lesson Editor
 */
function QuizLessonEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}) {
  const addQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    onChange([...questions, newQuestion]);
  }, [questions, onChange]);

  const updateQuestion = useCallback(
    (index: number, field: keyof QuizQuestion, value: any) => {
      const updated = [...questions];
      updated[index] = { ...updated[index], [field]: value };
      onChange(updated);
    },
    [questions, onChange]
  );

  const updateOption = useCallback(
    (questionIndex: number, optionIndex: number, value: string) => {
      const updated = [...questions];
      const options = [...updated[questionIndex].options];
      options[optionIndex] = value;
      updated[questionIndex] = { ...updated[questionIndex], options };
      onChange(updated);
    },
    [questions, onChange]
  );

  const removeQuestion = useCallback(
    (index: number) => {
      onChange(questions.filter((_, i) => i !== index));
    },
    [questions, onChange]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Quiz Questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="btn-secondary inline-flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No questions yet</p>
          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add First Question
          </button>
        </div>
      ) : (
        questions.map((question, qIndex) => (
          <div key={question.id} className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Question {qIndex + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, 'question', e.target.value)
                  }
                  className="input-field"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() =>
                          updateQuestion(qIndex, 'correctAnswer', oIndex)
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        className="input-field flex-1"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Select the radio button for the correct answer
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (optional)
                </label>
                <textarea
                  value={question.explanation || ''}
                  onChange={(e) =>
                    updateQuestion(qIndex, 'explanation', e.target.value)
                  }
                  rows={2}
                  className="input-field"
                  placeholder="Explain why this is the correct answer"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/**
 * AR Lesson Editor
 */
function ARLessonEditor({
  arContent,
  onChange,
  courseId,
}: {
  arContent: ARContent;
  onChange: (content: ARContent) => void;
  courseId: string;
}) {
  const [showMediaManager, setShowMediaManager] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          3D Model URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={arContent.modelUrl}
          onChange={(e) => onChange({ ...arContent, modelUrl: e.target.value })}
          className="input-field"
          placeholder="https://example.com/model.glb"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail URL
        </label>
        <input
          type="url"
          value={arContent.thumbnailUrl || ''}
          onChange={(e) =>
            onChange({ ...arContent, thumbnailUrl: e.target.value })
          }
          className="input-field"
          placeholder="https://example.com/thumbnail.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interaction Type
        </label>
        <select
          value={arContent.interactionType}
          onChange={(e) =>
            onChange({
              ...arContent,
              interactionType: e.target.value as ARContent['interactionType'],
            })
          }
          className="input-field"
        >
          <option value="rotate">Rotate</option>
          <option value="scale">Scale</option>
          <option value="animate">Animate</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={arContent.instructions || ''}
          onChange={(e) =>
            onChange({ ...arContent, instructions: e.target.value })
          }
          rows={3}
          className="input-field"
          placeholder="Instructions for interacting with the 3D model"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowMediaManager(!showMediaManager)}
        className="btn-secondary inline-flex items-center"
      >
        <CubeIcon className="h-5 w-5 mr-2" />
        {showMediaManager ? 'Hide' : 'Upload'} 3D Model
      </button>

      {showMediaManager && (
        <div className="border-t pt-4">
          <MediaManager
            courseId={courseId}
            onMediaSelect={(url) => onChange({ ...arContent, modelUrl: url })}
            allowedTypes={['3d-model']}
            showLibrary={true}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Main LessonEditor Component
 */
export function LessonEditor({
  lessonId,
  moduleId,
  courseId,
  initialData,
  onSave,
  onCancel,
}: LessonEditorProps) {
  const [lessonType, setLessonType] = useState<LessonType>(
    initialData?.type || 'video'
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [duration, setDuration] = useState(initialData?.duration);
  const [articleContent, setArticleContent] = useState(
    initialData?.type === 'article' ? initialData.content || '' : ''
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    if (initialData?.type === 'quiz' && initialData.content) {
      try {
        const parsed = JSON.parse(initialData.content) as QuizContent;
        return parsed.questions;
      } catch {
        return [];
      }
    }
    return [];
  });
  const [arContent, setArContent] = useState<ARContent>(() => {
    if (initialData?.type === 'ar' && initialData.content) {
      try {
        return JSON.parse(initialData.content) as ARContent;
      } catch {
        return {
          modelUrl: '',
          interactionType: 'rotate',
        };
      }
    }
    return {
      modelUrl: '',
      interactionType: 'rotate',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      let formData: any = {
        title,
        type: lessonType,
      };

      // Add type-specific data
      switch (lessonType) {
        case 'video':
          if (!videoUrl) {
            toast.error('Video URL is required');
            return;
          }
          formData.videoUrl = videoUrl;
          if (duration) formData.duration = duration;
          break;

        case 'article':
          if (!articleContent.trim()) {
            toast.error('Article content is required');
            return;
          }
          formData.content = articleContent;
          break;

        case 'quiz':
          if (quizQuestions.length === 0) {
            toast.error('At least one question is required');
            return;
          }
          const quizContent: QuizContent = { questions: quizQuestions };
          formData.content = JSON.stringify(quizContent);
          break;

        case 'ar':
          if (!arContent.modelUrl) {
            toast.error('3D model URL is required');
            return;
          }
          formData.content = JSON.stringify(arContent);
          break;
      }

      await onSave(formData);
      toast.success(lessonId ? 'Lesson updated!' : 'Lesson created!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {lessonId ? 'Edit Lesson' : 'Create Lesson'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Basic Info */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['video', 'article', 'quiz', 'ar'] as LessonType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLessonType(type)}
                  className={`
                    flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors
                    ${
                      lessonType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }
                  `}
                >
                  {type === 'video' && <VideoCameraIcon className="h-6 w-6" />}
                  {type === 'article' && <DocumentTextIcon className="h-6 w-6" />}
                  {type === 'quiz' && <QuestionMarkCircleIcon className="h-6 w-6" />}
                  {type === 'ar' && <CubeIcon className="h-6 w-6" />}
                  <span className="text-sm font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Type-Specific Content */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          {lessonType === 'video' && 'Video Content'}
          {lessonType === 'article' && 'Article Content'}
          {lessonType === 'quiz' && 'Quiz Content'}
          {lessonType === 'ar' && 'AR Content'}
        </h3>

        {lessonType === 'video' && (
          <VideoLessonEditor
            videoUrl={videoUrl}
            duration={duration}
            onVideoUrlChange={setVideoUrl}
            onDurationChange={setDuration}
            courseId={courseId}
          />
        )}

        {lessonType === 'article' && (
          <ArticleLessonEditor
            content={articleContent}
            onChange={setArticleContent}
          />
        )}

        {lessonType === 'quiz' && (
          <QuizLessonEditor
            questions={quizQuestions}
            onChange={setQuizQuestions}
          />
        )}

        {lessonType === 'ar' && (
          <ARLessonEditor
            arContent={arContent}
            onChange={setArContent}
            courseId={courseId}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : lessonId ? 'Update Lesson' : 'Create Lesson'}
        </button>
      </div>
    </form>
  );
}
