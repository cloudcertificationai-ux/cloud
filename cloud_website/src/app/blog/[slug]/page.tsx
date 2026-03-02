import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { format } from 'date-fns';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  });

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        {post.coverImageUrl ? (
          <>
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        
        <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <div className="mb-4">
            <Link
              href="/blog"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center text-white/90">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name || 'Author'}
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
            )}
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-white/70">
                {post.publishedAt && format(new Date(post.publishedAt), 'MMMM dd, yyyy')} · {post.views} views
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-48">
                      {relatedPost.coverImageUrl ? (
                        <Image
                          src={relatedPost.coverImageUrl}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
