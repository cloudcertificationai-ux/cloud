'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface BlogEditorProps {
  initialData?: {
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
  };
  onSave: (data: any) => void;
  saving: boolean;
}

export default function BlogEditor({ initialData, onSave, saving }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
  const [coverImageKey, setCoverImageKey] = useState(initialData?.coverImageKey || '');
  const [published, setPublished] = useState(initialData?.published || false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCoverImageUrl(data.url);
        setCoverImageKey(data.key);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !content) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      coverImageKey,
      published,
      featured,
      tags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
    });
  };



  return (
    <form onSubmit={handleSubmit} className="max-w-5xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-start gap-4">
            {coverImageUrl && (
              <div className="relative w-64 h-40 rounded-lg overflow-hidden">
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : coverImageUrl ? 'Change Image' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter blog post title"
            required
          />
        </div>

        {/* Slug */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="blog-post-url"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            URL: /blog/{slug || 'your-slug'}
          </p>
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief summary of the blog post"
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="mb-2 text-sm text-gray-600">
            <p>Supports HTML formatting. Common tags:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;img&gt;
            </code>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter your blog post content using HTML..."
            required
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO Fields */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty to use post title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty to use excerpt"
            />
          </div>
        </div>

        {/* Status Toggles */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
    </form>
  );
}
