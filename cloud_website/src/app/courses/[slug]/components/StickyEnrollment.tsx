'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import EnrollmentModal from './EnrollmentModal';

interface StickyEnrollmentProps {
  course: Course;
}

export default function StickyEnrollment({ course }: StickyEnrollmentProps) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {/* Mobile-only sticky bottom bar */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          background: '#0f172a',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-white font-bold text-base leading-none">
              ₹{course.price.amount.toLocaleString('en-IN')}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {course.duration.hours}h · {course.level}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
          >
            Enroll Now
          </button>
        </div>
      </div>

      <EnrollmentModal course={course} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
