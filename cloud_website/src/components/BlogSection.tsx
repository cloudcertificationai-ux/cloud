'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  author: {
    name: string | null;
    image: string | null;
  };
}

interface BlogSectionProps {
  posts: BlogPost[];
}

const DUMMY_POSTS: BlogPost[] = [
  {
    id: 'dummy-1',
    title: 'How to Advance Your Tech Career in 2026',
    slug: 'advance-tech-career-2026',
    excerpt: 'Discover the essential skills and strategies that will help you climb the career ladder in the tech industry this year.',
    coverImageUrl: null,
    publishedAt: new Date('2026-02-15'),
    author: {
      name: 'Sarah Johnson',
      image: null,
    },
  },
  {
    id: 'dummy-2',
    title: 'Top 10 Programming Languages to Learn',
    slug: 'top-programming-languages',
    excerpt: 'Stay ahead of the curve by mastering these in-demand programming languages that employers are actively seeking.',
    coverImageUrl: null,
    publishedAt: new Date('2026-02-10'),
    author: {
      name: 'Michael Chen',
      image: null,
    },
  },
  {
    id: 'dummy-3',
    title: 'The Future of AI and Machine Learning',
    slug: 'future-ai-machine-learning',
    excerpt: 'Explore the latest trends in AI and ML, and learn how these technologies are reshaping industries worldwide.',
    coverImageUrl: null,
    publishedAt: new Date('2026-02-05'),
    author: {
      name: 'Emily Rodriguez',
      image: null,
    },
  },
  {
    id: 'dummy-4',
    title: 'Mastering Cloud Architecture',
    slug: 'mastering-cloud-architecture',
    excerpt: 'Learn the fundamentals of cloud architecture and how to design scalable, resilient systems.',
    coverImageUrl: null,
    publishedAt: new Date('2026-02-01'),
    author: {
      name: 'David Kim',
      image: null,
    },
  },
  {
    id: 'dummy-5',
    title: 'Cybersecurity Best Practices for 2026',
    slug: 'cybersecurity-best-practices',
    excerpt: 'Protect your applications and data with these essential cybersecurity strategies and tools.',
    coverImageUrl: null,
    publishedAt: new Date('2026-01-28'),
    author: {
      name: 'Lisa Anderson',
      image: null,
    },
  },
  {
    id: 'dummy-6',
    title: 'Building Scalable Web Applications',
    slug: 'building-scalable-web-apps',
    excerpt: 'Discover the patterns and practices for creating web applications that can handle millions of users.',
    coverImageUrl: null,
    publishedAt: new Date('2026-01-25'),
    author: {
      name: 'James Wilson',
      image: null,
    },
  },
  {
    id: 'dummy-7',
    title: 'Data Science Career Roadmap',
    slug: 'data-science-career-roadmap',
    excerpt: 'A comprehensive guide to building a successful career in data science and analytics.',
    coverImageUrl: null,
    publishedAt: new Date('2026-01-20'),
    author: {
      name: 'Maria Garcia',
      image: null,
    },
  },
];

export default function BlogSection({ posts }: BlogSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use real posts if available, otherwise show dummy posts
  const displayPosts = posts.length > 0 ? posts : DUMMY_POSTS;

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [displayPosts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Stay updated with the latest insights, tips, and trends in technology and career development
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Navigation Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-blue-600"
              aria-label="Scroll left"
            >
              <svg
                className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Right Navigation Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-blue-600"
              aria-label="Scroll right"
            >
              <svg
                className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Scrollable Blog Cards */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="flex-shrink-0">
                <article className="w-[280px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                  {/* Cover Image */}
                  <div className="relative h-40 overflow-hidden">
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group-hover:opacity-90 transition-opacity" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                      {post.author.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || 'Author'}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-2 flex items-center justify-center text-white font-semibold text-[10px]">
                          {post.author.name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-xs">
                          {post.author.name || 'Anonymous'}
                        </p>
                        <p className="text-[10px]">
                          {post.publishedAt && format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            View All Articles
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
