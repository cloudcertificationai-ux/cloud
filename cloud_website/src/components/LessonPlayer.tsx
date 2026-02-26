'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import VideoPlayer from '@/components/VideoPlayer';
import QuizWidget from '@/components/QuizWidget';
import { AssignmentUploader } from '@/components/AssignmentUploader';

type LessonKind = 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MCQ' | 'ASSIGNMENT' | 'AR' | 'LIVE';

interface Media {
  id: string;
  manifestUrl: string | null;
  thumbnails: string[];
  duration: number | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: Array<{
    id: string;
    text: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ANSWER';
    options: Array<{ id: string; text: string }>;
    order: number;
    points: number;
  }>;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  requirements: string;
}

interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  videoUrl?: string;
  content?: string;
  duration?: number;
  mediaId?: string | null;
  quizId?: string | null;
  assignmentId?: string | null;
  media?: Media | null;
  quiz?: Quiz | null;
  assignment?: Assignment | null;
}

interface LessonPlayerProps {
  lesson: Lesson;
  courseId: string;
  onComplete: () => void;
  onProgress: (progress: ProgressUpdate) => void;
}

interface ProgressUpdate {
  timeSpent: number;
  lastPosition: number;
  completed: boolean;
}

export default function LessonPlayer({ lesson, courseId, onComplete, onProgress }: LessonPlayerProps) {
  // Render based on lesson kind (Requirements 5.1, 5.6)
  switch (lesson.kind) {
    case 'VIDEO':
      return (
        <VideoLessonRenderer 
          lesson={lesson} 
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    case 'ARTICLE':
      return (
        <ArticleRenderer 
          lesson={lesson}
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    case 'QUIZ':
    case 'MCQ':
      return (
        <QuizLessonRenderer 
          lesson={lesson}
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    case 'ASSIGNMENT':
      return (
        <AssignmentLessonRenderer 
          lesson={lesson}
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    case 'AR':
      return (
        <ARPlaceholder 
          lesson={lesson}
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    case 'LIVE':
      return (
        <LivePlaceholder 
          lesson={lesson}
          courseId={courseId}
          onComplete={onComplete} 
          onProgress={onProgress} 
        />
      );
    default:
      return <div className="text-center py-12 text-gray-500">Unsupported lesson type</div>;
  }
}

// Video Lesson Renderer - uses new VideoPlayer component
function VideoLessonRenderer({ lesson, courseId, onComplete, onProgress }: LessonPlayerProps) {
  const handleProgressUpdate = async (
    lessonId: string,
    completed: boolean,
    timeSpent: number,
    lastPosition: number
  ) => {
    onProgress({
      timeSpent,
      lastPosition,
      completed,
    });
    
    if (completed) {
      onComplete();
    }
  };

  // Use media URL if available, otherwise fall back to legacy videoUrl
  const videoUrl = lesson.media?.manifestUrl || lesson.videoUrl || '';
  const initialPosition = 0; // This should come from progress data

  if (!videoUrl) {
    return (
      <div className="text-center py-12 text-gray-500">
        No video available for this lesson
      </div>
    );
  }

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      lessonId={lesson.id}
      courseId={courseId}
      onProgressUpdate={handleProgressUpdate}
      initialPosition={initialPosition}
      manifestUrl={lesson.media?.manifestUrl || undefined}
      captions={[]}
    />
  );
}

// Quiz Lesson Renderer - uses new QuizWidget component
function QuizLessonRenderer({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const handleSubmit = (score: number, passed: boolean) => {
    onProgress({
      timeSpent: 0,
      lastPosition: 0,
      completed: passed,
    });
    
    if (passed) {
      onComplete();
    }
  };

  if (!lesson.quiz) {
    return (
      <div className="text-center py-12 text-gray-500">
        Quiz data not available
      </div>
    );
  }

  return (
    <QuizWidget
      quizId={lesson.quiz.id}
      title={lesson.quiz.title}
      description={lesson.quiz.description}
      timeLimit={lesson.quiz.timeLimit}
      passingScore={lesson.quiz.passingScore}
      questions={lesson.quiz.questions}
      onSubmit={handleSubmit}
    />
  );
}

// Assignment Lesson Renderer - uses new AssignmentUploader component
function AssignmentLessonRenderer({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const handleSubmitComplete = () => {
    onProgress({
      timeSpent: 0,
      lastPosition: 0,
      completed: true,
    });
    onComplete();
  };

  if (!lesson.assignment) {
    return (
      <div className="text-center py-12 text-gray-500">
        Assignment data not available
      </div>
    );
  }

  return (
    <AssignmentUploader
      assignmentId={lesson.assignment.id}
      onSubmitComplete={handleSubmitComplete}
    />
  );
}

// Article Renderer Component
function ArticleRenderer({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setHasScrolledToBottom(true);
        }
      }
    };

    const element = contentRef.current;
    element?.addEventListener('scroll', handleScroll);
    return () => element?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMarkComplete = () => {
    onProgress({
      timeSpent,
      lastPosition: 0,
      completed: true,
    });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div
        ref={contentRef}
        className="prose prose-lg max-w-none bg-white rounded-lg p-8 max-h-[600px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4" />
          <span>Reading time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={!hasScrolledToBottom}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            hasScrolledToBottom
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircleIcon className="w-5 h-5" />
          Mark as Complete
        </button>
      </div>
    </div>
  );
}

// AR Placeholder Component
function ARPlaceholder({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkComplete = () => {
    onProgress({
      timeSpent,
      lastPosition: 0,
      completed: true,
    });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-12 text-center border-2 border-dashed border-purple-300">
        <div className="text-gray-700">
          <div className="text-6xl mb-4">🥽</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">AR Experience</h3>
          <p className="text-lg mb-6 text-gray-600">
            Augmented Reality content will be available here
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This feature is coming soon. You'll be able to interact with 3D models and AR experiences.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4" />
          <span>Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
        </div>

        <button
          onClick={handleMarkComplete}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Mark as Complete
        </button>
      </div>
    </div>
  );
}

// Live Session Placeholder Component
function LivePlaceholder({ lesson, onComplete, onProgress }: LessonPlayerProps) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkComplete = () => {
    onProgress({
      timeSpent,
      lastPosition: 0,
      completed: true,
    });
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-12 text-center border-2 border-dashed border-red-300">
        <div className="text-gray-700">
          <div className="text-6xl mb-4">📡</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Session</h3>
          <p className="text-lg mb-6 text-gray-600">
            Live streaming content will be available here
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This feature is coming soon. You'll be able to join live classes and interact with instructors in real-time.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-4 h-4" />
          <span>Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
        </div>

        <button
          onClick={handleMarkComplete}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Mark as Complete
        </button>
      </div>
    </div>
  );
}
