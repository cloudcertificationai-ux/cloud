import { Metadata } from 'next';
import Link from 'next/link';
import { OptimizedImage, StructuredData } from '@/components';

// Mock blog posts data (in production, this would come from a CMS or markdown files)
const blogPosts = [
  {
    id: '1',
    title: 'Complete Guide to Learning Web Development in 2024',
    excerpt: 'Everything you need to know to start your web development journey, from HTML basics to advanced frameworks.',
    slug: 'complete-guide-web-development-2024',
    category: 'Web Development',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-15',
    readingTime: '12 min read',
    image: '/images/blog/web-development-guide.jpg',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Career'],
  },
  {
    id: '2',
    title: 'Data Science Career Path: From Beginner to Professional',
    excerpt: 'A comprehensive roadmap for transitioning into data science, including skills, tools, and career opportunities.',
    slug: 'data-science-career-path-guide',
    category: 'Data Science',
    author: 'Michael Chen',
    publishedAt: '2024-01-10',
    readingTime: '15 min read',
    image: '/images/blog/data-science-career.jpg',
    tags: ['Python', 'Machine Learning', 'Statistics', 'Career'],
  },
  {
    id: '3',
    title: 'Cybersecurity Fundamentals: Protecting Your Digital Life',
    excerpt: 'Essential cybersecurity concepts and practices every professional should know in today\'s digital world.',
    slug: 'cybersecurity-fundamentals-guide',
    category: 'Cybersecurity',
    author: 'Alex Rodriguez',
    publishedAt: '2024-01-05',
    readingTime: '10 min read',
    image: '/images/blog/cybersecurity-fundamentals.jpg',
    tags: ['Security', 'Privacy', 'Best Practices', 'Career'],
  },
];

export const metadata: Metadata = {
  title: 'Learning Resources & Career Guides',
  description: 'Expert insights, career guides, and learning resources to help you advance in technology. Stay updated with the latest trends and best practices.',
  keywords: [
    'tech career guides',
    'programming tutorials',
    'learning resources',
    'technology trends',
    'career development',
    'coding tips',
  ],
  openGraph: {
    title: 'Learning Resources & Career Guides | Anywheredoor',
    description: 'Expert insights and career guides to help you advance in technology.',
    type: 'website',
  },
};

export default function ResourcesPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Anywheredoor Learning Resources',
    description: 'Expert insights, career guides, and learning resources for technology professionals.',
    url: 'https://anywheredoor.com/resources',
    publisher: {
      '@type': 'Organization',
      name: 'Anywheredoor',
      url: 'https://anywheredoor.com',
    },
    blogPost: blogPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://anywheredoor.com/resources/${post.slug}`,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Anywheredoor',
      },
    })),
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-navy-600 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Learning Resources & Career Guides
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto">
                Expert insights, tutorials, and career guidance to help you succeed in technology
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <OptimizedImage
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.readingTime}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link
                        href={`/resources/${post.slug}`}
                        className="hover:text-teal-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">By {post.author}</span>
                        <span className="text-gray-300">•</span>
                        <time className="text-sm text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}