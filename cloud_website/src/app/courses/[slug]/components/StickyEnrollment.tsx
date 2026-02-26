'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { 
  StarIcon, 
  ClockIcon, 
  AcademicCapIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import EnrollmentModal from './EnrollmentModal';

interface StickyEnrollmentProps {
  course: Course;
}

export default function StickyEnrollment({ course }: StickyEnrollmentProps) {
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 600; // Approximate hero section height
      
      // Show mobile CTA after scrolling past hero
      setShowMobileCTA(scrollY > heroHeight);
      
      // Show desktop sidebar after scrolling past hero
      setShowDesktopSidebar(scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get the next available cohort
  const nextCohort = course.cohorts?.find(cohort => 
    cohort.status === 'Open' || cohort.status === 'Starting Soon'
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className={`hidden lg:block fixed top-4 right-4 w-80 z-40 transition-all duration-300 ${
        showDesktopSidebar ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Enroll in Course
              </h3>
              <button
                onClick={() => setShowDesktopSidebar(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Course Info */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {course.title}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{course.rating.average}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  <span>{course.duration.hours}h</span>
                </div>
              </div>
            </div>

            {/* Cohort Information */}
            {nextCohort && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Next Cohort</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nextCohort.status === 'Starting Soon' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {nextCohort.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-3 h-3 text-gray-500" />
                    <span>Starts: {formatDate(nextCohort.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-3 h-3 text-gray-500" />
                    <span>{nextCohort.currentEnrollment}/{nextCohort.maxStudents} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-3 h-3 text-gray-500" />
                    <span>{nextCohort.schedule.days.join(', ')} • {nextCohort.schedule.time} {nextCohort.timeZone}</span>
                  </div>
                  <div className="text-xs text-red-600 font-medium mt-1">
                    Enrollment deadline: {formatDate(nextCohort.enrollmentDeadline)}
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${course.price.amount}
                </span>
                {course.price.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${course.price.originalPrice}
                  </span>
                )}
              </div>
              {course.price.originalPrice && (
                <p className="text-sm text-green-600 font-medium">
                  Save ${course.price.originalPrice - course.price.amount}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setIsEnrollmentModalOpen(true)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
            >
              Enroll Now
            </button>

            <button className="w-full border border-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-4">
              Add to Wishlist
            </button>

            {/* Features */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4 text-green-500" />
                <span>Certificate included</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-500" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom CTA */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        showMobileCTA ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${course.price.amount}
                  </span>
                  {course.price.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${course.price.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{course.rating.average}</span>
                  <span>•</span>
                  <span>{course.duration.hours}h</span>
                  {nextCohort && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">Starts {formatDate(nextCohort.startDate)}</span>
                    </>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsEnrollmentModalOpen(true)}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        course={course}
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
      />
    </>
  );
}