'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Course } from '@/types';
import EnrollmentModal from './EnrollmentModal';

interface EnrollmentSidebarProps {
  course: Course;
}

export default function EnrollmentSidebar({ course }: EnrollmentSidebarProps) {
  const [open, setOpen] = useState(false);

  const metaCells = [
    { icon: '⏱', label: 'Duration', value: `${course.duration.hours}h`, sub: `${course.duration.weeks} weeks` },
    { icon: '📶', label: 'Level',    value: course.level ?? '—', sub: null },
    { icon: '🖥',  label: 'Mode',    value: course.mode ?? '—', sub: null },
    { icon: '🌐', label: 'Language', value: (course as any).language ?? 'English', sub: null },
    { icon: '📜', label: 'Cert',     value: 'Included', sub: 'on completion', green: true },
    { icon: '♾️', label: 'Access',   value: 'Lifetime', sub: null },
  ];

  const includes = [
    { icon: '🎬', text: 'HD video lectures' },
    { icon: '📁', text: 'Downloadable resources' },
    { icon: '💬', text: 'Live Q&A sessions' },
    { icon: '👥', text: 'Community access' },
    { icon: '🛠', text: 'Project assignments' },
    { icon: '🏆', text: 'Certification prep' },
  ];

  const discount = course.price.originalPrice
    ? Math.round(((course.price.originalPrice - course.price.amount) / course.price.originalPrice) * 100)
    : null;

  return (
    <>
      <div className="w-full rounded-2xl overflow-hidden"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 8px 40px rgba(15,23,42,0.08)', background: '#f8fafc' }}>

        {/* ── BENTO GRID LAYOUT ── */}
        <div className="grid gap-2 p-2" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* [CELL 1] Thumbnail – full width */}
          <div className="rounded-xl overflow-hidden relative col-span-2" style={{ aspectRatio: '16/9' }}>
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="340px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAACAAH/8QAIBAAAgIBBAMAAAAAAAAAAAAAAQIDBAUREiFBUf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAQIAAxESIf/aAAwDAQACEQMRAD8Am5MraSmknpJNxljTijaXAJIJ8cHjXlSTqUpMJDTFLSBsEbAb9wv/2Q=="
            />
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(8,15,30,0.45)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                <svg width="18" height="18" fill="#1d4ed8" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {discount && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold"
                style={{ background: '#ef4444', color: '#fff' }}>
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* [CELL 2] Price – left col */}
          <div className="rounded-xl p-4 flex flex-col justify-between"
            style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Price</p>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">
                ₹{course.price.amount.toLocaleString('en-IN')}
              </p>
              {course.price.originalPrice && (
                <p className="text-xs text-gray-400 line-through mt-1">
                  ₹{course.price.originalPrice.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>

          {/* [CELL 3] Rating – right col */}
          <div className="rounded-xl p-4 flex flex-col justify-between"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Rating</p>
            <div>
              <p className="text-2xl font-extrabold leading-none" style={{ color: '#f59e0b' }}>
                {course.rating.average > 0 ? course.rating.average.toFixed(1) : '—'}
              </p>
              <div className="flex gap-0.5 mt-1.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="10" height="10" viewBox="0 0 20 20"
                    fill={s <= Math.round(course.rating.average) ? '#f59e0b' : '#e2e8f0'}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* [CELL 4] CTA Button – full width */}
          <div className="col-span-2 rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setOpen(true)}
              className="w-full py-3.5 font-bold text-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
              style={{ background: '#ffffff', color: '#1d4ed8', letterSpacing: '0.01em' }}
            >
              Enroll Now — Start Learning Today
            </button>
          </div>

          {/* [CELL 5] Guarantee – full width */}
          <div className="col-span-2 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <svg width="13" height="13" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#166534' }}>30-day money-back guarantee</span>
          </div>

          {/* [CELL 6] Meta grid – 3x2 bento cells */}
          {metaCells.map((cell, i) => (
            <div key={i} className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{cell.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{cell.label}</span>
              </div>
              <p className={`text-sm font-bold leading-none mt-1 ${(cell as any).green ? 'text-emerald-600' : 'text-gray-800'}`}>
                {cell.value}
              </p>
              {cell.sub && <p className="text-[9px]" style={{ color: '#94a3b8' }}>{cell.sub}</p>}
            </div>
          ))}

          {/* [CELL 7] This course includes – full width */}
          <div className="col-span-2 rounded-xl p-4"
            style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
              This course includes
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {includes.map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        {/* end bento grid */}
      </div>

      <EnrollmentModal course={course} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
