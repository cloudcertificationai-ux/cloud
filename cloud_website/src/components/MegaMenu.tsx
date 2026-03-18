'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { focusUtils, keyboardUtils } from '@/lib/accessibility-utils';
import { CategoryWithCourses, DbCoursePreview } from '@/types/categories';

interface MegaMenuSection {
  title: string;
  categories: { id: string; name: string; slug: string }[];
  featuredCourses: { id: string; title: string; slug: string }[];
  ctaLink?: string;
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  initialCategories?: CategoryWithCourses[];
}

function CourseCard({ course }: { course: DbCoursePreview }) {
  const [imgError, setImgError] = useState(false);
  const durationLabel = course.durationMin != null ? `${course.durationMin} min` : null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {course.thumbnailUrl && !imgError ? (
          <div style={{ position: 'relative', width: '100%', height: '90px', overflow: 'hidden' }}>
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              style={{ objectFit: 'cover' }}
              onError={() => setImgError(true)}
              sizes="160px"
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '90px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>{course.title}</span>
          </div>
        )}
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>{course.title}</p>
          {durationLabel && (
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Duration: {durationLabel}</p>
          )}
          <div style={{ marginTop: '8px' }}>
            <span style={{ display: 'block', width: '100%', background: '#dbeafe', color: '#1d4ed8', borderRadius: '6px', padding: '6px 0', fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>
              Read More
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MegaMenu({ sections, isOpen, onClose, triggerRef, onMouseEnter, onMouseLeave, initialCategories }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryWithCourses[]>(initialCategories ?? []);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategories && initialCategories.length > 0 ? initialCategories[0].id : null
  );

  // Fetch categories with courses on mount
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;
    fetch('/api/website/categories-with-courses')
      .then((res) => res.json())
      .then((data: CategoryWithCourses[]) => {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      })
      .catch(() => {
        // On failure, leave categories as empty — renders gracefully
      });
  }, [initialCategories]);

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

  const activeCategoryData = categories.find((c) => c.id === activeCategory) ?? null;
  const courses: DbCoursePreview[] = activeCategoryData?.courses ?? [];

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
            {categories.map((cat, i) => (
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
                  borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: activeCategory === cat.id ? '#1d4ed8' : '#ffffff',
                  color: activeCategory === cat.id ? '#ffffff' : '#374151',
                  transition: 'background 0.15s',
                }}
                role="menuitem"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {courses.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px 0' }}>No courses available</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
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
