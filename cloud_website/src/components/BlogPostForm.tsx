'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BlogPostFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string | null;
    published: boolean;
    featured: boolean;
    tags: string[];
    metaTitle?: string;
    metaDescription?: string;
  };
}

export default function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(initialData?.coverImageUrl || '');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImageUrl: initialData?.coverImageUrl || '',
    published: initialData?.published || false,
    featured: initialData?.featured || false,
    tags: initialData?.tags?.join(', ') || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload = {
        ...formData,
        tags: tagsArray,
        publishedAt: formData.published ? new Date().toISOString() : null,
      };

      const url = initialData?.id 
        ? `/api/admin/blog/${initialData.id}`
        : '/api/admin/blog';
      
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/dashboard/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter post title"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Slug *
        </label>
        <input
          type="text"
          id="slug"
          required
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="post-url-slug"
        />
        <p className="mt-1 text-sm text-gray-500">URL-friendly version of the title</p>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt *
        </label>
        <textarea
          id="excerpt"
          required
          rows={3}
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief summary of the post"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <textarea
          id="content"
          required
          rows={12}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Write your post content here (Markdown supported)"
        />
      </div>

      {/* Cover Image URL */}
      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          id="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={(e) => {
            setFormData({ ...formData, coverImageUrl: e.target.value });
            setImagePreview(e.target.value);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        {imagePreview && (
          <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Cover preview"
              fill
              className="object-cover"
              onError={() => setImagePreview('')}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="technology, career, learning (comma-separated)"
        />
      </div>

      {/* Meta Title */}
      <div>
        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title (SEO)
        </label>
        <input
          type="text"
          id="metaTitle"
          value={formData.metaTitle}
          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="SEO title (defaults to post title)"
        />
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description (SEO)
        </label>
        <textarea
          id="metaDescription"
          rows={2}
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="SEO description (defaults to excerpt)"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Featured post</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : initialData?.id ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
