'use client';

import { useState } from 'react';
import { Course, Instructor, StudentTestimonial } from '@/types';
import CourseOverview from './CourseOverview';
import CourseCurriculum from './CourseCurriculum';
import CourseInstructors from './CourseInstructors';
import CourseReviews from './CourseReviews';

interface CourseContentProps {
  course: Course;
  instructors: Instructor[];
  testimonials: StudentTestimonial[];
  isEnrolled: boolean;
}

type TabType = 'overview' | 'curriculum' | 'instructors' | 'reviews';

export default function CourseContent({ course, instructors, testimonials, isEnrolled }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'curriculum', label: 'Curriculum', count: course.curriculum.length },
    { id: 'instructors', label: 'Instructors', count: instructors.length },
    { id: 'reviews', label: 'Reviews', count: course.rating.count },
  ] as const;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Course sections">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && <CourseOverview course={course} />}
              {activeTab === 'curriculum' && <CourseCurriculum course={course} isEnrolled={isEnrolled} />}
              {activeTab === 'instructors' && <CourseInstructors instructors={instructors} />}
              {activeTab === 'reviews' && <CourseReviews course={course} testimonials={testimonials} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}