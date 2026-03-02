/**
 * Navigation utilities for consistent routing and data flow
 */

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  isActive?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Main navigation items used across the application
 */
export const mainNavigation: NavigationItem[] = [
  { 
    href: '/', 
    label: 'Home', 
    description: 'Homepage with featured courses and statistics' 
  },
  { 
    href: '/courses', 
    label: 'Courses', 
    description: 'Browse all available courses',
    children: [
      { href: '/courses?category=web-development', label: 'Web Development' },
      { href: '/courses?category=data-science', label: 'Data Science' },
      { href: '/courses?category=cybersecurity', label: 'Cybersecurity' },
      { href: '/courses?category=cloud-computing', label: 'Cloud Computing' },
    ]
  },
  { 
    href: '/for-business', 
    label: 'For Business', 
    description: 'Enterprise learning solutions and corporate training' 
  },
  { 
    href: '/about', 
    label: 'About', 
    description: 'Learn about our mission and success stories' 
  },
  { 
    href: '/contact', 
    label: 'Contact', 
    description: 'Get in touch with our team' 
  },
  { 
    href: '/blog', 
    label: 'Blog', 
    description: 'Read our latest articles and insights' 
  },
];

/**
 * Course category navigation
 */
export const courseCategories = [
  { href: '/courses?category=web-development', label: 'Web Development' },
  { href: '/courses?category=data-science', label: 'Data Science' },
  { href: '/courses?category=cybersecurity', label: 'Cybersecurity' },
  { href: '/courses?category=cloud-computing', label: 'Cloud Computing' },
];

/**
 * Generate breadcrumbs for a given path
 */
export function generateBreadcrumbs(pathname: string, courseTitle?: string, categoryName?: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  // Handle different page types
  switch (segments[0]) {
    case 'courses':
      breadcrumbs.push({ label: 'Courses', href: '/courses' });
      
      if (segments.length > 1) {
        // Check if it's a category filter
        if (segments[1] === 'category' && segments[2]) {
          breadcrumbs.push({ 
            label: categoryName || segments[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            href: `/courses?category=${segments[2]}`
          });
        } else if (segments[1] !== 'page') {
          // Course detail page
          breadcrumbs.push({ 
            label: courseTitle || 'Course Details'
          });
        }
      }
      break;

    case 'about':
      breadcrumbs.push({ label: 'About Us' });
      break;

    case 'contact':
      breadcrumbs.push({ label: 'Contact Us' });
      break;

    case 'for-business':
      breadcrumbs.push({ label: 'For Business' });
      break;

    case 'resources':
      breadcrumbs.push({ label: 'Resources', href: '/resources' });
      
      if (segments.length > 1 && segments[1] !== 'page') {
        // Resource detail page
        breadcrumbs.push({ 
          label: 'Resource Details'
        });
      }
      break;

    case 'skills':
      breadcrumbs.push({ label: 'Skills', href: '/skills' });
      
      if (segments.length > 1) {
        // Skills category page
        breadcrumbs.push({ 
          label: segments[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
      break;

    default:
      // Capitalize first letter for unknown routes
      breadcrumbs.push({ 
        label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, ' ')
      });
  }

  return breadcrumbs;
}

/**
 * Check if a navigation item is active based on current pathname
 */
export function isActiveNavItem(itemHref: string, currentPathname: string): boolean {
  if (itemHref === '/') {
    return currentPathname === '/';
  }
  return currentPathname.startsWith(itemHref);
}

/**
 * Get related navigation suggestions based on current page
 */
export function getRelatedNavigation(currentPath: string): NavigationItem[] {
  const related: NavigationItem[] = [];

  if (currentPath.startsWith('/courses')) {
    related.push(
      { href: '/about', label: 'About Our Platform', description: 'Our mission and success stories' },
      { href: '/for-business', label: 'Enterprise Solutions', description: 'Corporate training programs' }
    );
  } else if (currentPath === '/about') {
    related.push(
      { href: '/courses', label: 'Explore Courses', description: 'Start your learning journey' },
      { href: '/contact', label: 'Get In Touch', description: 'Have questions? Contact us' }
    );
  } else if (currentPath === '/contact') {
    related.push(
      { href: '/courses', label: 'Browse Courses', description: 'Discover our programs' },
      { href: '/about', label: 'Learn About Us', description: 'Our story and mission' }
    );
  } else if (currentPath === '/for-business') {
    related.push(
      { href: '/courses', label: 'View Course Catalog', description: 'Explore training options' },
      { href: '/contact', label: 'Contact Sales', description: 'Discuss enterprise needs' }
    );
  } else if (currentPath === '/') {
    related.push(
      { href: '/courses', label: 'Start Learning', description: 'Browse our course catalog' },
      { href: '/about', label: 'Why Choose Us', description: 'See our success stories' },
      { href: '/for-business', label: 'Enterprise Training', description: 'Corporate learning solutions' }
    );
  }

  return related;
}

/**
 * Get contextual call-to-action based on current page
 */
export function getContextualCTA(currentPath: string): { primary: NavigationItem; secondary?: NavigationItem } {
  if (currentPath.startsWith('/courses/') && !currentPath.includes('?')) {
    // Course detail page
    return {
      primary: { href: '#enroll', label: 'Enroll Now', description: 'Start your learning journey' },
      secondary: { href: '/courses', label: 'Browse More Courses', description: 'Explore other options' }
    };
  } else if (currentPath === '/courses') {
    return {
      primary: { href: '/contact', label: 'Need Help Choosing?', description: 'Get personalized guidance' },
      secondary: { href: '/about', label: 'Why Choose Us', description: 'See our success stories' }
    };
  } else if (currentPath === '/about') {
    return {
      primary: { href: '/courses', label: 'Start Your Journey', description: 'Browse our courses' },
      secondary: { href: '/contact', label: 'Talk to an Advisor', description: 'Get personalized guidance' }
    };
  } else if (currentPath === '/contact') {
    return {
      primary: { href: '/courses', label: 'Browse Courses', description: 'Explore our programs' },
      secondary: { href: '/about', label: 'Learn More About Us', description: 'Our story and mission' }
    };
  } else if (currentPath === '/for-business') {
    return {
      primary: { href: '/contact', label: 'Contact Sales', description: 'Discuss your training needs' },
      secondary: { href: '/courses', label: 'View Course Catalog', description: 'Explore training options' }
    };
  }
  
  // Default for homepage
  return {
    primary: { href: '/courses', label: 'Browse Courses', description: 'Start learning today' },
    secondary: { href: '/about', label: 'Learn More', description: 'Discover our mission' }
  };
}

/**
 * Generate structured data for navigation
 */
export function generateNavigationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: mainNavigation.map(item => ({
      '@type': 'WebPage',
      name: item.label,
      url: `https://anywheredoor.com${item.href}`,
      description: item.description,
    })),
  };
}