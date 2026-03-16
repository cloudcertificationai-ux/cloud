'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './SearchBar';
import MegaMenu from './MegaMenu';
import { mainNavigation, isActiveNavItem } from '@/lib/navigation';
import { categories, sampleCourses } from '@/data/sample-data';
import { useMobileNavigation } from '@/hooks/useMobileOptimization';
import { responsiveSpacing, touchUtils, mobileNavigation } from '@/lib/responsive-utils';
import { ariaUtils, focusUtils, keyboardUtils } from '@/lib/accessibility-utils';
import SkipLink from './SkipLink';
import UserProfileDropdown from './UserProfileDropdown';

export default function Header() {
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileNavigation();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const coursesLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle scroll effect for enhanced sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCoursesHover = () => {
    setIsMegaMenuOpen(true);
  };

  const handleCoursesLeave = () => {
    setIsMegaMenuOpen(false);
  };

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  const handleMegaMenuMouseEnter = () => {
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuMouseLeave = () => {
    setIsMegaMenuOpen(false);
  };

  // Prepare mega menu data
  const megaMenuSections = [
    {
      title: 'Technology & Development',
      categories: categories.filter(cat => 
        ['web-development', 'cloud-computing'].includes(cat.slug)
      ),
      featuredCourses: sampleCourses.filter(course => 
        ['web-development', 'cloud-computing'].includes(course.category.slug)
      ),
      ctaLink: '/courses?category=technology'
    },
    {
      title: 'Data & AI',
      categories: categories.filter(cat => 
        cat.slug === 'data-science'
      ),
      featuredCourses: sampleCourses.filter(course => 
        course.category.slug === 'data-science'
      ),
      ctaLink: '/courses?category=data-science'
    },
    {
      title: 'Security & Infrastructure',
      categories: categories.filter(cat => 
        cat.slug === 'cybersecurity'
      ),
      featuredCourses: sampleCourses.filter(course => 
        course.category.slug === 'cybersecurity'
      ),
      ctaLink: '/courses?category=cybersecurity'
    }
  ];

  return (
    <>
      {/* Skip Links for Keyboard Navigation */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
      
      <header 
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'shadow-lg border-b border-gray-100' 
            : 'shadow-sm border-b border-gray-200'
        }`}
        role="banner"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 lg:h-18 gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center text-xl font-bold text-navy-800 hover:text-primary-600 transition-colors duration-200"
              aria-label="Cloud Certification - Professional Learning Platform"
            >
              <img 
                src="/cloud-certification-logo.png" 
                alt="Cloud Certification Logo" 
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav 
            id="navigation" 
            className="hidden lg:flex items-center space-x-1 flex-1" 
            role="navigation" 
            aria-label="Main navigation"
          >
            {mainNavigation.map((item) => {
              const isActive = isActiveNavItem(item.href, pathname);
              const isCourses = item.href === '/courses';
              
              if (isCourses) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={handleCoursesHover}
                    onMouseLeave={handleCoursesLeave}
                  >
                    <Link
                      ref={coursesLinkRef}
                      href={item.href}
                      className={`${focusUtils.classes.focusVisible} flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link ${
                        isActive
                          ? 'text-primary-600 bg-primary-50 border border-primary-100'
                          : 'text-navy-800 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      {...ariaUtils.attributes.button.expanded(isMegaMenuOpen)}
                      {...ariaUtils.attributes.navigation.hasPopup('menu')}
                      {...ariaUtils.attributes.navigation.controls('mega-menu')}
                    >
                      {item.label}
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          isMegaMenuOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${focusUtils.classes.focusVisible} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 nav-link ${
                    isActive
                      ? 'text-primary-600 bg-primary-50 border border-primary-100'
                      : 'text-navy-800 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Enhanced positioning */}
          <div className="hidden lg:block flex-shrink-0 w-80">
            <SearchBar 
              placeholder="Search courses, skills, or topics..." 
              className="w-full"
            />
          </div>

          {/* Phone Number - Desktop */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <a
              href="tel:+18005551234"
              className="flex items-center gap-1.5 text-sm font-medium text-navy-800 hover:text-primary-600 transition-colors duration-200 mr-4"
              aria-label="Call us at 1-800-555-1234"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1-800-555-1234
            </a>
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <UserProfileDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={toggleMenu}
              className={`${touchUtils.getTapTargetClasses('md')} ${touchUtils.getTouchClasses('inline-flex items-center justify-center p-3 rounded-lg text-navy-800 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200 touch-feedback')} ${focusUtils.classes.focusVisible}`}
              {...ariaUtils.attributes.button.expanded(isMenuOpen)}
              {...ariaUtils.attributes.navigation.controls('mobile-menu')}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? 'block animate-fade-in-down' : 'hidden'
          } lg:hidden transition-all duration-300 ease-in-out`}
          id="mobile-menu"
        >
          <div className="px-4 pt-4 pb-6 space-y-3 border-t border-gray-100 bg-white">
            {/* Mobile User Profile */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <UserProfileDropdown />
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <SearchBar 
                placeholder="Search courses..." 
                className="w-full"
              />
            </div>

            {/* Mobile Navigation Links */}
            <nav role="navigation" aria-label="Mobile navigation">
              {mainNavigation.map((item) => {
                const isActive = isActiveNavItem(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`${touchUtils.getTapTargetClasses('md')} ${touchUtils.getTouchClasses('block px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 touch-feedback nav-link')} ${focusUtils.classes.focusVisible} ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 border border-primary-100'
                        : 'text-navy-800 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      </header>

      {/* Mega Menu */}
      <MegaMenu
        sections={megaMenuSections}
        isOpen={isMegaMenuOpen}
        onClose={closeMegaMenu}
        triggerRef={coursesLinkRef}
        onMouseEnter={handleMegaMenuMouseEnter}
        onMouseLeave={handleMegaMenuMouseLeave}
      />
    </>
  );
}