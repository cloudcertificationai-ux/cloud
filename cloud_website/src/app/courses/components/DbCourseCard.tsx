import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export interface DbCourse {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  priceCents: number;
  currency: string;
  level: string | null;
  durationMin: number | null;
  rating: number | null;
  thumbnailUrl: string | null;
  Category: { id: string; name: string; slug: string } | null;
  Instructor: { id: string; name: string; avatar: string | null } | null;
  _count: { Enrollment: number };
}

interface DbCourseCardProps {
  course: DbCourse;
  displayMode?: 'compact' | 'detailed';
  showInstructor?: boolean;
}

function formatPrice(priceCents: number, currency: string): string {
  const amount = priceCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDuration(durationMin: number | null): string | null {
  if (!durationMin) return null;
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export default function DbCourseCard({
  course,
  displayMode = 'detailed',
  showInstructor = true,
}: DbCourseCardProps) {
  const duration = formatDuration(course.durationMin);
  const price = formatPrice(course.priceCents, course.currency);
  const instructorInitials = course.Instructor?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <Card
      className="group h-full flex flex-col overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      padding="xs"
      hover={true}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gray-100">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={`${course.title} course thumbnail`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <svg
              className="w-16 h-16 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        {/* Level badge */}
        {course.level && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" color="neutral" size="sm" className="bg-white/90 backdrop-blur-sm">
              {course.level}
            </Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <Button variant="primary" color="primary" size="md">
            View Details
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category */}
        {course.Category && (
          <div className="mb-3">
            <Badge variant="default" color="primary" size="sm" className="text-xs font-semibold">
              {course.Category.name}
            </Badge>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
          <Link
            href={`/courses/${course.slug}`}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {course.title}
          </Link>
        </h3>

        {/* Summary */}
        {course.summary && (
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
            {course.summary}
          </p>
        )}

        {/* Instructor */}
        {showInstructor && course.Instructor && (
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0">
              {course.Instructor.avatar ? (
                <Image
                  src={course.Instructor.avatar}
                  alt={course.Instructor.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                instructorInitials
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {course.Instructor.name}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {duration && (
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{duration}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{course._count.Enrollment.toLocaleString()}</span>
          </div>
        </div>

        {/* Rating */}
        {course.rating !== null && (
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2" aria-label={`Rating: ${course.rating} out of 5`}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating!)
                      ? 'text-yellow-400'
                      : i < course.rating!
                      ? 'text-yellow-200'
                      : 'text-gray-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-2xl font-bold text-gray-900">
            <span className="sr-only">Price: </span>
            {price}
          </span>
          <Button
            variant="primary"
            color="primary"
            size="md"
            className="font-semibold"
            href={`/courses/${course.slug}`}
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
