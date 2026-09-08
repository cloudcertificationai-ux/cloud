'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from './SearchBar';
import MegaMenu from './MegaMenu';
import { mainNavigation, isActiveNavItem } from '@/lib/navigation';
import { categories, sampleCourses } from '@/data/sample-data';
import { useMobileNavigation } from '@/hooks/useMobileOptimization';
import { touchUtils } from '@/lib/responsive-utils';
import { ariaUtils, focusUtils } from '@/lib/accessibility-utils';
import SkipLink from './SkipLink';
import UserProfileDropdown from './UserProfileDropdown';

const navLinkBase = 'nav-link-item';

export default function Header() {
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileNavigation();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const coursesLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const megaMenuSections = [
    {
      title: 'Technology & Development',
      categories: categories.filter((cat) =>
        ['web-development', 'cloud-computing'].includes(cat.slug)
      ),
      featuredCourses: sampleCourses.filter((course) =>
        ['web-development', 'cloud-computing'].includes(course.category.slug)
      ),
      ctaLink: '/courses?category=technology',
    },
    {
      title: 'Data & AI',
      categories: categories.filter((cat) => cat.slug === 'data-science'),
      featuredCourses: sampleCourses.filter(
        (course) => course.category.slug === 'data-science'
      ),
      ctaLink: '/courses?category=data-science',
    },
    {
      title: 'Security & Infrastructure',
      categories: categories.filter((cat) => cat.slug === 'cybersecurity'),
      featuredCourses: sampleCourses.filter(
        (course) => course.category.slug === 'cybersecurity'
      ),
      ctaLink: '/courses?category=cybersecurity',
    },
  ];

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      <header
        className={`site-header sticky top-0 z-50 ${isScrolled ? 'is-scrolled' : ''}`}
        role="banner"
      >
        <div className="site-header-inner mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="site-header-row flex items-center gap-4 lg:gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="site-header-logo shrink-0"
              aria-label="Cloud Certification - Professional Learning Platform"
            >
              <img
                src="/cloud-certification-logo.png"
                alt="Cloud Certification"
                width={168}
                height={44}
              />
            </Link>

            {/* Search — Google-style pill, positioned like LinkedIn's search box */}
            <div className="site-header-search hidden shrink-0 lg:block">
              <SearchBar
                placeholder="Search courses, skills, topics..."
                className="site-header-search-inner"
              />
            </div>

            {/* Desktop Navigation */}
            <nav
              id="navigation"
              className="site-header-nav hidden min-w-0 flex-1 lg:flex"
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
                      onMouseEnter={() => setIsMegaMenuOpen(true)}
                      onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                      <Link
                        ref={coursesLinkRef}
                        href={item.href}
                        className={`${focusUtils.classes.focusVisible} ${navLinkBase} ${
                          isActive ? 'is-active' : ''
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        {...ariaUtils.attributes.button.expanded(isMegaMenuOpen)}
                        {...ariaUtils.attributes.navigation.hasPopup('menu')}
                        {...ariaUtils.attributes.navigation.controls('mega-menu')}
                      >
                        {item.label}
                        <svg
                          className={`nav-chevron ${isMegaMenuOpen ? 'is-open' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${focusUtils.classes.focusVisible} ${navLinkBase} ${
                      isActive ? 'is-active' : ''
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="site-header-actions hidden shrink-0 items-center lg:flex">
              <a
                href="tel:+919548657094"
                className="site-header-phone"
                aria-label="Call us at +91 95486 57094"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+91 95486 57094</span>
              </a>

              <div className="site-header-divider" aria-hidden="true" />

              <a
                href="https://lms.cloudcertification.io/"
                className={`${focusUtils.classes.focusVisible} btn-free-lms`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="btn-free-lms__icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="btn-free-lms__label">Free LMS</span>
              </a>

              <UserProfileDropdown />
            </div>

            {/* Mobile menu button */}
            <div className="ml-auto lg:hidden">
              <button
                onClick={toggleMenu}
                className={`${touchUtils.getTapTargetClasses('md')} site-header-menu-btn ${focusUtils.classes.focusVisible}`}
                {...ariaUtils.attributes.button.expanded(isMenuOpen)}
                {...ariaUtils.attributes.navigation.controls('mobile-menu')}
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <svg
                  className={isMenuOpen ? 'hidden' : 'block'}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={isMenuOpen ? 'block' : 'hidden'}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`site-header-mobile ${isMenuOpen ? 'is-open' : ''} lg:hidden`}
            id="mobile-menu"
          >
            <div className="site-header-mobile-inner">
              <div className="site-header-mobile-ctas">
                <UserProfileDropdown />
                <a
                  href="https://lms.cloudcertification.io/"
                  onClick={closeMenu}
                  className="btn-free-lms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="btn-free-lms__icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="btn-free-lms__label">Free LMS</span>
                </a>
              </div>

              <SearchBar placeholder="Search courses..." className="w-full" />

              <nav role="navigation" aria-label="Mobile navigation" className="site-header-mobile-nav">
                {mainNavigation.map((item) => {
                  const isActive = isActiveNavItem(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`site-header-mobile-link ${isActive ? 'is-active' : ''}`}
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

      <MegaMenu
        sections={megaMenuSections}
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        triggerRef={coursesLinkRef}
        onMouseEnter={() => setIsMegaMenuOpen(true)}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      />
    </>
  );
}
