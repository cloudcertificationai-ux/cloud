/**
 * SEO Validation and Testing Utilities
 * Comprehensive tools for validating SEO implementation and performance
 */

export interface SEOValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface MetaTagValidation {
  title: SEOValidationResult;
  description: SEOValidationResult;
  keywords: SEOValidationResult;
  canonical: SEOValidationResult;
  openGraph: SEOValidationResult;
  twitterCard: SEOValidationResult;
  robots: SEOValidationResult;
}

export interface StructuredDataValidation {
  isPresent: boolean;
  isValid: boolean;
  schemas: string[];
  errors: string[];
  warnings: string[];
}

export interface CoreWebVitalsResult {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  score: number;
  recommendations: string[];
}

export interface CrawlabilityResult {
  isAccessible: boolean;
  statusCode: number;
  contentLength: number;
  hasContent: boolean;
  robotsAllowed: boolean;
  errors: string[];
}

/**
 * Validate meta tags for SEO compliance
 */
export function validateMetaTags(document: Document): MetaTagValidation {
  const results: MetaTagValidation = {
    title: validateTitle(document),
    description: validateDescription(document),
    keywords: validateKeywords(document),
    canonical: validateCanonical(document),
    openGraph: validateOpenGraph(document),
    twitterCard: validateTwitterCard(document),
    robots: validateRobots(document),
  };

  return results;
}

/**
 * Validate page title
 */
function validateTitle(document: Document): SEOValidationResult {
  const titleElement = document.querySelector('title');
  const title = titleElement?.textContent || '';
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!title) {
    errors.push('Missing page title');
  } else {
    if (title.length < 30) {
      warnings.push('Title is too short (< 30 characters)');
    }
    if (title.length > 60) {
      warnings.push('Title is too long (> 60 characters)');
    }
    if (!title.includes('Cloud Certification')) {
      recommendations.push('Consider including brand name in title');
    }
    if (!/course|learn|training|education|skill/i.test(title)) {
      recommendations.push('Consider including relevant keywords in title');
    }
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate meta description
 */
function validateDescription(document: Document): SEOValidationResult {
  const descElement = document.querySelector('meta[name="description"]');
  const description = descElement?.getAttribute('content') || '';
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!description) {
    errors.push('Missing meta description');
  } else {
    if (description.length < 120) {
      warnings.push('Description is too short (< 120 characters)');
    }
    if (description.length > 160) {
      warnings.push('Description is too long (> 160 characters)');
    }
    if (!/course|learn|training|education|skill|career/i.test(description)) {
      recommendations.push('Consider including relevant keywords in description');
    }
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate keywords meta tag
 */
function validateKeywords(document: Document): SEOValidationResult {
  const keywordsElement = document.querySelector('meta[name="keywords"]');
  const keywords = keywordsElement?.getAttribute('content') || '';
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!keywords) {
    warnings.push('Keywords meta tag is missing (optional but recommended)');
  } else {
    const keywordList = keywords.split(',').map(k => k.trim());
    if (keywordList.length > 10) {
      warnings.push('Too many keywords (> 10), focus on most relevant ones');
    }
    if (keywordList.some(k => k.length > 50)) {
      warnings.push('Some keywords are too long');
    }
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate canonical URL
 */
function validateCanonical(document: Document): SEOValidationResult {
  const canonicalElement = document.querySelector('link[rel="canonical"]');
  const canonical = canonicalElement?.getAttribute('href') || '';
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!canonical) {
    errors.push('Missing canonical URL');
  } else {
    if (!canonical.startsWith('http')) {
      errors.push('Canonical URL must be absolute');
    }
    try {
      new URL(canonical);
    } catch {
      errors.push('Invalid canonical URL format');
    }
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate Open Graph tags
 */
function validateOpenGraph(document: Document): SEOValidationResult {
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!ogTitle) errors.push('Missing og:title');
  if (!ogDescription) errors.push('Missing og:description');
  if (!ogImage) errors.push('Missing og:image');
  if (!ogType) errors.push('Missing og:type');
  if (!ogUrl) warnings.push('Missing og:url (recommended)');
  
  if (ogImage && !ogImage.startsWith('http')) {
    errors.push('og:image must be absolute URL');
  }
  
  if (ogUrl && !ogUrl.startsWith('http')) {
    errors.push('og:url must be absolute URL');
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate Twitter Card tags
 */
function validateTwitterCard(document: Document): SEOValidationResult {
  const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
  const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (!twitterCard) {
    warnings.push('Missing twitter:card (recommended for social sharing)');
  } else {
    if (!['summary', 'summary_large_image', 'app', 'player'].includes(twitterCard)) {
      errors.push('Invalid twitter:card type');
    }
  }
  
  if (!twitterTitle) warnings.push('Missing twitter:title');
  if (!twitterDescription) warnings.push('Missing twitter:description');
  if (!twitterImage) warnings.push('Missing twitter:image');
  
  if (twitterImage && !twitterImage.startsWith('http')) {
    errors.push('twitter:image must be absolute URL');
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate robots meta tag
 */
function validateRobots(document: Document): SEOValidationResult {
  const robotsElement = document.querySelector('meta[name="robots"]');
  const robots = robotsElement?.getAttribute('content') || '';
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (robots.includes('noindex')) {
    warnings.push('Page is set to noindex - will not be indexed by search engines');
  }
  
  if (robots.includes('nofollow')) {
    warnings.push('Page is set to nofollow - links will not be followed');
  }
  
  const score = calculateScore(errors.length, warnings.length);
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
  };
}

/**
 * Validate structured data (JSON-LD)
 */
export function validateStructuredData(document: Document): StructuredDataValidation {
  const scriptElements = document.querySelectorAll('script[type="application/ld+json"]');
  
  const result: StructuredDataValidation = {
    isPresent: scriptElements.length > 0,
    isValid: true,
    schemas: [],
    errors: [],
    warnings: [],
  };
  
  if (scriptElements.length === 0) {
    result.warnings.push('No structured data found');
    return result;
  }
  
  scriptElements.forEach((script, index) => {
    const content = script.textContent;
    if (!content) {
      result.errors.push(`Empty structured data script at index ${index}`);
      result.isValid = false;
      return;
    }
    
    try {
      const jsonLd = JSON.parse(content);
      
      if (!jsonLd['@context']) {
        result.errors.push(`Missing @context in structured data at index ${index}`);
        result.isValid = false;
      }
      
      if (!jsonLd['@type']) {
        result.errors.push(`Missing @type in structured data at index ${index}`);
        result.isValid = false;
      } else {
        result.schemas.push(jsonLd['@type']);
      }
      
      // Validate specific schema types
      if (jsonLd['@type'] === 'Course') {
        validateCourseSchema(jsonLd, result, index);
      } else if (jsonLd['@type'] === 'Organization' || jsonLd['@type'] === 'EducationalOrganization') {
        validateOrganizationSchema(jsonLd, result, index);
      } else if (jsonLd['@type'] === 'Person') {
        validatePersonSchema(jsonLd, result, index);
      }
      
    } catch (error) {
      result.errors.push(`Invalid JSON in structured data at index ${index}: ${error}`);
      result.isValid = false;
    }
  });
  
  return result;
}

/**
 * Validate Course schema
 */
function validateCourseSchema(schema: any, result: StructuredDataValidation, index: number) {
  const required = ['name', 'description', 'provider'];
  const recommended = ['instructor', 'courseCode', 'educationalLevel', 'offers'];
  
  required.forEach(field => {
    if (!schema[field]) {
      result.errors.push(`Missing required field '${field}' in Course schema at index ${index}`);
      result.isValid = false;
    }
  });
  
  recommended.forEach(field => {
    if (!schema[field]) {
      result.warnings.push(`Missing recommended field '${field}' in Course schema at index ${index}`);
    }
  });
}

/**
 * Validate Organization schema
 */
function validateOrganizationSchema(schema: any, result: StructuredDataValidation, index: number) {
  const required = ['name', 'url'];
  const recommended = ['logo', 'description', 'sameAs', 'contactPoint'];
  
  required.forEach(field => {
    if (!schema[field]) {
      result.errors.push(`Missing required field '${field}' in Organization schema at index ${index}`);
      result.isValid = false;
    }
  });
  
  recommended.forEach(field => {
    if (!schema[field]) {
      result.warnings.push(`Missing recommended field '${field}' in Organization schema at index ${index}`);
    }
  });
}

/**
 * Validate Person schema
 */
function validatePersonSchema(schema: any, result: StructuredDataValidation, index: number) {
  const required = ['name'];
  const recommended = ['jobTitle', 'worksFor', 'image', 'description'];
  
  required.forEach(field => {
    if (!schema[field]) {
      result.errors.push(`Missing required field '${field}' in Person schema at index ${index}`);
      result.isValid = false;
    }
  });
  
  recommended.forEach(field => {
    if (!schema[field]) {
      result.warnings.push(`Missing recommended field '${field}' in Person schema at index ${index}`);
    }
  });
}

/**
 * Measure Core Web Vitals
 */
export function measureCoreWebVitals(): Promise<CoreWebVitalsResult> {
  return new Promise((resolve) => {
    const result: CoreWebVitalsResult = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      score: 0,
      recommendations: [],
    };
    
    // Measure TTFB from navigation timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      result.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
    }
    
    let metricsCollected = 0;
    const totalMetrics = 4; // LCP, FID, CLS, FCP
    
    const checkComplete = () => {
      metricsCollected++;
      if (metricsCollected >= totalMetrics) {
        // Calculate score based on Core Web Vitals thresholds
        result.score = calculateCoreWebVitalsScore(result);
        result.recommendations = generateCoreWebVitalsRecommendations(result);
        resolve(result);
      }
    };
    
    // Measure LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1] as any;
            result.lcp = lastEntry.startTime;
          }
          checkComplete();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Measure FCP
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            result.fcp = entries[0].startTime;
          }
          checkComplete();
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        
        // Measure CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          result.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Measure FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const firstEntry = entries[0] as any;
            result.fid = firstEntry.processingStart - firstEntry.startTime;
          }
          checkComplete();
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Timeout for CLS measurement
        setTimeout(() => {
          checkComplete();
        }, 5000);
        
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
        resolve(result);
      }
    } else {
      resolve(result);
    }
    
    // Fallback timeout
    setTimeout(() => {
      resolve(result);
    }, 10000);
  });
}

/**
 * Calculate Core Web Vitals score
 */
function calculateCoreWebVitalsScore(metrics: CoreWebVitalsResult): number {
  let score = 100;
  
  // LCP scoring (Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s)
  if (metrics.lcp !== null) {
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;
  }
  
  // FID scoring (Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms)
  if (metrics.fid !== null) {
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 10;
  }
  
  // CLS scoring (Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25)
  if (metrics.cls !== null) {
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 10;
  }
  
  // FCP scoring (Good: < 1.8s, Needs Improvement: 1.8-3s, Poor: > 3s)
  if (metrics.fcp !== null) {
    if (metrics.fcp > 3000) score -= 15;
    else if (metrics.fcp > 1800) score -= 5;
  }
  
  // TTFB scoring (Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms)
  if (metrics.ttfb !== null) {
    if (metrics.ttfb > 1800) score -= 15;
    else if (metrics.ttfb > 800) score -= 5;
  }
  
  return Math.max(0, score);
}

/**
 * Generate Core Web Vitals recommendations
 */
function generateCoreWebVitalsRecommendations(metrics: CoreWebVitalsResult): string[] {
  const recommendations: string[] = [];
  
  if (metrics.lcp !== null && metrics.lcp > 2500) {
    recommendations.push('Optimize Largest Contentful Paint by compressing images and using Next.js Image component');
    recommendations.push('Consider implementing resource hints (preload, prefetch) for critical resources');
  }
  
  if (metrics.fid !== null && metrics.fid > 100) {
    recommendations.push('Reduce First Input Delay by optimizing JavaScript execution and using code splitting');
    recommendations.push('Consider deferring non-critical JavaScript');
  }
  
  if (metrics.cls !== null && metrics.cls > 0.1) {
    recommendations.push('Improve Cumulative Layout Shift by setting dimensions for images and ads');
    recommendations.push('Avoid inserting content above existing content');
  }
  
  if (metrics.fcp !== null && metrics.fcp > 1800) {
    recommendations.push('Optimize First Contentful Paint by reducing server response time');
    recommendations.push('Minimize render-blocking resources');
  }
  
  if (metrics.ttfb !== null && metrics.ttfb > 800) {
    recommendations.push('Improve Time to First Byte by optimizing server performance');
    recommendations.push('Consider using a CDN for faster content delivery');
  }
  
  return recommendations;
}

/**
 * Test page crawlability
 */
export async function testCrawlability(url: string): Promise<CrawlabilityResult> {
  const result: CrawlabilityResult = {
    isAccessible: false,
    statusCode: 0,
    contentLength: 0,
    hasContent: false,
    robotsAllowed: true,
    errors: [],
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });
    
    result.statusCode = response.status;
    result.isAccessible = response.ok;
    
    if (response.ok) {
      const content = await response.text();
      result.contentLength = content.length;
      result.hasContent = content.length > 100 && /<body[^>]*>[\s\S]*<\/body>/i.test(content);
      
      // Check robots meta tag
      const robotsMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (robotsMatch) {
        const robotsContent = robotsMatch[1].toLowerCase();
        result.robotsAllowed = !robotsContent.includes('noindex');
      }
    } else {
      result.errors.push(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    result.errors.push(`Network error: ${error}`);
  }
  
  return result;
}

/**
 * Calculate overall score
 */
function calculateScore(errors: number, warnings: number): number {
  let score = 100;
  score -= errors * 20; // Each error reduces score by 20
  score -= warnings * 5; // Each warning reduces score by 5
  return Math.max(0, score);
}

/**
 * Generate comprehensive SEO report
 */
export interface SEOReport {
  url: string;
  timestamp: string;
  overallScore: number;
  metaTags: MetaTagValidation;
  structuredData: StructuredDataValidation;
  coreWebVitals: CoreWebVitalsResult;
  crawlability: CrawlabilityResult;
  recommendations: string[];
}

export async function generateSEOReport(url: string, document: Document): Promise<SEOReport> {
  const metaTags = validateMetaTags(document);
  const structuredData = validateStructuredData(document);
  const coreWebVitals = await measureCoreWebVitals();
  const crawlability = await testCrawlability(url);
  
  // Calculate overall score
  const scores = [
    metaTags.title.score,
    metaTags.description.score,
    metaTags.openGraph.score,
    metaTags.twitterCard.score,
    structuredData.isValid ? 100 : 50,
    coreWebVitals.score,
    crawlability.isAccessible ? 100 : 0,
  ];
  
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Collect all recommendations
  const recommendations = [
    ...metaTags.title.recommendations,
    ...metaTags.description.recommendations,
    ...metaTags.openGraph.recommendations,
    ...metaTags.twitterCard.recommendations,
    ...coreWebVitals.recommendations,
  ];
  
  return {
    url,
    timestamp: new Date().toISOString(),
    overallScore: Math.round(overallScore),
    metaTags,
    structuredData,
    coreWebVitals,
    crawlability,
    recommendations,
  };
}