import Image from 'next/image';
import Link from 'next/link';

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

const LEVEL_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner: { bg: 'rgba(34,197,94,0.12)', text: '#15803d', dot: '#22c55e' },
  Intermediate: { bg: 'rgba(245,158,11,0.12)', text: '#b45309', dot: '#f59e0b' },
  Advanced: { bg: 'rgba(239,68,68,0.12)', text: '#b91c1c', dot: '#ef4444' },
};

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

function formatStudents(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${count}`;
}

export default function DbCourseCard({
  course,
  displayMode = 'detailed',
  showInstructor = true,
}: DbCourseCardProps) {
  const duration = formatDuration(course.durationMin);
  const price = formatPrice(course.priceCents, course.currency);
  const lvl = LEVEL_STYLE[course.level ?? ''] ?? { bg: 'rgba(148,163,184,0.15)', text: '#475569', dot: '#94a3b8' };
  const instructorInitials = course.Instructor?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  const isList = displayMode === 'compact';

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`group relative flex bg-white rounded-3xl border border-slate-200/70 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(15,23,42,0.22)] hover:border-blue-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isList ? 'flex-row items-stretch' : 'flex-col h-full'
      }`}
      style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
    >
      {/* Top accent bar, revealed on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 z-10"
        style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
      />

      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden flex-shrink-0 bg-slate-100 ${
          isList ? 'w-52 sm:w-64' : 'h-48 w-full'
        }`}
      >
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={`${course.title} course thumbnail`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0f172a,#1d4ed8)' }}>
            <svg className="w-14 h-14 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}

        {/* Level badge */}
        {course.level && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.92)', color: lvl.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: lvl.dot }} />
              {course.level}
            </span>
          </div>
        )}

        {/* Category chip overlapping bottom */}
        {course.Category && !isList && (
          <div className="absolute -bottom-3 left-3">
            <span
              className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-full text-white shadow-lg"
              style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
            >
              {course.Category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isList ? 'p-5' : 'p-6 pt-5'}`}>
        {isList && course.Category && (
          <span className="self-start inline-block w-fit text-[11px] font-bold px-2.5 py-1 rounded-full text-white mb-2" style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}>
            {course.Category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {course.title}
        </h3>

        {/* Summary */}
        {course.summary && !isList && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {course.summary}
          </p>
        )}

        {/* Instructor */}
        {showInstructor && course.Instructor && (
          <div className="flex items-center gap-2.5 mt-3.5">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {course.Instructor.avatar ? (
                <Image src={course.Instructor.avatar} alt={course.Instructor.name} width={28} height={28} className="object-cover w-full h-full" />
              ) : (
                instructorInitials
              )}
            </div>
            <p className="text-xs font-semibold text-slate-600 truncate">{course.Instructor.name}</p>
          </div>
        )}

        {/* Mini bento stat row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="rounded-xl px-2.5 py-2 flex items-center gap-1.5" style={{ background: 'rgba(251,191,36,0.09)' }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="#f59e0b" className="flex-shrink-0">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-slate-800">
              {course.rating !== null && course.rating > 0 ? course.rating.toFixed(1) : '—'}
            </span>
          </div>
          <div className="rounded-xl px-2.5 py-2 flex items-center gap-1.5" style={{ background: 'rgba(99,102,241,0.08)' }}>
            <svg width="13" height="13" fill="none" stroke="#6366f1" strokeWidth={2} viewBox="0 0 24 24" className="flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-bold text-slate-800">{formatStudents(course._count.Enrollment)}</span>
          </div>
        </div>

        {duration && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{duration} total</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-lg font-extrabold text-slate-900">{price}</span>
          <span
            className="inline-flex items-center gap-1 text-xs font-bold text-white px-3.5 py-2 rounded-xl transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
          >
            View Course
            <svg width="12" height="12" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
