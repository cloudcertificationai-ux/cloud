'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LessonPlayer from '@/components/LessonPlayer';
import ProgressTracker from '@/components/ProgressTracker';
import LessonNavigation from './LessonNavigation';
import { ChevronLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProgress } from '@/hooks/useProgress';

interface Course {
  id: string;
  title: string;
  slug: string;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  kind: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MCQ' | 'ASSIGNMENT' | 'AR' | 'LIVE';
  videoUrl?: string;
  content?: string;
  duration?: number;
  order: number;
  mediaId?: string | null;
  quizId?: string | null;
  assignmentId?: string | null;
  media?: {
    id: string;
    manifestUrl: string | null;
    thumbnails: string[];
    duration: number | null;
  } | null;
  quiz?: {
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
  } | null;
  assignment?: {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    maxMarks: number;
    requirements: string;
  } | null;
}

interface ProgressData {
  lessonId: string | null;
  completed: boolean;
  timeSpent: number;
  lastPosition: number;
}

interface LessonPlayerPageProps {
  course: Course;
  currentLessonId: string;
  userId: string;
  initialProgress: ProgressData[];
}

export default function LessonPlayerPage({
  course,
  currentLessonId,
  userId,
  initialProgress,
}: LessonPlayerPageProps) {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Use the new progress hook with auto-save (requirement 18.2)
  const { updateProgress, isSaving, error: progressError } = useProgress({
    courseId: course.id,
    autoSaveInterval: 30000, // 30 seconds
  });

  // Find current lesson
  useEffect(() => {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === currentLessonId);
      if (lesson) {
        setCurrentLesson(lesson);
        break;
      }
    }
  }, [currentLessonId, course.modules]);

  // Auto-save progress (requirement 11.1, 11.2, 11.5)
  const handleProgress = async (progress: {
    timeSpent: number;
    lastPosition: number;
    completed: boolean;
  }) => {
    if (!currentLesson) return;

    try {
      await updateProgress({
        lessonId: currentLesson.id,
        ...progress,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle lesson completion
  const handleComplete = async () => {
    if (!currentLesson) return;

    await handleProgress({
      timeSpent: 0,
      lastPosition: 0,
      completed: true,
    });

    // Check if this was the last lesson
    const nextLesson = getNextLesson();
    if (!nextLesson) {
      // Course completed! Show completion modal
      router.push(`/courses/${course.slug}/completed`);
    } else {
      // Move to next lesson
      router.push(`/courses/${course.slug}/learn?lesson=${nextLesson.id}`);
    }
  };

  // Get next lesson
  const getNextLesson = (): Lesson | null => {
    if (!currentLesson) return null;

    let foundCurrent = false;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          return lesson;
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  // Get previous lesson
  const getPreviousLesson = (): Lesson | null => {
    if (!currentLesson) return null;

    let previousLesson: Lesson | null = null;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === currentLesson.id) {
          return previousLesson;
        }
        previousLesson = lesson;
      }
    }
    return null;
  };

  const handleLessonChange = (lessonId: string) => {
    router.push(`/courses/${course.slug}/learn?lesson=${lessonId}`);
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lesson not found</p>
          <button
            onClick={() => router.push(`/courses/${course.slug}`)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Return to course
          </button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-14">
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/courses/${course.slug}`)}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Course</span>
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {course.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 ${isSidebarOpen ? 'lg:mr-96' : ''}`}>
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {/* Lesson Title */}
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {currentLesson.title}
              </h2>
              {currentLesson.duration && (
                <p className="text-gray-600">
                  Duration: {Math.floor(currentLesson.duration / 60)} minutes
                </p>
              )}
            </div>

            {/* Lesson Player */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <LessonPlayer
                lesson={currentLesson}
                courseId={course.id}
                onComplete={handleComplete}
                onProgress={handleProgress}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => previousLesson && handleLessonChange(previousLesson.id)}
                disabled={!previousLesson}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  previousLesson
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Previous Lesson
              </button>
              
              <button
                onClick={() => nextLesson && handleLessonChange(nextLesson.id)}
                disabled={!nextLesson}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  nextLesson
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {nextLesson ? 'Next Lesson' : 'Course Complete'}
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={`fixed lg:fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-full sm:w-96 bg-white border-l border-gray-200 overflow-y-auto transition-transform z-30 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            {/* Progress Tracker */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h3>
              <ProgressTracker courseId={course.id} modules={course.modules} />
            </div>

            {/* Lesson Navigation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Content
              </h3>
              <LessonNavigation
                modules={course.modules as any}
                currentLessonId={currentLessonId}
                onLessonSelect={handleLessonChange}
                progress={initialProgress}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
