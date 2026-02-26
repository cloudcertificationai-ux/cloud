'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

export default function MegaMenu({ sections, isOpen, onClose, triggerRef, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  // Handle clicks outside the menu - but NOT inside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking the trigger
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      
      // Close if clicking outside both
      onClose();
    };

    if (isOpen) {
      // Use 'click' instead of 'mousedown' to allow proper interaction
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      if (!focusableElements?.length) return;

      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case keyboardUtils.keys.ESCAPE:
          event.preventDefault();
          onClose();
          triggerRef.current?.focus();
          break;
        case keyboardUtils.keys.ARROW_DOWN:
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex]?.focus();
          break;
        case keyboardUtils.keys.ARROW_UP:
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          focusableElements[prevIndex]?.focus();
          break;
        case keyboardUtils.keys.TAB:
          // Allow normal tab behavior but close menu when tabbing out
          if (!menuRef.current?.contains((event.target as HTMLElement))) {
            onClose();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, triggerRef]);

  // Focus management when menu opens - disabled to prevent interference
  // useEffect(() => {
  //   if (isOpen && menuRef.current) {
  //     const firstFocusable = menuRef.current.querySelector(
  //       'button, [href], [tabindex]:not([tabindex="-1"])'
  //     ) as HTMLElement;
  //     firstFocusable?.focus();
  //   }
  // }, [isOpen]);

  if (!isOpen) return null;

  const currentSection = sections[activeSection] || sections[0];

  return (
    <div
      ref={menuRef}
      className="fixed top-16 left-0 w-full bg-white shadow-2xl border-t-2 border-primary-200 z-100"
      role="menu"
      aria-label="Course categories menu"
      id="mega-menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        animation: 'fade-in-down 0.2s ease-out',
        maxHeight: 'calc(100vh - 4rem)',
        overflowY: 'auto'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Navigation */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">
              Course Categories
            </h3>
            <nav className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(index);
                  }}
                  className={`${focusUtils.classes.focusVisible} w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    index === activeSection
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-800'
                  }`}
                  role="menuitem"
                  {...ariaUtils.attributes.button.pressed(index === activeSection)}
                  {...ariaUtils.attributes.navigation.controls(`section-${index}`)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Category Details */}
          <div className="lg:col-span-2" id={`section-${activeSection}`}>
            <h3 className="text-lg font-semibold text-navy-800 mb-4">
              {currentSection.title} Specializations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentSection.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  onClick={onClose}
                  className={`${focusUtils.classes.focusVisible} group p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200`}
                  role="menuitem"
                  aria-describedby={`category-${category.id}-desc`}
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h4 className="font-medium text-navy-800 group-hover:text-primary-700 transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-sm text-navy-600 mt-1 group-hover:text-navy-700" id={`category-${category.id}-desc`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Courses */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-navy-800 mb-4">
              Featured Courses
            </h3>
            <div className="space-y-4">
              {currentSection.featuredCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  onClick={onClose}
                  className={`${focusUtils.classes.focusVisible} group block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200`}
                  role="menuitem"
                  aria-describedby={`course-${course.id}-meta`}
                >
                  <h4 className="font-medium text-navy-800 group-hover:text-primary-700 transition-colors text-sm mb-2">
                    {course.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-navy-600" id={`course-${course.id}-meta`}>
                    <span className="bg-gray-100 px-2 py-1 rounded" aria-label={`Course level: ${course.level}`}>
                      {course.level}
                    </span>
                    <span className="font-medium" aria-label={`Duration: ${course.duration.weeks} weeks`}>
                      {course.duration.weeks} weeks
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center text-warning-500" aria-label={`Rating: ${course.rating.average} out of 5 stars`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{course.rating.average}</span>
                    </div>
                    <span className="ml-2 text-navy-500" aria-label={`${course.rating.count} reviews`}>
                      ({course.rating.count} reviews)
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA */}
            {currentSection.ctaLink && (
              <div className="mt-6">
                <Link
                  href={currentSection.ctaLink}
                  onClick={onClose}
                  className={`${focusUtils.classes.focusVisible} block w-full px-4 py-3 bg-primary-600 text-white text-center font-medium rounded-lg hover:bg-primary-700 transition-all duration-200`}
                  role="menuitem"
                >
                  View All Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Popular Skills */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-navy-800 mb-2">
                Popular Skills:
              </h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'Python', 'AWS', 'Machine Learning', 'Cybersecurity', 'DevOps'].map((skill) => (
                  <Link
                    key={skill}
                    href={`/courses?skill=${skill.toLowerCase()}`}
                    onClick={onClose}
                    className={`${focusUtils.classes.focusVisible} px-3 py-1 text-xs font-medium text-navy-600 bg-gray-100 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200`}
                    role="menuitem"
                  >
                    {skill}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/about"
                onClick={onClose}
                className={`${focusUtils.classes.focusVisible} text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200`}
                role="menuitem"
              >
                Why Choose Anywheredoor? →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}