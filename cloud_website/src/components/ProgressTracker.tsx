'use client';

import { useCourseProgress } from '@/hooks/useCourseProgress';
import { ClockIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

interface Module {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    duration?: number;
  }>;
}

interface ProgressTrackerProps {
  courseId: string;
  modules: Module[];
}

export default function ProgressTracker({ courseId, modules }: ProgressTrackerProps) {
  const { progress, loading, error } = useCourseProgress(courseId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Failed to load progress: {error}</p>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  // Calculate module-level progress
  const moduleProgress = modules.map(module => {
    const moduleLessonIds = module.lessons.map(l => l.id);
    const completedInModule = progress.detailedProgress.filter(
      p => moduleLessonIds.includes(p.lessonId) && p.completed
    ).length;
    return {
      moduleId: module.id,
      moduleTitle: module.title,
      total: module.lessons.length,
      completed: completedInModule,
      percentage: module.lessons.length > 0 ? (completedInModule / module.lessons.length) * 100 : 0,
    };
  });

  // Calculate total time spent
  const totalTimeSpent = progress.detailedProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const hours = Math.floor(totalTimeSpent / 3600);
  const minutes = Math.floor((totalTimeSpent % 3600) / 60);

  // Find last accessed lesson
  const lastAccessedLesson = progress.lastAccessedLesson
    ? modules
        .flatMap(m => m.lessons)
        .find(l => l.id === progress.lastAccessedLesson)
    : null;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <div className="flex items-center gap-2 text-blue-600">
            <AcademicCapIcon className="w-5 h-5" />
            <span className="font-semibold">{progress.completionPercentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {progress.completedLessons}/{progress.totalLessons}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs">Time Spent</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {hours > 0 ? `${hours}h ` : ''}{minutes}m
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <PlayIcon className="w-4 h-4 text-purple-500" />
              <span className="text-xs">Remaining</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {progress.totalLessons - progress.completedLessons}
            </p>
          </div>
        </div>
      </div>

      {/* Last Accessed Lesson */}
      {lastAccessedLesson && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Continue Learning</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{lastAccessedLesson.title}</p>
                <p className="text-sm text-gray-500">
                  {lastAccessedLesson.duration ? `${lastAccessedLesson.duration} min` : 'Continue'}
                </p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Module-Level Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-600 mb-4">Progress by Module</h4>
        <div className="space-y-4">
          {moduleProgress.map((module, index) => (
            <div key={module.moduleId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Module {index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{module.moduleTitle}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {module.completed}/{module.total}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    module.percentage === 100
                      ? 'bg-green-500'
                      : module.percentage > 0
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                  style={{ width: `${module.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {progress.completionPercentage === 100 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Congratulations! 🎉
              </h4>
              <p className="text-gray-600">
                You've completed all lessons in this course. Download your certificate now!
              </p>
            </div>
          </div>
          <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Download Certificate
          </button>
        </div>
      )}
    </div>
  );
}
