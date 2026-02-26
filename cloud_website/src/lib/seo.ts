// SEO utilities and structured data helpers for Cloud Certification platform

import type { Course, Instructor, SEOMetadata } from '@/types';

/**
 * Generate structured data (JSON-LD) for courses
 */
export function generateCourseStructuredData(course: Course, instructors: Instructor[], currentTime?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  const now = currentTime || '2024-01-01T00:00:00.000Z'; // Use a static fallback for SSG
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription,
    provider: {
      '@type': 'Organization',
      name: 'Cloud Certification',
      url: baseUrl,
    },
    instructor: instructors.map(instructor => ({
      '@type': 'Person',
      name: instructor.name,
      jobTitle: instructor.title,
      description: instructor.bio,
      image: instructor.profileImageUrl,
      worksFor: {
        '@type': 'Organization',
        name: 'Anywheredoor',
      },
    })),
    courseCode: course.id,
    educationalLevel: course.level,
    timeRequired: `PT${course.duration.hours}H`,
    numberOfCredits: course.duration.weeks,
    coursePrerequisites: course.level === 'Beginner' ? 'None' : 'Basic programming knowledge',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating.average,
      reviewCount: course.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: course.price.amount,
      priceCurrency: course.price.currency,
      availability: 'https://schema.org/InStock',
      validFrom: now,
    },
    image: course.thumbnailUrl,
    url: `${baseUrl}/courses/${course.slug}`,
    dateCreated: course.createdAt instanceof Date && !isNaN(course.createdAt.getTime()) 
      ? course.createdAt.toISOString() 
      : now,
    dateModified: course.updatedAt instanceof Date && !isNaN(course.updatedAt.getTime()) 
      ? course.updatedAt.toISOString() 
      : now,
    keywords: course.tags.join(', '),
    about: course.category.name,
    teaches: course.tags,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.mode.toLowerCase(),
      instructor: instructors.map(instructor => ({
        '@type': 'Person',
        name: instructor.name,
      })),
    },
  };
}

/**
 * Generate structured data (JSON-LD) for instructors
 */
export function generateInstructorStructuredData(instructor: Instructor) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: instructor.name,
    jobTitle: instructor.title,
    description: instructor.bio,
    image: instructor.profileImageUrl,
    url: `${baseUrl}/instructors/${instructor.id}`,
    worksFor: {
      '@type': 'Organization',
      name: 'Cloud Certification',
      url: baseUrl,
    },
    knowsAbout: instructor.expertise,
    hasOccupation: {
      '@type': 'Occupation',
      name: instructor.title,
      skills: instructor.expertise,
      experienceRequirements: `${instructor.experience.years} years of experience`,
    },
    alumniOf: instructor.experience.companies.map(company => ({
      '@type': 'Organization',
      name: company,
    })),
    sameAs: [
      instructor.socialLinks.linkedin,
      instructor.socialLinks.twitter,
      instructor.socialLinks.github,
    ].filter(Boolean),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: instructor.rating.average,
      reviewCount: instructor.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/**
 * Generate structured data for the organization
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Cloud Certification',
    alternateName: 'Cloud Certification Learning Platform',
    description: 'Transform your career with expert-led online courses in programming, data science, and cybersecurity. Get certified and land your dream tech job.',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    sameAs: [
      'https://twitter.com/cloudcertification',
      'https://linkedin.com/company/cloudcertification',
      'https://github.com/cloudcertification',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
    foundingDate: '2020',
    numberOfEmployees: '50-100',
    knowsAbout: [
      'Programming',
      'Data Science',
      'Cybersecurity',
      'Cloud Computing',
      'Web Development',
      'Machine Learning',
    ],
    offers: {
      '@type': 'EducationalOccupationalProgram',
      name: 'Tech Career Advancement Programs',
      description: 'Comprehensive online courses for career advancement in technology',
      provider: {
        '@type': 'Organization',
        name: 'Cloud Certification',
      },
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Optimize meta description length
 */
export function optimizeMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  // Find the last complete sentence within the limit
  const truncated = description.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return description.substring(0, lastSentence + 1);
  }
  
  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return description.substring(0, lastSpace) + '...';
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  return `${baseUrl}${path}`;
}

/**
 * Generate Open Graph image URL with dynamic text
 */
export function generateOGImageUrl(title: string, type: 'course' | 'instructor' | 'page' = 'page', subtitle?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  const encodedTitle = encodeURIComponent(title);
  const encodedSubtitle = subtitle ? encodeURIComponent(subtitle) : '';
  
  let url = `${baseUrl}/api/og?title=${encodedTitle}&type=${type}`;
  if (encodedSubtitle) {
    url += `&subtitle=${encodedSubtitle}`;
  }
  
  return url;
}

/**
 * Extract keywords from course content
 */
export function extractKeywords(course: Course): string[] {
  const keywords = new Set<string>();
  
  // Add explicit tags
  course.tags.forEach(tag => keywords.add(tag.toLowerCase()));
  
  // Add category
  keywords.add(course.category.name.toLowerCase());
  
  // Add level
  keywords.add(course.level.toLowerCase());
  
  // Add mode
  keywords.add(course.mode.toLowerCase());
  
  // Add common course-related keywords
  keywords.add('online course');
  keywords.add('certification');
  keywords.add('training');
  keywords.add('bootcamp');
  
  // Add skill-specific keywords based on title and description
  const text = `${course.title} ${course.shortDescription}`.toLowerCase();
  const skillKeywords = [
    'programming', 'coding', 'development', 'software', 'web', 'mobile',
    'data science', 'machine learning', 'ai', 'artificial intelligence',
    'cybersecurity', 'security', 'cloud', 'aws', 'azure', 'devops',
    'javascript', 'python', 'java', 'react', 'node', 'sql'
  ];
  
  skillKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.add(keyword);
    }
  });
  
  return Array.from(keywords);
}

/**
 * Generate complete SEO metadata for a course
 */
export function generateCourseSEOMetadata(course: Course, instructors: Instructor[], currentTime?: string): SEOMetadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  const canonicalUrl = `${baseUrl}/courses/${course.slug}`;
  const keywords = extractKeywords(course);
  
  const title = `${course.title} - Online Course | Cloud Certification`;
  const description = optimizeMetaDescription(
    `Master ${course.category.name} with ${course.title}. ${course.shortDescription} Get certified in ${course.duration.weeks} weeks with expert instruction.`
  );
  
  // Generate dynamic OG image
  const ogImageUrl = generateOGImageUrl(
    course.title,
    'course',
    `${course.category.name} • ${course.duration.weeks} weeks • ${instructors[0]?.name || 'Expert Instructor'}`
  );
  
  return {
    title,
    description,
    keywords,
    canonicalUrl,
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      image: ogImageUrl,
      type: 'course',
    },
    twitterCard: {
      card: 'summary_large_image',
      title: course.title,
      description: course.shortDescription,
      image: ogImageUrl,
    },
    structuredData: generateCourseStructuredData(course, instructors, currentTime),
  };
}

/**
 * Generate complete SEO metadata for an instructor
 */
export function generateInstructorSEOMetadata(instructor: Instructor): SEOMetadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudcertification.com';
  const canonicalUrl = `${baseUrl}/instructors/${instructor.id}`;
  
  const title = `${instructor.name} - ${instructor.title} | Cloud Certification`;
  const description = optimizeMetaDescription(
    `Learn from ${instructor.name}, ${instructor.title} with ${instructor.experience.years} years of experience. Expert instructor at ${instructor.experience.companies[0] || 'top tech companies'}.`
  );
  
  const keywords = [
    instructor.name.toLowerCase(),
    instructor.title.toLowerCase(),
    ...instructor.expertise.map(skill => skill.toLowerCase()),
    'instructor',
    'teacher',
    'expert',
    'mentor',
  ];
  
  // Generate dynamic OG image
  const ogImageUrl = generateOGImageUrl(
    instructor.name,
    'instructor',
    `${instructor.title} • ${instructor.experience.years} years experience • ${instructor.expertise.slice(0, 2).join(', ')}`
  );
  
  return {
    title,
    description,
    keywords,
    canonicalUrl,
    openGraph: {
      title: `${instructor.name} - Expert Instructor`,
      description: `${instructor.title} with ${instructor.experience.years} years of experience`,
      image: ogImageUrl,
      type: 'website',
    },
    twitterCard: {
      card: 'summary_large_image',
      title: `${instructor.name} - Expert Instructor`,
      description: `${instructor.title} with ${instructor.experience.years} years of experience`,
      image: ogImageUrl,
    },
    structuredData: generateInstructorStructuredData(instructor),
  };
}