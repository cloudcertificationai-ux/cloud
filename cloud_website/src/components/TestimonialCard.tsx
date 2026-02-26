'use client';

import { StudentTestimonial } from '@/types';
import OptimizedImage from './OptimizedImage';
import { StarIcon } from '@heroicons/react/24/solid';

interface TestimonialCardProps {
  testimonial: StudentTestimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className = '' }: TestimonialCardProps) {
  const {
    studentName,
    studentPhoto,
    courseCompleted,
    rating,
    testimonialText,
    careerOutcome,
    isVerified,
    dateCompleted,
  } = testimonial;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      {/* Header with student info */}
      <div className="flex items-center mb-4">
        <div className="relative">
          <OptimizedImage
            src={studentPhoto}
            alt={`${studentName} profile photo`}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Verified student"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-gray-900">{studentName}</h3>
          <p className="text-sm text-gray-600">{courseCompleted}</p>
          
          {/* Rating stars */}
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Testimonial text */}
      <blockquote className="text-gray-700 mb-4 italic">
        "{testimonialText}"
      </blockquote>

      {/* Career outcome - Enhanced with prominent salary increase */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Career Transformation
        </h4>
        
        {/* Salary increase highlight */}
        {careerOutcome.salaryIncrease && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  +{careerOutcome.salaryIncrease}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Salary Increase
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          {careerOutcome.previousRole && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
              <div>
                <span className="text-gray-500">From:</span>
                <span className="ml-1 text-gray-700 font-medium">{careerOutcome.previousRole}</span>
              </div>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div>
              <span className="text-gray-500">To:</span>
              <span className="ml-1 text-gray-900 font-semibold">
                {careerOutcome.currentRole}
              </span>
              <span className="text-gray-600"> at </span>
              <span className="text-blue-600 font-medium">{careerOutcome.companyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completion date */}
      <div className="mt-4 text-xs text-gray-500">
        Completed: {dateCompleted.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}