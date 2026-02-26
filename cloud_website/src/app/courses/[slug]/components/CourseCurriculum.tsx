'use client';

import { useState } from 'react';
import { Course, CurriculumModule, Lesson } from '@/types';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  QuestionMarkCircleIcon,
  ClockIcon,
  LockClosedIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface CourseCurriculumProps {
  course: Course;
  isEnrolled: boolean;
}

export default function CourseCurriculum({ course, isEnrolled }: CourseCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { progress, isLessonCompleted } = useCourseProgress(course.id);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'Video':
        return <PlayIcon className="w-4 h-4" />;
      case 'Reading':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'Exercise':
        return <CodeBracketIcon className="w-4 h-4" />;
      case 'Quiz':
        return <QuestionMarkCircleIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getLessonTypeColor = (type: Lesson['type']) => {
    switch (type) {
      case 'Video':
        return 'text-blue-600 bg-blue-50';
      case 'Reading':
        return 'text-green-600 bg-green-50';
      case 'Exercise':
        return 'text-purple-600 bg-purple-50';
      case 'Quiz':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const totalLessons = course.curriculum.reduce((total, module) => total + module.lessons.length, 0);
  const totalDuration = course.curriculum.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0), 0
  );
  const previewLessons = course.curriculum.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.isPreview).length, 0
  );

  if (course.curriculum.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Curriculum Coming Soon
          </h3>
          <p className="text-gray-600">
            The detailed curriculum for this course is being finalized. Check back soon for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Curriculum Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{course.curriculum.length}</span> modules
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PlayIcon className="w-5 h-5 text-green-500" />
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{totalLessons}</span> lessons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-purple-500" />
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{formatDuration(totalDuration)}</span> total
            </span>
          </div>
        </div>
        {previewLessons > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {previewLessons} free preview lesson{previewLessons !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Modules */}
      <div className="space-y-4">
        {course.curriculum
          .sort((a, b) => a.order - b.order)
          .map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleDuration = module.lessons.reduce((total, lesson) => total + lesson.duration, 0);
            
            return (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Module {module.order}: {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}</div>
                      <div>{formatDuration(moduleDuration)}</div>
                    </div>
                  </div>
                </button>

                {/* Module Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="px-6 py-4">
                      <div className="space-y-3">
                        {module.lessons.map((lesson, index) => {
                          const completed = isLessonCompleted(lesson.id);
                          
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getLessonTypeColor(lesson.type)}`}>
                                  {getLessonIcon(lesson.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">
                                      {index + 1}. {lesson.title}
                                    </h4>
                                    {completed && (
                                      <CheckCircleIcon className="w-5 h-5 text-green-500" title="Completed" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-500 uppercase font-medium">
                                      {lesson.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDuration(lesson.duration)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {lesson.isPreview || isEnrolled ? (
                                  <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors">
                                    <EyeIcon className="w-3 h-3" />
                                    {lesson.isPreview ? 'Preview' : 'Start'}
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                    <LockClosedIcon className="w-3 h-3" />
                                    Locked
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Course Completion Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What You'll Achieve
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700">Certificate of completion</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CodeBracketIcon className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">Hands-on projects</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-700">Lifetime access</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-gray-700">Q&A support</span>
          </div>
        </div>
      </div>
    </div>
  );
}