'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Course, Instructor } from '@/types';
import EnrollmentModal from './EnrollmentModal';

interface CourseHeroProps {
  course: Course;
  instructors: Instructor[];
}

const LEVEL_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner:     { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', dot: '#22c55e' },
  Intermediate: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', dot: '#f59e0b' },
  Advanced:     { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', dot: '#ef4444' },
};

export default function CourseHero({ course, instructors }: CourseHeroProps) {
  const [open, setOpen] = useState(false);
  const lvl = LEVEL_STYLE[course.level ?? ''] ?? { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', dot: '#94a3b8' };
  const outcomes: string[] = (course as any).learningOutcomes ?? [];

  const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.round(course.rating.average));

  return (
    <>
      {/* ═══════════════ HERO DARK SECTION ═══════════════ */}
      <div style={{ background: 'linear-gradient(160deg,#080f1e 0%,#0f1e3c 50%,#0f172a 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#475569' }}>
            <Link href="/courses" className="hover:text-slate-300 transition-colors">Courses</Link>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            <Link href={`/courses?category=${course.category.slug}`} className="hover:text-slate-300 transition-colors">{course.category.name}</Link>
          </div>

          {/* ══ BENTO GRID ══ */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(12, 1fr)',
              gridTemplateRows: 'auto',
            }}
          >
            {/* ─── CELL 1: Main Title Card ─── (col 1-8, row 1) */}
            <div
              className="rounded-2xl p-6 lg:p-8 flex flex-col justify-between"
              style={{
                gridColumn: '1 / 9',
                gridRow: '1 / 2',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                minHeight: '200px',
              }}
            >
              {/* Top: category + mode badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ background: '#1d4ed8', color: '#fff' }}>
                  {course.category.name}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{ background: lvl.bg, color: lvl.text }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: lvl.dot }} />
                  {course.level}
                </span>
                {course.mode && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {course.mode}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3"
                style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: '#64748b', maxWidth: '520px' }}>
                {course.shortDescription}
              </p>

              {/* Instructor strip */}
              {instructors.length > 0 && (
                <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex -space-x-2">
                    {instructors.slice(0, 2).map(ins => (
                      <div key={ins.id} className="w-8 h-8 rounded-full overflow-hidden relative shrink-0"
                        style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                        <Image src={ins.profileImageUrl} alt={ins.name} fill className="object-cover" sizes="32px" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#cbd5e1' }}>
                      {instructors.map(i => i.name).join(' & ')}
                    </p>
                    {instructors[0]?.title && (
                      <p className="text-xs" style={{ color: '#475569' }}>{instructors[0].title}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ─── CELL 2: Thumbnail Card ─── (col 9-12, row 1-3) */}
            <div
              className="rounded-2xl overflow-hidden relative hidden lg:block"
              style={{
                gridColumn: '9 / 13',
                gridRow: '1 / 4',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}
            >
              <div className="relative w-full h-full" style={{ minHeight: '260px' }}>
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAACAAH/8QAIBAAAgIBBAMAAAAAAAAAAAAAAQIDBAUREiFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAQIAAxESIf/aAAwDAQACEQMRAD8Am5MraSmknpJNxljTijaXAJIJ8cHjXlSTqUpMJDTFLSBsEbAb9wv/2Q=="
                />
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4"
                  style={{ background: 'linear-gradient(180deg,rgba(8,15,30,0.3) 0%,rgba(8,15,30,0.7) 100%)' }}>
                  {/* Play button */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                      <svg width="22" height="22" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Price chip at bottom */}
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(8,15,30,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p className="text-white font-extrabold text-lg leading-none">
                        ₹{course.price.amount.toLocaleString('en-IN')}
                      </p>
                      {course.price.originalPrice && (
                        <p className="text-slate-400 text-xs line-through">
                          ₹{course.price.originalPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setOpen(true)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── CELL 3: Rating Bento Cell ─── */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-between"
              style={{
                gridColumn: '1 / 4',
                gridRow: '2 / 3',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.15)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400e' }}>Rating</p>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#fbbf24' }}>
                  {course.rating.average > 0 ? course.rating.average.toFixed(1) : '—'}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {ratingStars.map((filled, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 20 20" fill={filled ? '#f59e0b' : '#334155'}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-[10px] mt-1" style={{ color: '#78350f' }}>
                  {course.rating.count} reviews
                </p>
              </div>
            </div>

            {/* ─── CELL 4: Duration Bento Cell ─── */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-between"
              style={{
                gridColumn: '4 / 6',
                gridRow: '2 / 3',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.15)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0369a1' }}>Duration</p>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#38bdf8' }}>{course.duration.hours}h</p>
                <p className="text-[10px] mt-1" style={{ color: '#0c4a6e' }}>{course.duration.weeks} weeks</p>
              </div>
            </div>

            {/* ─── CELL 5: Students Bento Cell ─── */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-between"
              style={{
                gridColumn: '6 / 8',
                gridRow: '2 / 3',
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.15)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5b21b6' }}>Students</p>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: '#a78bfa' }}>
                  {course.enrollmentCount > 999
                    ? `${(course.enrollmentCount / 1000).toFixed(1)}k`
                    : course.enrollmentCount || '—'}
                </p>
                <p className="text-[10px] mt-1" style={{ color: '#4c1d95' }}>enrolled</p>
              </div>
            </div>

            {/* ─── CELL 6: Certificate Bento Cell ─── */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-between"
              style={{
                gridColumn: '7 / 9',
                gridRow: '2 / 3',
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.15)',
                gridColumnStart: '7',
                gridColumnEnd: '9',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#065f46' }}>Cert</p>
              <div>
                <svg width="28" height="28" fill="none" stroke="#34d399" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <p className="text-[10px] mt-1" style={{ color: '#064e3b' }}>included</p>
              </div>
            </div>

            {/* ─── CELL 7: What You'll Learn Card ─── (full left span) */}
            {outcomes.length > 0 && (
              <div
                className="rounded-2xl p-5 lg:p-6"
                style={{
                  gridColumn: '1 / 9',
                  gridRow: '3 / 4',
                  background: 'rgba(29,78,216,0.08)',
                  border: '1px solid rgba(29,78,216,0.15)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#3730a3' }}>
                  What you&apos;ll learn
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {outcomes.slice(0, 6).map((o: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: 'rgba(29,78,216,0.2)' }}>
                        <svg width="9" height="9" fill="none" stroke="#818cf8" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* end bento grid */}

          {/* Mobile: quick enroll bar */}
          <div className="lg:hidden mt-4 flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-white font-extrabold text-xl leading-none">
                ₹{course.price.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{course.duration.hours}h · {course.level}</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      {/* White spacer to offset the thumbnail card visually */}
      <div className="hidden lg:block" style={{ height: '32px', background: '#f1f5f9' }} />

      <EnrollmentModal course={course} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
