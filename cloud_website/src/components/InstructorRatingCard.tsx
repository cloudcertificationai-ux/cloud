'use client';

import { Instructor } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface InstructorRatingCardProps {
  instructor: Instructor;
  showDetailedBreakdown?: boolean;
  showRecentFeedback?: boolean;
  className?: string;
}

interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

interface StudentFeedback {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  courseName: string;
  date: Date;
  isVerified: boolean;
}

// Mock data - in real app this would come from the instructor data
const getRatingBreakdown = (instructorId: string): RatingBreakdown[] => {
  const breakdowns: Record<string, RatingBreakdown[]> = {
    '1': [
      { stars: 5, count: 1050, percentage: 84.3 },
      { stars: 4, count: 150, percentage: 12.1 },
      { stars: 3, count: 30, percentage: 2.4 },
      { stars: 2, count: 10, percentage: 0.8 },
      { stars: 1, count: 7, percentage: 0.6 },
    ],
    '2': [
      { stars: 5, count: 720, percentage: 80.7 },
      { stars: 4, count: 130, percentage: 14.6 },
      { stars: 3, count: 25, percentage: 2.8 },
      { stars: 2, count: 12, percentage: 1.3 },
      { stars: 1, count: 5, percentage: 0.6 },
    ],
  };
  
  return breakdowns[instructorId] || [];
};

const getRecentFeedback = (instructorId: string): StudentFeedback[] => {
  const feedback: Record<string, StudentFeedback[]> = {
    '1': [
      {
        id: '1',
        studentName: 'Sarah M.',
        rating: 5,
        comment: 'Excellent instructor! Clear explanations and great real-world examples.',
        courseName: 'Complete React Developer Bootcamp',
        date: new Date('2024-12-15'),
        isVerified: true,
      },
      {
        id: '2',
        studentName: 'David L.',
        rating: 5,
        comment: 'Best programming course I\'ve taken. Sarah makes complex concepts easy to understand.',
        courseName: 'Full Stack JavaScript Mastery',
        date: new Date('2024-12-10'),
        isVerified: true,
      },
      {
        id: '3',
        studentName: 'Maria K.',
        rating: 4,
        comment: 'Great course content and instructor support. Would recommend!',
        courseName: 'Complete React Developer Bootcamp',
        date: new Date('2024-12-08'),
        isVerified: false,
      },
    ],
    '2': [
      {
        id: '4',
        studentName: 'John D.',
        rating: 5,
        comment: 'Dr. Chen\'s expertise in ML is incredible. Learned so much!',
        courseName: 'Data Science Fundamentals',
        date: new Date('2024-12-12'),
        isVerified: true,
      },
      {
        id: '5',
        studentName: 'Lisa W.',
        rating: 5,
        comment: 'Perfect balance of theory and practical applications.',
        courseName: 'Machine Learning Masterclass',
        date: new Date('2024-12-05'),
        isVerified: true,
      },
    ],
  };
  
  return feedback[instructorId] || [];
};

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          {star <= rating ? (
            <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
          ) : (
            <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function InstructorRatingCard({
  instructor,
  showDetailedBreakdown = true,
  showRecentFeedback = true,
  className = '',
}: InstructorRatingCardProps) {
  const ratingBreakdown = getRatingBreakdown(instructor.id);
  const recentFeedback = getRecentFeedback(instructor.id);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header with overall rating */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {instructor.rating.average}
        </div>
        <RatingStars rating={Math.round(instructor.rating.average)} size="lg" />
        <p className="text-gray-600 mt-2">
          Based on {instructor.rating.count.toLocaleString()} student reviews
        </p>
      </div>

      {/* Rating breakdown */}
      {showDetailedBreakdown && ratingBreakdown.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
          <div className="space-y-2">
            {ratingBreakdown.map((breakdown) => (
              <div key={breakdown.stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm text-gray-600">{breakdown.stars}</span>
                  <StarIcon className="w-3 h-3 text-yellow-400" />
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.percentage}%` }}
                  />
                </div>
                
                <div className="text-sm text-gray-600 w-16 text-right">
                  {breakdown.count}
                </div>
                
                <div className="text-sm text-gray-500 w-12 text-right">
                  {breakdown.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent feedback */}
      {showRecentFeedback && recentFeedback.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Recent Student Feedback</h4>
          <div className="space-y-4">
            {recentFeedback.slice(0, 3).map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{feedback.studentName}</span>
                    {feedback.isVerified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <RatingStars rating={feedback.rating} size="sm" />
                </div>
                
                <p className="text-gray-700 mb-2">"{feedback.comment}"</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{feedback.courseName}</span>
                  <span>{feedback.date.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {recentFeedback.length > 3 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all {instructor.rating.count} reviews
              </button>
            </div>
          )}
        </div>
      )}

      {/* Teaching quality indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Teaching Quality</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">Course Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">4.8</div>
            <div className="text-sm text-gray-600">Avg. Course Rating</div>
          </div>
        </div>
      </div>

      {/* Student success metrics */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600">87%</div>
            <div className="text-xs text-gray-600">Students Get Jobs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">92%</div>
            <div className="text-xs text-gray-600">Would Recommend</div>
          </div>
        </div>
      </div>
    </div>
  );
}