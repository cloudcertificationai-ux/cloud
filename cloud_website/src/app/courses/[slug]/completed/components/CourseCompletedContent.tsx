'use client';

import { useRouter } from 'next/navigation';
import { 
  TrophyIcon, 
  AcademicCapIcon, 
  ArrowDownTrayIcon,
  ShareIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  instructor?: {
    name: string;
  };
}

interface Enrollment {
  enrolledAt: Date;
  completionPercentage: number;
}

interface CourseCompletedContentProps {
  course: Course;
  enrollment: Enrollment | null;
  userName: string;
}

export default function CourseCompletedContent({ 
  course, 
  enrollment,
  userName 
}: CourseCompletedContentProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadCertificate = () => {
    // TODO: Implement certificate download
    alert('Certificate download will be available soon!');
  };

  const handleShareCompletion = () => {
    // TODO: Implement social sharing
    if (navigator.share) {
      navigator.share({
        title: `I completed ${course.title}!`,
        text: `I just completed ${course.title} on Anywheredoor!`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      alert('Sharing will be available soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Confetti Effect (Simple CSS animation) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Completion Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-6">
                <TrophyIcon className="w-14 h-14 text-yellow-500" />
              </div>
              
              <h1 className="text-4xl font-bold mb-2">
                Congratulations, {userName}!
              </h1>
              
              <p className="text-xl text-blue-100 mb-6">
                You've successfully completed
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">
                {course.title}
              </h2>

              {course.instructor && (
                <p className="text-blue-100">
                  Taught by {course.instructor.name}
                </p>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Achievement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {enrollment?.completionPercentage || 100}%
                  </div>
                  <div className="text-gray-600">Completed</div>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <AcademicCapIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    Certificate
                  </div>
                  <div className="text-gray-600">Earned</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <StarIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    Expert
                  </div>
                  <div className="text-gray-600">Level Achieved</div>
                </div>
              </div>

              {/* Completion Date */}
              {enrollment && (
                <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Enrolled on <span className="font-semibold">{formatDate(enrollment.enrolledAt)}</span>
                  </p>
                  <p className="text-gray-600 mt-1">
                    Completed on <span className="font-semibold">{formatDate(new Date())}</span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={handleDownloadCertificate}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  <span>Download Certificate</span>
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleShareCompletion}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share Achievement</span>
                  </button>
                  
                  <button
                    onClick={() => router.push(`/courses/${course.slug}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <span>Review Course</span>
                  </button>
                </div>
              </div>

              {/* What's Next Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  What's Next?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Continue Learning
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Explore more courses to expand your skills and knowledge.
                    </p>
                    <button
                      onClick={() => router.push('/courses')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Browse Courses</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Share Your Knowledge
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Help others by leaving a review of this course.
                    </p>
                    <button
                      onClick={() => router.push(`/courses/${course.slug}?review=true`)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <span>Write a Review</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dashboard Link */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confetti CSS */}
      <style jsx>{`
        .confetti-container {
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          opacity: 0;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
