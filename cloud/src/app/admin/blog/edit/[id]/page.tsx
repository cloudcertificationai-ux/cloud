'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '../../components/BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  published: boolean;
  featured: boolean;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        alert('Blog post not found');
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="text-gray-600 mt-2">Update your blog post</p>
      </div>
      <BlogEditor initialData={post} onSave={handleSave} saving={saving} />
    </div>
  );
}
