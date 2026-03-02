'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlogPostForm = dynamic(() => import('@/components/BlogPostForm'), { ssr: false });

export default function EditBlogPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated' && params?.id) {
      fetchPost();
    }
  }, [status, session, router, params?.id]);

  const fetchPost = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError('Failed to load blog post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/dashboard/blog')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Blog Management
          </button>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600 mt-2">Update your article</p>
        </div>
        <BlogPostForm initialData={post} />
      </div>
    </div>
  );
}
