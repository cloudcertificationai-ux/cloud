import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Anywheredoor',
  description: 'Read the latest articles about technology, career development, and learning.',
};

const blogPosts = [
  {
    id: '1',
    title: '10 Essential Skills for Modern Web Developers',
    excerpt: 'Discover the key skills that will make you stand out in today\'s competitive tech market.',
    author: 'Sarah Johnson',
    date: '2025-01-20',
    readTime: '5 min read',
    category: 'Web Development',
    image: '/blog/web-dev-skills.jpg'
  },
  {
    id: '2',
    title: 'The Future of Data Science: Trends to Watch in 2025',
    excerpt: 'Explore the emerging trends and technologies shaping the data science landscape.',
    author: 'Dr. Michael Chen',
    date: '2025-01-18',
    readTime: '7 min read',
    category: 'Data Science',
    image: '/blog/data-science-trends.jpg'
  },
  {
    id: '3',
    title: 'Career Transition: From Bootcamp to Senior Developer',
    excerpt: 'A step-by-step guide to advancing your career after completing a coding bootcamp.',
    author: 'Alex Rodriguez',
    date: '2025-01-15',
    readTime: '6 min read',
    category: 'Career',
    image: '/blog/career-transition.jpg'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600">
            Insights, tips, and stories from the world of technology and learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Blog Image</span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs font-medium mr-2">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-navy-800 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            More blog posts coming soon! Stay tuned for the latest insights and updates.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Subscribe to Updates
          </a>
        </div>
      </div>
    </div>
  );
}