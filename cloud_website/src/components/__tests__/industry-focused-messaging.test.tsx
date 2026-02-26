/**
 * Property-Based Tests for Industry-Focused Messaging
 * Feature: simplilearn-inspired-redesign, Property 7: Industry-Focused Messaging
 * **Validates: Requirements 6.1, 6.4**
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all the problematic modules first
jest.mock('../../lib/performance-optimization', () => ({
  resourcePreloader: {
    preloadRoute: jest.fn(),
    preloadImage: jest.fn(),
    preloadCSS: jest.fn(),
    preloadJS: jest.fn(),
  },
}));

jest.mock('../../lib/responsive-utils', () => ({
  responsiveSpacing: jest.fn(() => 'p-4'),
  responsiveTypography: {
    heading: {
      h1: 'text-4xl md:text-5xl lg:text-6xl',
      h2: 'text-3xl md:text-4xl lg:text-5xl',
    },
    body: {
      large: 'text-lg md:text-xl',
      base: 'text-base',
    },
    lineHeight: {
      tight: 'leading-tight',
      normal: 'leading-normal',
    },
  },
  touchUtils: {
    getTouchFriendlyProps: jest.fn(() => ({})),
    getTapTargetClasses: jest.fn(() => 'min-h-[44px] min-w-[44px]'),
    getTouchClasses: jest.fn((classes) => classes),
  },
}));

jest.mock('../../hooks/useLazyLoading', () => ({
  usePreloadOnHover: jest.fn(() => ({
    handleMouseEnter: jest.fn(),
    handleMouseLeave: jest.fn(),
  })),
  usePerformanceMonitor: jest.fn(() => ({
    metrics: {},
    isLoading: false,
    measureOperation: jest.fn((name, fn) => fn && fn()),
  })),
}));

// Now import the components
import HeroSection, { defaultHeroProps } from '../HeroSection';
import CareerPathway from '../CareerPathway';
import EnterpriseSolutions from '../EnterpriseSolutions';
import IndustryRecognition from '../IndustryRecognition';

// Mock data for testing
const mockCareerPaths = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    description: 'Lead frontend development teams and architect user interfaces for enterprise applications at Fortune 500 companies',
    level: 'mid' as const,
    salaryRange: { min: 85000, max: 130000, currency: '$' },
    timeToRole: '6-12 months',
    demandLevel: 'high' as const,
    skills: ['React', 'TypeScript', 'Node.js'],
    companies: ['Microsoft', 'Google', 'Amazon'],
    growthRate: '15% annually',
    jobOpenings: 50000,
    nextRoles: ['Tech Lead', 'Engineering Manager']
  }
];

const mockEnterpriseSolutions = [
  {
    id: '1',
    title: 'Corporate Training Programs',
    description: 'Comprehensive training solutions for Fortune 500 companies',
    features: ['Custom curriculum', 'Industry-certified instructors', 'Career advancement tracking'],
    icon: 'building',
    category: 'training' as const,
    pricing: '$5,000 per cohort'
  }
];

const mockFortune500Clients = [
  {
    id: '1',
    name: 'Microsoft',
    logoUrl: '/partners/microsoft-logo.svg',
    category: 'fortune500' as const,
    description: 'Technology partner'
  }
];

const mockEnterpriseCaseStudies = [
  {
    id: '1',
    companyName: 'Tech Corp',
    companyLogo: '/case-studies/techcorp-logo.svg',
    industry: 'Technology',
    challenge: 'Need to upskill development teams',
    solution: 'Implemented comprehensive training program',
    results: [
      { metric: 'Promotion Rate', value: '85%', description: 'Team members promoted' },
      { metric: 'Salary Increase', value: '120%', description: 'Average salary growth' }
    ],
    testimonial: {
      quote: 'Excellent training program',
      author: 'John Doe',
      title: 'CTO'
    },
    isPublic: true
  }
];

const mockIndustryRecognitions = [
  {
    id: '1',
    name: 'Industry Accreditation',
    type: 'accreditation' as const,
    description: 'Globally recognized certification standards',
    organization: 'Tech Industry Board',
    logoUrl: '/certifications/accredited-badge.svg',
    verificationUrl: 'https://example.com/verify'
  }
];

// Mock OptimizedImage component
jest.mock('../OptimizedImage', () => {
  return function MockOptimizedImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />;
  };
});

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock PerformanceObserver for performance monitoring
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as any;

// Add supportedEntryTypes to the mock
(global.PerformanceObserver as any).supportedEntryTypes = ['measure', 'navigation'];

describe('Industry-Focused Messaging Property Tests', () => {
  test('Property 7: Industry-Focused Messaging - For any content displayed on the platform, the messaging should emphasize job-ready skills, career advancement, and industry recognition value', () => {
    fc.assert(
      fc.property(
        // Generate different component scenarios to test
        fc.oneof(
          // Hero Section scenarios
          fc.constant('hero'),
          // Career Pathway scenarios  
          fc.constant('career'),
          // Enterprise Solutions scenarios
          fc.constant('enterprise'),
          // Industry Recognition scenarios
          fc.constant('recognition')
        ),
        (componentType) => {
          let container: HTMLElement;
          
          switch (componentType) {
            case 'hero':
              const { container: heroContainer } = render(
                <HeroSection {...defaultHeroProps} />
              );
              container = heroContainer;
              break;
              
            case 'career':
              const { container: careerContainer } = render(
                <CareerPathway 
                  title="Career Advancement Paths"
                  pathways={mockCareerPaths}
                />
              );
              container = careerContainer;
              break;
              
            case 'enterprise':
              const { container: enterpriseContainer } = render(
                <EnterpriseSolutions
                  solutions={mockEnterpriseSolutions}
                  clientLogos={mockFortune500Clients}
                  caseStudies={mockEnterpriseCaseStudies}
                  onContactClick={() => {}}
                  onDemoClick={() => {}}
                />
              );
              container = enterpriseContainer;
              break;
              
            case 'recognition':
              const { container: recognitionContainer } = render(
                <IndustryRecognition
                  recognitions={mockIndustryRecognitions}
                />
              );
              container = recognitionContainer;
              break;
              
            default:
              throw new Error(`Unknown component type: ${componentType}`);
          }

          const content = container.textContent || '';
          
          // Requirement 6.1: Industry-focused messaging that emphasizes job-ready skills and career advancement
          const hasJobReadySkills = /job.ready|industry.ready|work.ready|employment.ready/i.test(content) ||
                                   /practical.skills|hands.on|real.world/i.test(content) ||
                                   /industry.aligned|market.relevant/i.test(content);
          
          const hasCareerAdvancement = /career.advancement|career.growth|career.progression/i.test(content) ||
                                      /promotion|leadership.role|senior.role/i.test(content) ||
                                      /salary.increase|salary.growth|income.growth/i.test(content) ||
                                      /advance.to|progress.to|move.to/i.test(content);
          
          // Requirement 6.4: Industry recognition and accreditation value emphasis
          const hasIndustryRecognition = /industry.recognition|industry.certified|industry.standard/i.test(content) ||
                                        /accredited|accreditation|certification/i.test(content) ||
                                        /Fortune.500|enterprise|professional.standard/i.test(content) ||
                                        /globally.recognized|industry.leading/i.test(content);
          
          // Property: At least one of these messaging themes should be present
          const hasIndustryFocusedMessaging = hasJobReadySkills || hasCareerAdvancement || hasIndustryRecognition;
          
          // Additional validation: If career advancement is mentioned, it should be specific
          if (hasCareerAdvancement) {
            const hasSpecificOutcomes = /\d+%|\$\d+|senior|lead|manager|director/i.test(content);
            expect(hasSpecificOutcomes).toBe(true);
          }
          
          // Additional validation: If industry recognition is mentioned, it should be credible
          if (hasIndustryRecognition) {
            const hasCredibleSources = /Fortune.500|university|accredited|certified|ISO|IEEE/i.test(content);
            expect(hasCredibleSources).toBe(true);
          }
          
          expect(hasIndustryFocusedMessaging).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7a: Job-Ready Skills Messaging - For any course or program content, the messaging should emphasize practical, applicable skills', () => {
    fc.assert(
      fc.property(
        // Test with different career paths
        fc.integer({ min: 0, max: mockCareerPaths.length - 1 }),
        (pathIndex) => {
          const selectedPath = mockCareerPaths[pathIndex];
          const { container } = render(
            <CareerPathway 
              title="Skills Development"
              pathways={[selectedPath]}
            />
          );
          
          const content = container.textContent || '';
          
          // Should emphasize practical application
          const hasPracticalEmphasis = /hands.on|practical|real.world|industry.project/i.test(content) ||
                                      /applicable|job.ready|work.ready|market.relevant/i.test(content) ||
                                      /enterprise.level|production.ready/i.test(content);
          
          // Should mention specific skills or technologies
          const hasSpecificSkills = /JavaScript|Python|React|Node|AWS|Docker|Kubernetes/i.test(content) ||
                                   /programming|development|data.science|cybersecurity/i.test(content) ||
                                   /machine.learning|cloud.computing|DevOps/i.test(content);
          
          expect(hasPracticalEmphasis || hasSpecificSkills).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 7b: Career Advancement Messaging - For any testimonial or success story content, the messaging should include specific career outcomes', () => {
    fc.assert(
      fc.property(
        // Test different enterprise solutions
        fc.integer({ min: 0, max: mockEnterpriseSolutions.length - 1 }),
        (solutionIndex) => {
          const selectedSolution = {
            ...mockEnterpriseSolutions[solutionIndex],
            category: 'training' as const,
            pricing: '$5,000 per cohort'
          };
          const { container } = render(
            <EnterpriseSolutions
              solutions={[selectedSolution]}
              clientLogos={mockFortune500Clients}
              caseStudies={mockEnterpriseCaseStudies}
              onContactClick={() => {}}
              onDemoClick={() => {}}
            />
          );
          
          const content = container.textContent || '';
          
          // Should mention career progression or outcomes
          const hasCareerOutcomes = /promotion|advancement|leadership|senior.role/i.test(content) ||
                                   /salary.increase|income.growth|career.growth/i.test(content) ||
                                   /Fortune.500|enterprise.role|management.position/i.test(content);
          
          // Should have quantifiable metrics when possible
          const hasMetrics = /\d+%|\$\d+|\d+x|within.\d+|average|typical/i.test(content);
          
          // At least one should be present for career-focused content
          expect(hasCareerOutcomes || hasMetrics).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Property 7c: Industry Recognition Messaging - For any certification or accreditation content, the messaging should emphasize credibility and value', () => {
    fc.assert(
      fc.property(
        // Test different industry recognitions
        fc.integer({ min: 0, max: mockIndustryRecognitions.length - 1 }),
        (recognitionIndex) => {
          const selectedRecognition = {
            ...mockIndustryRecognitions[recognitionIndex],
            name: mockIndustryRecognitions[recognitionIndex].name || 'Industry Accreditation',
            organization: mockIndustryRecognitions[recognitionIndex].organization || 'Tech Industry Board'
          };
          const { container } = render(
            <IndustryRecognition
              recognitions={[selectedRecognition]}
            />
          );
          
          const content = container.textContent || '';
          
          // Should emphasize credibility
          const hasCredibility = /accredited|certified|recognized|approved/i.test(content) ||
                                /industry.standard|globally.recognized|professional.body/i.test(content) ||
                                /ISO|IEEE|ACM|university.partnership/i.test(content);
          
          // Should emphasize value
          const hasValue = /career.value|industry.value|professional.value/i.test(content) ||
                          /competitive.advantage|market.recognition|employer.trusted/i.test(content) ||
                          /Fortune.500|enterprise.recognized/i.test(content);
          
          expect(hasCredibility || hasValue).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });
});