/**
 * SEO Validation Tests
 * Tests for the comprehensive SEO validation utilities
 */

import {
  validateMetaTags,
  validateStructuredData,
  testCrawlability,
  generateSEOReport,
  type SEOValidationResult,
  type MetaTagValidation,
  type StructuredDataValidation,
} from '../seo-validation';

// Mock fetch for crawlability tests
global.fetch = jest.fn();

// Mock performance API for Core Web Vitals tests
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    getEntriesByType: jest.fn(() => []),
    now: jest.fn(() => Date.now()),
  },
});

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as any;

// Add supportedEntryTypes property
(global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'measure', 'paint'];

// Mock measureCoreWebVitals to avoid timeout issues
jest.mock('../seo-validation', () => {
  const actual = jest.requireActual('../seo-validation');
  return {
    ...actual,
    measureCoreWebVitals: jest.fn().mockResolvedValue({
      lcp: 1500,
      fid: 50,
      cls: 0.05,
      fcp: 1200,
      ttfb: 400,
      score: 85,
      recommendations: [],
    }),
  };
});

// Mock DOM implementation for testing
function createMockDocument(html: string): Document {
  const mockDoc = {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    title: '',
  } as unknown as Document;

  // Parse HTML and set up mock responses
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    mockDoc.title = titleMatch[1];
    (mockDoc.querySelector as jest.Mock).mockImplementation((selector: string) => {
      if (selector === 'title') {
        return { textContent: titleMatch[1] };
      }
      return null;
    });
  }

  // Mock meta tag queries
  (mockDoc.querySelector as jest.Mock).mockImplementation((selector: string) => {
    if (selector === 'title') {
      return titleMatch ? { textContent: titleMatch[1] } : null;
    }
    
    if (selector === 'meta[name="description"]') {
      const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      return match ? { getAttribute: () => match[1] } : null;
    }
    
    if (selector === 'meta[name="keywords"]') {
      const match = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      return match ? { getAttribute: () => match[1] } : null;
    }
    
    if (selector === 'link[rel="canonical"]') {
      const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
      return match ? { getAttribute: () => match[1] } : null;
    }
    
    if (selector.includes('og:')) {
      const property = selector.match(/property=["']([^"']+)["']/)?.[1];
      if (property) {
        const match = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'));
        return match ? { getAttribute: () => match[1] } : null;
      }
    }
    
    if (selector.includes('twitter:')) {
      const name = selector.match(/name=["']([^"']+)["']/)?.[1];
      if (name) {
        const match = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'));
        return match ? { getAttribute: () => match[1] } : null;
      }
    }
    
    if (selector === 'meta[name="robots"]') {
      const match = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      return match ? { getAttribute: () => match[1] } : null;
    }
    
    return null;
  });

  // Mock structured data queries
  (mockDoc.querySelectorAll as jest.Mock).mockImplementation((selector: string) => {
    if (selector === 'script[type="application/ld+json"]') {
      const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (matches) {
        return matches.map(match => {
          const content = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          return { textContent: content };
        });
      }
    }
    return [];
  });

  return mockDoc;
}

describe('SEO Validation Tests', () => {
  let mockDocument: Document;

  beforeEach(() => {
    // Create a mock DOM for testing
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Course - Online Learning | Anywheredoor</title>
          <meta name="description" content="Learn programming with our comprehensive online course. Master coding skills and advance your career with expert instruction and hands-on projects." />
          <meta name="keywords" content="programming, online course, coding, web development, career advancement" />
          <link rel="canonical" href="https://anywheredoor.com/courses/test-course" />
          
          <!-- Open Graph -->
          <meta property="og:title" content="Test Course - Online Learning" />
          <meta property="og:description" content="Learn programming with our comprehensive online course" />
          <meta property="og:image" content="https://anywheredoor.com/images/course-thumbnail.jpg" />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="https://anywheredoor.com/courses/test-course" />
          
          <!-- Twitter Card -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Test Course - Online Learning" />
          <meta name="twitter:description" content="Learn programming with our comprehensive online course" />
          <meta name="twitter:image" content="https://anywheredoor.com/images/course-thumbnail.jpg" />
          
          <!-- Robots -->
          <meta name="robots" content="index, follow" />
          
          <!-- Structured Data -->
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Test Course",
            "description": "Learn programming with our comprehensive online course",
            "provider": {
              "@type": "Organization",
              "name": "Anywheredoor"
            },
            "instructor": {
              "@type": "Person",
              "name": "John Doe"
            },
            "courseCode": "TEST-001",
            "educationalLevel": "Beginner",
            "offers": {
              "@type": "Offer",
              "price": "99",
              "priceCurrency": "USD"
            }
          }
          </script>
        </head>
        <body>
          <h1>Test Course</h1>
          <p>This is a test course for SEO validation.</p>
        </body>
      </html>
    `;
    
    mockDocument = createMockDocument(html);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Meta Tags Validation', () => {
    it('should validate complete and correct meta tags', () => {
      const result = validateMetaTags(mockDocument);
      
      expect(result.title.isValid).toBe(true);
      expect(result.title.score).toBeGreaterThan(80);
      expect(result.title.errors).toHaveLength(0);
      
      expect(result.description.isValid).toBe(true);
      expect(result.description.score).toBeGreaterThan(80);
      expect(result.description.errors).toHaveLength(0);
      
      expect(result.canonical.isValid).toBe(true);
      expect(result.canonical.errors).toHaveLength(0);
      
      expect(result.openGraph.isValid).toBe(true);
      expect(result.openGraph.errors).toHaveLength(0);
      
      expect(result.twitterCard.isValid).toBe(true);
      expect(result.twitterCard.errors).toHaveLength(0);
    });

    it('should detect missing title', () => {
      const mockDoc = createMockDocument('<html><head></head><body></body></html>');
      const result = validateMetaTags(mockDoc);
      
      expect(result.title.isValid).toBe(false);
      expect(result.title.errors).toContain('Missing page title');
    });

    it('should detect title length issues', () => {
      const shortMockDoc = createMockDocument('<html><head><title>Short</title></head><body></body></html>');
      const shortResult = validateMetaTags(shortMockDoc);
      
      expect(shortResult.title.warnings).toContain('Title is too short (< 30 characters)');
      
      const longTitle = 'A'.repeat(70);
      const longMockDoc = createMockDocument(`<html><head><title>${longTitle}</title></head><body></body></html>`);
      const longResult = validateMetaTags(longMockDoc);
      
      expect(longResult.title.warnings).toContain('Title is too long (> 60 characters)');
    });

    it('should detect missing meta description', () => {
      const mockDoc = createMockDocument('<html><head><title>Test</title></head><body></body></html>');
      const result = validateMetaTags(mockDoc);
      
      expect(result.description.isValid).toBe(false);
      expect(result.description.errors).toContain('Missing meta description');
    });

    it('should detect description length issues', () => {
      const shortDesc = 'Short description';
      const shortDescMockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <meta name="description" content="${shortDesc}" />
          </head>
          <body></body>
        </html>
      `);
      const shortResult = validateMetaTags(shortDescMockDoc);
      
      expect(shortResult.description.warnings).toContain('Description is too short (< 120 characters)');
      
      const longDesc = 'A'.repeat(170);
      const longDescMockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <meta name="description" content="${longDesc}" />
          </head>
          <body></body>
        </html>
      `);
      const longResult = validateMetaTags(longDescMockDoc);
      
      expect(longResult.description.warnings).toContain('Description is too long (> 160 characters)');
    });

    it('should detect missing canonical URL', () => {
      const mockDoc = createMockDocument('<html><head><title>Test</title></head><body></body></html>');
      const result = validateMetaTags(mockDoc);
      
      expect(result.canonical.isValid).toBe(false);
      expect(result.canonical.errors).toContain('Missing canonical URL');
    });

    it('should detect invalid canonical URL', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <link rel="canonical" href="/relative-url" />
          </head>
          <body></body>
        </html>
      `);
      const result = validateMetaTags(mockDoc);
      
      expect(result.canonical.isValid).toBe(false);
      expect(result.canonical.errors).toContain('Canonical URL must be absolute');
    });

    it('should detect missing Open Graph tags', () => {
      const mockDoc = createMockDocument('<html><head><title>Test</title></head><body></body></html>');
      const result = validateMetaTags(mockDoc);
      
      expect(result.openGraph.isValid).toBe(false);
      expect(result.openGraph.errors).toContain('Missing og:title');
      expect(result.openGraph.errors).toContain('Missing og:description');
      expect(result.openGraph.errors).toContain('Missing og:image');
      expect(result.openGraph.errors).toContain('Missing og:type');
    });

    it('should detect invalid Open Graph image URL', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <meta property="og:title" content="Test" />
            <meta property="og:description" content="Test description" />
            <meta property="og:image" content="/relative-image.jpg" />
            <meta property="og:type" content="article" />
          </head>
          <body></body>
        </html>
      `);
      const result = validateMetaTags(mockDoc);
      
      expect(result.openGraph.isValid).toBe(false);
      expect(result.openGraph.errors).toContain('og:image must be absolute URL');
    });

    it('should detect missing Twitter Card tags', () => {
      const mockDoc = createMockDocument('<html><head><title>Test</title></head><body></body></html>');
      const result = validateMetaTags(mockDoc);
      
      expect(result.twitterCard.warnings).toContain('Missing twitter:card (recommended for social sharing)');
      expect(result.twitterCard.warnings).toContain('Missing twitter:title');
      expect(result.twitterCard.warnings).toContain('Missing twitter:description');
      expect(result.twitterCard.warnings).toContain('Missing twitter:image');
    });

    it('should detect invalid Twitter Card type', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <meta name="twitter:card" content="invalid_type" />
          </head>
          <body></body>
        </html>
      `);
      const result = validateMetaTags(mockDoc);
      
      expect(result.twitterCard.isValid).toBe(false);
      expect(result.twitterCard.errors).toContain('Invalid twitter:card type');
    });
  });

  describe('Structured Data Validation', () => {
    it('should validate correct structured data', () => {
      const result = validateStructuredData(mockDocument);
      
      expect(result.isPresent).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.schemas).toContain('Course');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing structured data', () => {
      const mockDoc = createMockDocument('<html><head><title>Test</title></head><body></body></html>');
      const result = validateStructuredData(mockDoc);
      
      expect(result.isPresent).toBe(false);
      expect(result.warnings).toContain('No structured data found');
    });

    it('should detect invalid JSON in structured data', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              { invalid json }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid JSON'))).toBe(true);
    });

    it('should detect missing @context in structured data', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              {
                "@type": "Course",
                "name": "Test Course"
              }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing @context in structured data at index 0');
    });

    it('should detect missing @type in structured data', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "name": "Test Course"
              }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing @type in structured data at index 0');
    });

    it('should validate Course schema requirements', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Course",
                "name": "Test Course"
              }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field 'description' in Course schema at index 0");
      expect(result.errors).toContain("Missing required field 'provider' in Course schema at index 0");
    });

    it('should validate Organization schema requirements', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Test Organization"
              }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field 'url' in Organization schema at index 0");
    });

    it('should validate Person schema requirements', () => {
      const mockDoc = createMockDocument(`
        <html>
          <head>
            <title>Test</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Person"
              }
            </script>
          </head>
          <body></body>
        </html>
      `);
      const result = validateStructuredData(mockDoc);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field 'name' in Person schema at index 0");
    });
  });

  describe('Crawlability Testing', () => {
    it('should test successful page crawlability', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => `
          <html>
            <head><title>Test Page</title></head>
            <body><h1>Test Content</h1><p>This is test content for crawlers.</p></body>
          </html>
        `,
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await testCrawlability('https://example.com/test');
      
      expect(result.isAccessible).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.hasContent).toBe(true);
      expect(result.robotsAllowed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => '<html><body>Not Found</body></html>',
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await testCrawlability('https://example.com/not-found');
      
      expect(result.isAccessible).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.errors).toContain('HTTP 404: Not Found');
    });

    it('should detect noindex robots directive', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => `
          <html>
            <head>
              <title>Test Page</title>
              <meta name="robots" content="noindex, nofollow" />
            </head>
            <body><h1>Test Content</h1></body>
          </html>
        `,
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await testCrawlability('https://example.com/noindex');
      
      expect(result.robotsAllowed).toBe(false);
    });

    it('should detect insufficient content', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<html><body>Short</body></html>',
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await testCrawlability('https://example.com/short');
      
      expect(result.hasContent).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await testCrawlability('https://example.com/error');
      
      expect(result.isAccessible).toBe(false);
      expect(result.errors).toContain('Network error: Error: Network error');
    });
  });

  describe('SEO Report Generation', () => {
    it('should validate meta tags and structured data components', async () => {
      // Test individual components that make up the SEO report
      const metaTags = validateMetaTags(mockDocument);
      expect(metaTags.title.isValid).toBe(true);
      expect(metaTags.description.isValid).toBe(true);
      expect(metaTags.openGraph.isValid).toBe(true);
      
      const structuredData = validateStructuredData(mockDocument);
      expect(structuredData.isPresent).toBe(true);
      expect(structuredData.isValid).toBe(true);
      
      // Test crawlability component
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => `<html><body><h1>Test Content</h1><p>This is substantial test content with enough text to meet the minimum content requirements for search engine crawlers to properly index and understand the page content.</p></body></html>`,
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const crawlability = await testCrawlability('https://anywheredoor.com/test');
      expect(crawlability.isAccessible).toBe(true);
      expect(crawlability.hasContent).toBe(true);
    });

    it('should detect SEO issues in individual components', async () => {
      // Test with a document that has SEO issues
      const poorSEOMockDoc = createMockDocument(`
        <html>
          <head>
            <title>Bad</title>
            <meta name="description" content="Short" />
          </head>
          <body></body>
        </html>
      `);
      
      const metaTags = validateMetaTags(poorSEOMockDoc);
      expect(metaTags.title.warnings.length).toBeGreaterThan(0);
      expect(metaTags.description.warnings.length).toBeGreaterThan(0);
      
      const structuredData = validateStructuredData(poorSEOMockDoc);
      expect(structuredData.isPresent).toBe(false);
      
      // Test failed crawlability
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found',
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const crawlability = await testCrawlability('https://example.com/bad');
      expect(crawlability.isAccessible).toBe(false);
      expect(crawlability.errors.length).toBeGreaterThan(0);
    });
  });
});