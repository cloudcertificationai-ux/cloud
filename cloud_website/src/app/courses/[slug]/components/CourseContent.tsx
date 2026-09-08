'use client';

import { useState } from 'react';
import { Course, Instructor, StudentTestimonial } from '@/types';
import CourseOverview from './CourseOverview';
import CourseCurriculum from './CourseCurriculum';
import CourseInstructors from './CourseInstructors';
import CourseReviews from './CourseReviews';
import EnrollmentSidebar from './EnrollmentSidebar';

interface CourseContentProps {
  course: Course;
  instructors: Instructor[];
  testimonials: StudentTestimonial[];
  isEnrolled: boolean;
}

type TabType = 'overview' | 'curriculum' | 'instructors' | 'reviews';

const TABS: { id: TabType; label: string; d: string }[] = [
  {
    id: 'overview',
    label: 'Overview',
    d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'curriculum',
    label: 'Curriculum',
    d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    id: 'instructors',
    label: 'Instructors',
    d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    d: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
];

export default function CourseContent({
  course,
  instructors,
  testimonials,
  isEnrolled,
}: CourseContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const counts: Record<TabType, number | null> = {
    overview: null,
    curriculum: course.curriculum.length || null,
    instructors: instructors.length || 1,
    reviews: course.rating.count || null,
  };

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ── Left: tab navigation + content ── */}
          <div className="flex-1 min-w-0">

            {/* Bento Tab bar */}
            <div className="grid grid-cols-4 gap-2 mb-4" role="tablist">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className="rounded-xl py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200"
                    style={{
                      background: active ? '#0f172a' : '#ffffff',
                      border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      boxShadow: active ? '0 4px 16px rgba(15,23,42,0.15)' : 'none',
                    }}
                  >
                    <svg width="16" height="16" fill="none"
                      stroke={active ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.d} />
                    </svg>
                    <span className="text-xs font-semibold hidden sm:block"
                      style={{ color: active ? '#f1f5f9' : '#64748b' }}>
                      {tab.label}
                    </span>
                    {counts[tab.id] !== null && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          background: active ? 'rgba(56,189,248,0.15)' : '#f1f5f9',
                          color: active ? '#38bdf8' : '#94a3b8',
                        }}>
                        {counts[tab.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content card */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 8px rgba(15,23,42,0.04)',
              }}
            >
              {activeTab === 'overview'    && <CourseOverview course={course} />}
              {activeTab === 'curriculum'  && <CourseCurriculum course={course} isEnrolled={isEnrolled} />}
              {activeTab === 'instructors' && <CourseInstructors instructors={instructors} course={course} />}
              {activeTab === 'reviews'     && <CourseReviews course={course} testimonials={testimonials} />}
            </div>
          </div>

          {/* ── Right: sticky enrollment bento card ── */}
          <div
            className="hidden lg:block w-80 shrink-0"
            style={{ position: 'sticky', top: '88px' }}
          >
            <EnrollmentSidebar course={course} />
          </div>

        </div>
      </div>
    </div>
  );
}
