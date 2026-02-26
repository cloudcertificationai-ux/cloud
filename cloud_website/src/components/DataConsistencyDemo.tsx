import React, { useState, useCallback } from 'react';
import { useDataConsistency, useFreshData, useDataChangeListener } from '@/hooks/useDataConsistency';
import { Course, Instructor } from '@/types';

/**
 * Demo component showing data consistency management in action
 * This component demonstrates how data updates are reflected consistently across the application
 */
export function DataConsistencyDemo() {
  const {
    updateCourseConsistently,
    updateInstructorConsistently,
    validateDataConsistency,
    getDataFreshness,
    state,
  } = useDataConsistency();

  // Ensure we have fresh data
  useFreshData(['courses', 'instructors']);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [consistencyReport, setConsistencyReport] = useState<{
    isConsistent: boolean;
    issues: string[];
  } | null>(null);

  // Listen for data changes
  useDataChangeListener(
    useCallback((changes) => {
      console.log('Data changed:', changes);
      // Automatically validate consistency when data changes
      const report = validateDataConsistency();
      setConsistencyReport(report);
    }, [validateDataConsistency]),
    ['courses', 'instructors']
  );

  // Update course rating (demonstrates consistent updates)
  const updateCourseRating = useCallback((course: Course, newRating: number) => {
    const updatedCourse = {
      ...course,
      rating: {
        ...course.rating,
        average: newRating,
      },
    };
    updateCourseConsistently(updatedCourse);
  }, [updateCourseConsistently]);

  // Update instructor experience (demonstrates consistent updates)
  const updateInstructorExperience = useCallback((instructor: Instructor, newYears: number) => {
    const updatedInstructor = {
      ...instructor,
      experience: {
        ...instructor.experience,
        years: newYears,
      },
    };
    updateInstructorConsistently(updatedInstructor);
  }, [updateInstructorConsistently]);

  // Check data consistency
  const checkConsistency = useCallback(() => {
    const report = validateDataConsistency();
    setConsistencyReport(report);
  }, [validateDataConsistency]);

  const freshness = getDataFreshness();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Data Consistency Management Demo
        </h2>
        
        <p className="text-gray-600 mb-6">
          This demo shows how data updates are managed consistently across the application.
          When you update a course or instructor, all related data is automatically synchronized.
        </p>

        {/* Data Freshness Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Freshness Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(freshness).map(([key, status]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 capitalize">{key}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {status.isLoading && <span className="text-blue-600">Loading...</span>}
                  {status.hasError && <span className="text-red-600">Error</span>}
                  {!status.isLoading && !status.hasError && (
                    <span className={status.isStale ? 'text-yellow-600' : 'text-green-600'}>
                      {status.isStale ? 'Stale' : 'Fresh'}
                    </span>
                  )}
                </div>
                {status.lastUpdated && (
                  <div className="text-xs text-gray-500 mt-1">
                    {status.lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Consistency Check */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Data Consistency</h3>
            <button
              onClick={checkConsistency}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              aria-label="Check data consistency"
            >
              Check Consistency
            </button>
          </div>
          
          {consistencyReport && (
            <div className={`p-4 rounded-lg ${
              consistencyReport.isConsistent 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium ${
                consistencyReport.isConsistent ? 'text-green-800' : 'text-red-800'
              }`}>
                {consistencyReport.isConsistent 
                  ? '✓ Data is consistent' 
                  : '⚠ Data consistency issues found'
                }
              </div>
              {consistencyReport.issues.length > 0 && (
                <ul className="mt-2 text-sm text-red-700">
                  {consistencyReport.issues.map((issue, index) => (
                    <li key={index} className="mt-1">• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Course Selection and Update */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Course Rating</h3>
          <div className="space-y-3">
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = state.courses.find(c => c.id === e.target.value);
                setSelectedCourse(course || null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a course...</option>
              {state.courses.slice(0, 5).map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} (Rating: {course.rating.average})
                </option>
              ))}
            </select>
            
            {selectedCourse && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Current Rating: {selectedCourse.rating.average}
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={selectedCourse.rating.average}
                  onChange={(e) => updateCourseRating(selectedCourse, parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  {selectedCourse.rating.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Instructor Selection and Update */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Instructor Experience</h3>
          <div className="space-y-3">
            <select
              value={selectedInstructor?.id || ''}
              onChange={(e) => {
                const instructor = state.instructors.find(i => i.id === e.target.value);
                setSelectedInstructor(instructor || null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select an instructor...</option>
              {state.instructors.slice(0, 5).map(instructor => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name} ({instructor.experience.years} years)
                </option>
              ))}
            </select>
            
            {selectedInstructor && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Current Experience: {selectedInstructor.experience.years} years
                </span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={selectedInstructor.experience.years}
                  onChange={(e) => updateInstructorExperience(selectedInstructor, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium">
                  {selectedInstructor.experience.years} years
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data Statistics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Data Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">Courses</div>
              <div className="text-gray-600">{state.courses.length} total</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Instructors</div>
              <div className="text-gray-600">{state.instructors.length} total</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Testimonials</div>
              <div className="text-gray-600">{state.testimonials.length} total</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Avg Rating</div>
              <div className="text-gray-600">
                {state.courses.length > 0 
                  ? (state.courses.reduce((sum, course) => sum + course.rating.average, 0) / state.courses.length).toFixed(1)
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataConsistencyDemo;