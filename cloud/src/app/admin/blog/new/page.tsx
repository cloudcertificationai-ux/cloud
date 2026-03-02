'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '../components/BlogEditor';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="text-gray-600 mt-2">Write and publish a new blog post</p>
      </div>
      <BlogEditor onSave={handleSave} saving={saving} />
    </div>
  );
}
