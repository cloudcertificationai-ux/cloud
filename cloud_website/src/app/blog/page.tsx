import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Blog - Latest Articles & Insights | Anywheredoor',
  description: 'Read our latest articles on technology, career development, and learning strategies.',
};

export default async function BlogPage() {
  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true },
    include: {
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
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and stories to help you advance your career
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative h-64 md:h-full">
                    {featuredPost.coverImageUrl ? (
                      <Image
                        src={featuredPost.coverImageUrl}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      {featuredPost.author.image && (
                        <Image
                          src={featuredPost.author.image}
                          alt={featuredPost.author.name || 'Author'}
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {featuredPost.author.name}
                        </p>
                        <p>
                          {featuredPost.publishedAt && format(new Date(featuredPost.publishedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                <div className="relative h-48">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    {post.author.image && (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || 'Author'}
                        width={32}
                        height={32}
                        className="rounded-full mr-2"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.author.name}
                      </p>
                      <p className="text-xs">
                        {post.publishedAt && format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {blogPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600">
              Check back soon for our latest articles and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
