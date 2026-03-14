'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course, CourseCategory } from '@/types';
import { ariaUtils, focusUtils, keyboardUtils } from '@/lib/accessibility-utils';

interface MegaMenuSection {
  title: string;
  categories: CourseCategory[];
  featuredCourses: Course[];
  ctaLink?: string;
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Inline course data (mirrors ExploreCoursesSection)
const menuCategories = [
  { id: 'pg', label: 'Online PG Programmes' },
  { id: 'ug', label: 'Online UG Programmes' },
  { id: 'diploma', label: 'Diploma Courses' },
  { id: 'executive', label: 'Executive Programmes' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'international', label: 'International Programmes' },
  { id: 'free', label: 'Free Courses' },
];

type MenuCourse = { id: string; name: string; duration: string; image: string };

const coursesByCategory: Record<string, MenuCourse[]> = {
  pg: [
    { id: 'mba', name: 'Online MBA', duration: '2 Years', image: '/courses/mba.jpg' },
    { id: 'mca', name: 'Online MCA', duration: '2 Years', image: '/courses/mca.jpg' },
    { id: 'mcom', name: 'Online MCom', duration: '2 Years', image: '/courses/mcom.jpg' },
    { id: 'msc', name: 'Online MSc', duration: '2 Years', image: '/courses/msc.jpg' },
    { id: 'ma', name: 'Online MA', duration: '2 Years', image: '/courses/ma.jpg' },
    { id: 'mcom-acca', name: 'M.Com with ACCA', duration: '2 Years', image: '/courses/mcom-acca.jpg' },
    { id: 'dist-mba', name: 'Distance MBA', duration: '2 Years', image: '/courses/dist-mba.jpg' },
    { id: 'dist-mca', name: 'Distance MCA', duration: '2 Years', image: '/courses/dist-mca.jpg' },
    { id: 'dist-mcom', name: 'Distance MCom', duration: '2 Years', image: '/courses/dist-mcom.jpg' },
    { id: 'dist-mlis', name: 'Distance MLIS', duration: '1 Year', image: '/courses/dist-mlis.jpg' },
  ],
  ug: [
    { id: 'bba', name: 'Online BBA', duration: '3 Years', image: '/courses/bba.jpg' },
    { id: 'bca', name: 'Online BCA', duration: '3 Years', image: '/courses/bca.jpg' },
    { id: 'bcom', name: 'Online BCom', duration: '3 Years', image: '/courses/bcom.jpg' },
    { id: 'ba', name: 'Online BA', duration: '3 Years', image: '/courses/ba.jpg' },
    { id: 'bsc', name: 'Online BSc', duration: '3 Years', image: '/courses/bsc.jpg' },
  ],
  diploma: [
    { id: 'dba', name: 'Diploma in Business', duration: '1 Year', image: '/courses/dba.jpg' },
    { id: 'dit', name: 'Diploma in IT', duration: '1 Year', image: '/courses/dit.jpg' },
    { id: 'dhr', name: 'Diploma in HR', duration: '6 Months', image: '/courses/dhr.jpg' },
  ],
  executive: [
    { id: 'emba', name: 'Executive MBA', duration: '1 Year', image: '/courses/emba.jpg' },
    { id: 'epgm', name: 'Executive PGM', duration: '1 Year', image: '/courses/epgm.jpg' },
  ],
  certifications: [
    { id: 'cert-pm', name: 'Project Management', duration: '3 Months', image: '/courses/cert-pm.jpg' },
    { id: 'cert-ds', name: 'Data Science', duration: '6 Months', image: '/courses/cert-ds.jpg' },
    { id: 'cert-ml', name: 'Machine Learning', duration: '6 Months', image: '/courses/cert-ml.jpg' },
  ],
  international: [
    { id: 'int-mba', name: 'International MBA', duration: '2 Years', image: '/courses/int-mba.jpg' },
    { id: 'int-ms', name: 'International MS', duration: '2 Years', image: '/courses/int-ms.jpg' },
  ],
  free: [
    { id: 'free-py', name: 'Python Basics', duration: 'Self-paced', image: '/courses/free-py.jpg' },
    { id: 'free-web', name: 'Web Development', duration: 'Self-paced', image: '/courses/free-web.jpg' },
    { id: 'free-ai', name: 'AI Fundamentals', duration: 'Self-paced', image: '/courses/free-ai.jpg' },
  ],
};

function CourseCard({ course }: { course: MenuCourse }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {imgError ? (
        <div style={{ width: '100%', height: '90px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>{course.name}</span>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '90px', overflow: 'hidden' }}>
          <Image src={course.image} alt={course.name} fill style={{ objectFit: 'cover' }} onError={() => setImgError(true)} sizes="160px" />
        </div>
      )}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>{course.name}</p>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Duration: {course.duration}</p>
        <div style={{ marginTop: '8px' }}>
          <button style={{ width: '100%', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
            Read More
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MegaMenu({ sections, isOpen, onClose, triggerRef, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('pg');

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      onClose();
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === keyboardUtils.keys.ESCAPE) {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const courses = coursesByCategory[activeCategory] ?? [];

  return (
    <div
      ref={menuRef}
      className="fixed top-16 left-0 w-full bg-white shadow-2xl border-t-2 border-primary-200 z-100"
      role="menu"
      aria-label="Course categories menu"
      id="mega-menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ animation: 'fade-in-down 0.2s ease-out', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">
            Explore Our Courses &amp; Be Awesome
          </h2>
          <p className="text-gray-500 text-sm mt-1">Select the category and compare the university</p>
        </div>

        {/* Body: Sidebar + Course Grid */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: '190px', flexShrink: 0, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {menuCategories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.id); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: i < menuCategories.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: activeCategory === cat.id ? '#1d4ed8' : '#ffffff',
                  color: activeCategory === cat.id ? '#ffffff' : '#374151',
                  transition: 'background 0.15s',
                }}
                role="menuitem"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
          <Link
            href="/courses"
            onClick={onClose}
            className={`${focusUtils.classes.focusVisible} text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200`}
            role="menuitem"
          >
            View All Courses →
          </Link>
        </div>
      </div>
    </div>
  );
}