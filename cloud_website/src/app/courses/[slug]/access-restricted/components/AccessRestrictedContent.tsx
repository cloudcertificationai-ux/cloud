'use client';

import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon, 
  EnvelopeIcon, 
  ArrowLeftIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
}

interface AccessRestrictedContentProps {
  course: Course;
  enrollmentStatus: string;
}

export default function AccessRestrictedContent({ 
  course, 
  enrollmentStatus 
}: AccessRestrictedContentProps) {
  const router = useRouter();

  const getStatusMessage = () => {
    switch (enrollmentStatus) {
      case 'CANCELLED':
        return {
          title: 'Enrollment Cancelled',
          description: 'Your enrollment in this course has been cancelled. You no longer have access to the course content.',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      case 'REFUNDED':
        return {
          title: 'Enrollment Refunded',
          description: 'Your enrollment has been refunded. You no longer have access to the course content.',
          icon: ShieldExclamationIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          title: 'Access Restricted',
          description: 'Your access to this course is currently restricted. Please contact support for more information.',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/courses/${course.slug}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Course</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Icon Section */}
            <div className={`${statusInfo.bgColor} p-8 text-center`}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
                <StatusIcon className={`w-10 h-10 ${statusInfo.iconColor}`} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {statusInfo.title}
              </h1>
              <p className="text-gray-600">
                {course.title}
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {statusInfo.description}
                </p>
              </div>

              {/* What This Means */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  What This Means
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>You cannot access course lessons or materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>Your progress has been preserved but is not accessible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>You will not receive course updates or notifications</span>
                  </li>
                </ul>
              </div>

              {/* Support Section */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Need Help?
                </h2>
                <p className="text-gray-600 mb-4">
                  If you believe this is an error or have questions about your enrollment status, 
                  please contact our support team.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:support@anywheredoor.com"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>Contact Support</span>
                  </a>
                  
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If you'd like to re-enroll in this course, 
                  you can do so from the course page. Your previous progress may not be restored.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Courses */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/courses')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse Other Courses →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
