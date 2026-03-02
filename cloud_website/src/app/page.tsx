import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import prisma from '@/lib/db';

// Dynamically import client components to keep this page as a server component
const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));
const HeroSection = dynamic(() => import('@/components/HeroSection'));
const ScrollReveal = dynamic(() => import('@/components/EnhancedAnimations').then(mod => ({ default: mod.ScrollReveal })));
const StaggerContainer = dynamic(() => import('@/components/EnhancedAnimations').then(mod => ({ default: mod.StaggerContainer })));
const AnimatedCard = dynamic(() => import('@/components/EnhancedAnimations').then(mod => ({ default: mod.AnimatedCard })));
const AnimatedButton = dynamic(() => import('@/components/EnhancedAnimations').then(mod => ({ default: mod.AnimatedButton })));
const TrustIndicators = dynamic(() => import('@/components/TrustIndicators'));
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })));
const WelcomePopup = dynamic(() => import('@/components/WelcomePopup'));
const BlogSection = dynamic(() => import('@/components/BlogSection'));

// Static generation - this page will be pre-rendered at build time
export const metadata: Metadata = {
  title: 'Anywheredoor - Be a Leader in Your Field with Industry-Certified Skills',
  description: 'Advance to senior roles at Fortune 500 companies with job-ready certifications in programming, data science, and cybersecurity. Join 50K+ professionals who achieved 75% average salary increases and leadership positions.',
  keywords: ['career advancement', 'industry certification', 'senior developer roles', 'Fortune 500 careers', 'tech leadership', 'job-ready skills', 'salary increase'],
  openGraph: {
    title: 'Anywheredoor - Industry-Certified Tech Leadership Training',
    description: 'Advance to senior roles at Fortune 500 companies with job-ready skills and industry-recognized certifications',
    type: 'website',
    url: 'https://anywheredoor.com',
    images: [
      {
        url: '/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Anywheredoor Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anywheredoor - Industry-Certified Tech Leadership Training',
    description: 'Advance to senior roles at Fortune 500 companies with job-ready skills and industry-recognized certifications',
    images: ['/og-homepage.jpg'],
  },
};

// Structured data for homepage - using static values for build time
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Anywheredoor',
  description: 'Online learning platform for tech careers',
  url: 'https://anywheredoor.com',
  logo: 'https://anywheredoor.com/logo.png',
  sameAs: [
    'https://twitter.com/anywheredoor',
    'https://linkedin.com/company/anywheredoor',
  ],
  offers: {
    '@type': 'Course',
    name: 'Technology Courses',
    description: 'Professional courses in programming, data science, and cybersecurity',
    provider: {
      '@type': 'Organization',
      name: 'Anywheredoor',
    },
  },
};

export default async function Home() {
  // Fetch real data from database with fallbacks for build time
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    _count: { Course: number };
  }> = [];
  let testimonials: Array<{
    id: string;
    author: string;
    message: string;
    courseId: string | null;
    createdAt: Date;
  }> = [];
  let courseStats: { _count: number; _avg: { rating: number | null } } = { 
    _count: 0, 
    _avg: { rating: 4.7 } 
  };
  let totalEnrollments = 0;
  let completedEnrollments = 0;
  let blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    author: { name: string | null; image: string | null };
  }> = [];

  try {
    [categories, testimonials, courseStats, blogPosts] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { Course: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.testimonial.findMany({
        select: {
          id: true,
          author: true,
          message: true,
          courseId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      }),
      prisma.course.aggregate({
        where: { published: true },
        _count: true,
        _avg: { rating: true }
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        take: 10,
      })
    ]);

    // Calculate success metrics from real data
    totalEnrollments = await prisma.enrollment.count();
    completedEnrollments = await prisma.enrollment.count({
      where: { status: 'COMPLETED' }
    });
  } catch (error) {
    console.error('Error fetching data during build:', error);
    // Use fallback data for build time
  }
  
  const successMetrics = {
    totalStudents: totalEnrollments || 0,
    jobPlacementRate: 92, // Static value - would need separate tracking
    averageSalaryIncrease: '65%', // Static value - would need separate tracking
    averageRating: courseStats._avg.rating || 4.7,
    courseCompletionRate: 85, // Static value - would need separate tracking
    industryPartners: ['Google', 'Microsoft', 'Amazon', 'Meta'], // Static value
  };

  // Map categories to include color and description
  const categoryColors: Record<string, string> = {
    'Web Development': '#3B82F6',
    'Data Science': '#10B981',
    'Cybersecurity': '#F59E0B',
    'Cloud Computing': '#8B5CF6',
  };

  const categoryDescriptions: Record<string, string> = {
    'Web Development': 'Master job-ready full-stack development skills for high-demand tech roles',
    'Data Science': 'Build career-advancing expertise in AI, ML, and data analytics for Fortune 500 companies',
    'Cybersecurity': 'Develop industry-certified security skills for leadership roles in enterprise protection',
    'Cloud Computing': 'Gain cloud architecture expertise for senior engineering and DevOps leadership positions',
  };

  const enrichedCategories = categories.map(cat => ({
    ...cat,
    color: categoryColors[cat.name] || '#6B7280',
    description: categoryDescriptions[cat.name] || `Explore ${cat.name} courses and advance your career`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        {/* Hero Section - Integrated Component */}
        <HeroSection
          headline="Be a Leader in Your Field with Industry-Certified Tech Skills"
          subheadline={`Join ${successMetrics.totalStudents.toLocaleString()}+ professionals who've advanced to senior roles with our job-ready courses in programming, data science, and cybersecurity. Get industry-recognized certifications that Fortune 500 companies trust.`}
          primaryCTA={{
            text: "Explore Career Paths",
            href: "/courses"
          }}
          secondaryCTA={{
            text: "Watch Success Stories",
            href: "#testimonials"
          }}
          successMetrics={[
            {
              id: "1",
              value: `${successMetrics.totalStudents.toLocaleString()}+`,
              label: "Career Advances",
              iconName: "users" as const,
              description: "Professionals promoted"
            },
            {
              id: "2", 
              value: `${successMetrics.jobPlacementRate}%`,
              label: "Job Placement",
              iconName: "trophy" as const,
              description: "Within 6 months"
            },
            {
              id: "3",
              value: successMetrics.averageSalaryIncrease,
              label: "Salary Increase",
              iconName: "chart" as const,
              description: "Average boost"
            },
            {
              id: "4",
              value: `${successMetrics.averageRating}★`,
              label: "Industry Rating",
              iconName: "academic" as const,
              description: "Employer reviews"
            }
          ]}
        />

        {/* Featured Categories Preview */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Career-Focused Learning Paths
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                  Master the exact skills that top employers are hiring for. Our industry-aligned courses 
                  are designed with Fortune 500 companies to ensure you're job-ready from day one.
                </p>
              </div>
            </ScrollReveal>
            
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {enrichedCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  className="block"
                >
                  <AnimatedCard className="p-4 sm:p-6 border border-gray-200 hover:border-blue-300 h-full">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 flex items-center justify-center transition-transform duration-300 hover:scale-110"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div 
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded transition-all duration-300"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">Explore courses</span>
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </AnimatedCard>
                </Link>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Trust Indicators Section - Integrated Component */}
        <TrustIndicators
          metrics={successMetrics}
          showPartnerLogos={true}
          showCertifications={true}
          showStatistics={true}
        />

        {/* Testimonials Section - Integrated Component */}
        <TestimonialsSection
          testimonials={[]}
          title="Real Stories, Incredible Journeys"
          subtitle="Discover how our learners transformed their careers and achieved their professional goals with industry-recognized certifications and job-ready skills."
          displayMode="carousel"
          showViewAll={true}
        />

        {/* Blog Section */}
        <BlogSection posts={blogPosts} />

        {/* Navigation Flow */}
        <NavigationFlow />

        {/* Welcome Popup - Shows once per user */}
        <WelcomePopup />
      </div>
    </>
  );
}
