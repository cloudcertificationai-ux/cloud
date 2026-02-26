import Image from 'next/image';
import { Course, StudentTestimonial } from '@/types';
import { 
  StarIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import { 
  ChatBubbleLeftEllipsisIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface CourseReviewsProps {
  course: Course;
  testimonials: StudentTestimonial[];
}

export default function CourseReviews({ course, testimonials }: CourseReviewsProps) {
  // Generate rating distribution for visualization
  const ratingDistribution = {
    5: Math.floor(course.rating.count * 0.65),
    4: Math.floor(course.rating.count * 0.20),
    3: Math.floor(course.rating.count * 0.10),
    2: Math.floor(course.rating.count * 0.03),
    1: Math.floor(course.rating.count * 0.02),
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (testimonials.length === 0) {
    return (
      <div className="space-y-8">
        {/* Rating Overview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {course.rating.average}
              </span>
              {renderStars(Math.round(course.rating.average), 'lg')}
            </div>
            <p className="text-gray-600">
              Based on {course.rating.count.toLocaleString()} reviews
            </p>
          </div>
        </div>

        {/* No Reviews Message */}
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <ChatBubbleLeftEllipsisIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-600">
              Be the first to share your experience with this course!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <span className="text-5xl font-bold text-gray-900">
                {course.rating.average}
              </span>
              <div>
                {renderStars(Math.round(course.rating.average), 'lg')}
                <p className="text-gray-600 mt-1">
                  {course.rating.count.toLocaleString()} reviews
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600">
              <UserGroupIcon className="w-4 h-4" />
              <span>{course.enrollmentCount.toLocaleString()} students enrolled</span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = (count / course.rating.count) * 100;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          What Students Are Saying
        </h3>
        
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Student Photo */}
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto sm:mx-0">
                    <Image
                      src={testimonial.studentPhoto}
                      alt={testimonial.studentName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 text-center sm:text-left">
                  {/* Student Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.studentName}
                      </h4>
                      {testimonial.isVerified && (
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Student" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      {renderStars(testimonial.rating, 'sm')}
                      <span className="text-sm text-gray-500">
                        {formatDate(testimonial.dateCompleted)}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.testimonialText}"
                  </blockquote>

                  {/* Career Outcome */}
                  {testimonial.careerOutcome && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Career Impact</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {testimonial.careerOutcome.previousRole && (
                          <div>
                            <span className="text-gray-600">From:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {testimonial.careerOutcome.previousRole}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-gray-600">To:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {testimonial.careerOutcome.currentRole}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {testimonial.careerOutcome.companyName}
                          </span>
                        </div>
                        
                        {testimonial.careerOutcome.salaryIncrease && (
                          <div className="flex items-center gap-1">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-green-700">
                              +{testimonial.careerOutcome.salaryIncrease} salary increase
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Course Success Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">92%</p>
            <p className="text-sm text-gray-600">Career advancement rate</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">87%</p>
            <p className="text-sm text-gray-600">Course completion rate</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{course.rating.average}</p>
            <p className="text-sm text-gray-600">Average rating</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to Join These Success Stories?
        </h3>
        <p className="text-gray-600 mb-6">
          Start your learning journey today and transform your career.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Enroll Now
        </button>
      </div>
    </div>
  );
}