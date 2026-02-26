'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CubeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'ar';
  duration?: number;
  order: number;
}

interface ProgressData {
  lessonId: string | null;
  completed: boolean;
  timeSpent: number;
  lastPosition: number;
}

interface LessonNavigationProps {
  modules: Module[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  progress: ProgressData[];
}

export default function LessonNavigation({
  modules,
  currentLessonId,
  onLessonSelect,
  progress,
}: LessonNavigationProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircleIcon className="w-5 h-5" />;
      case 'article':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'quiz':
        return <QuestionMarkCircleIcon className="w-5 h-5" />;
      case 'ar':
        return <CubeIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson =>
      isLessonCompleted(lesson.id)
    ).length;
    return {
      completed: completedLessons,
      total: module.lessons.length,
      percentage: Math.round((completedLessons / module.lessons.length) * 100),
    };
  };

  return (
    <div className="space-y-2">
      {modules.map((module) => {
        const isExpanded = expandedModules.has(module.id);
        const moduleProgress = getModuleProgress(module);

        return (
          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                {isExpanded ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {module.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {moduleProgress.completed} / {moduleProgress.total} lessons
                  </p>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - moduleProgress.percentage / 100)}`}
                      className="text-blue-600 transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {moduleProgress.percentage}%
                  </span>
                </div>
              </div>
            </button>

            {/* Lessons List */}
            {isExpanded && (
              <div className="bg-white">
                {module.lessons.map((lesson) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-l-4 ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50'
                          : isCompleted
                          ? 'border-green-500'
                          : 'border-transparent'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {getLessonIcon(lesson.type)}
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <h5 className={`font-medium truncate ${
                          isCurrent ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {lesson.title}
                        </h5>
                        {lesson.duration && (
                          <p className="text-sm text-gray-600">
                            {Math.floor(lesson.duration / 60)} min
                          </p>
                        )}
                      </div>

                      {isCompleted && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
