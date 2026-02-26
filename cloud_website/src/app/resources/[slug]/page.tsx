import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeftIcon, ClockIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { OptimizedImage, StructuredData } from '@/components';

// Mock blog post data (in production, this would come from a CMS or markdown files)
const blogPosts = {
  'complete-guide-web-development-2024': {
    id: '1',
    title: 'Complete Guide to Learning Web Development in 2024',
    excerpt: 'Everything you need to know to start your web development journey, from HTML basics to advanced frameworks.',
    content: `
# Complete Guide to Learning Web Development in 2024

Web development continues to evolve rapidly, with new frameworks, tools, and best practices emerging regularly. Whether you're a complete beginner or looking to update your skills, this comprehensive guide will help you navigate the web development landscape in 2024.

## Getting Started with the Fundamentals

### HTML: The Foundation
HTML (HyperText Markup Language) remains the backbone of web development. Start with:
- Semantic HTML elements
- Accessibility best practices
- Form handling and validation
- Modern HTML5 features

### CSS: Styling and Layout
Master CSS fundamentals and modern techniques:
- Flexbox and CSS Grid for layouts
- CSS Variables and custom properties
- Responsive design principles
- CSS animations and transitions

### JavaScript: Adding Interactivity
JavaScript is essential for modern web development:
- ES6+ features and syntax
- DOM manipulation
- Asynchronous programming (Promises, async/await)
- Modern JavaScript frameworks

## Modern Development Tools

### Version Control
- Git fundamentals
- GitHub/GitLab workflows
- Branching strategies

### Build Tools and Bundlers
- Webpack, Vite, or Parcel
- Package managers (npm, yarn, pnpm)
- Task runners and automation

## Popular Frameworks and Libraries

### React
React remains one of the most popular choices:
- Component-based architecture
- Hooks and state management
- Next.js for full-stack applications

### Vue.js
Vue offers a gentle learning curve:
- Template syntax
- Composition API
- Nuxt.js for server-side rendering

### Angular
Enterprise-grade framework:
- TypeScript by default
- Dependency injection
- Comprehensive tooling

## Career Opportunities

Web development offers diverse career paths:
- Frontend Developer
- Backend Developer
- Full-Stack Developer
- DevOps Engineer
- Technical Lead

## Learning Resources

### Online Platforms
- Interactive coding platforms
- Video tutorials
- Documentation and guides
- Community forums

### Practice Projects
Build real-world projects to showcase your skills:
- Personal portfolio website
- E-commerce application
- Social media dashboard
- API integration projects

## Conclusion

Web development in 2024 offers exciting opportunities for both newcomers and experienced developers. Focus on building strong fundamentals, stay updated with industry trends, and continuously practice through real-world projects.

Remember, the key to success in web development is consistent practice and staying curious about new technologies and best practices.
    `,
    category: 'Web Development',
    author: 'Sarah Johnson',
    publishedAt: '2024-01-15',
    readingTime: '12 min read',
    image: '/images/blog/web-development-guide.jpg',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Career'],
  },
  // Add more blog posts here...
};

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  // Return the list of valid slugs for static generation
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts[params.slug as keyof typeof blogPosts];
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [post.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts[params.slug as keyof typeof blogPosts];

  if (!post) {
    notFound();
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anywheredoor',
      url: 'https://anywheredoor.com',
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://anywheredoor.com/resources/${params.slug}`,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/resources"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors duration-200"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back to Resources
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-12">
            <div className="mb-6">
              <span className="inline-block bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                {post.author}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                {post.readingTime}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12">
            <OptimizedImage
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}