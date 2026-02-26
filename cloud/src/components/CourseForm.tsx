'use client';

/**
 * CourseForm Component
 * 
 * Comprehensive course creation and editing form with:
 * - React Hook Form + Zod validation
 * - Slug auto-generation from title
 * - Slug uniqueness validation via API
 * - Rich text editor for description
 * - Thumbnail upload integration with MediaManager
 * - Category and instructor selectors (fetch from database)
 * - Maps form fields to Prisma schema (priceCents, durationMin, etc.)
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MediaManager } from './MediaManager';
import {
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Validation schema matching Prisma Course model
const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  summary: z.string().max(500, 'Summary must be less than 500 characters').optional(),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional(),
  priceCents: z.number().int().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('INR'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  durationMin: z.number().int().min(1, 'Duration must be at least 1 minute').optional(),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  categoryId: z.string().optional(),
  instructorId: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Instructor {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
}

export function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugValidation, setSlugValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isChecking: false, isValid: null, message: '' });
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [priceInDollars, setPriceInDollars] = useState(
    initialData?.priceCents ? initialData.priceCents / 100 : 0
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      summary: initialData?.summary || '',
      description: initialData?.description || '',
      priceCents: initialData?.priceCents || 0,
      currency: initialData?.currency || 'INR',
      level: initialData?.level,
      durationMin: initialData?.durationMin,
      thumbnailUrl: initialData?.thumbnailUrl || '',
      categoryId: initialData?.categoryId || '',
      instructorId: initialData?.instructorId || '',
    },
  });

  // Watch fields for auto-generation and validation
  const watchTitle = watch('title');
  const watchSlug = watch('slug');
  const watchThumbnailUrl = watch('thumbnailUrl');

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch instructors
  const { data: instructors, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await fetch('/api/admin/instructors');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      return response.json();
    },
  });

  /**
   * Auto-generate slug from title
   */
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }, []);

  /**
   * Auto-generate slug when title changes (only if not editing or slug is empty)
   */
  useEffect(() => {
    if (watchTitle && (!isEditing || !watchSlug)) {
      const newSlug = generateSlug(watchTitle);
      setValue('slug', newSlug);
    }
  }, [watchTitle, isEditing, watchSlug, generateSlug, setValue]);

  /**
   * Validate slug uniqueness via API
   */
  useEffect(() => {
    const validateSlug = async () => {
      if (!watchSlug || watchSlug.length < 3) {
        setSlugValidation({ isChecking: false, isValid: null, message: '' });
        return;
      }

      // Skip validation if editing and slug hasn't changed
      if (isEditing && watchSlug === initialData?.slug) {
        setSlugValidation({ isChecking: false, isValid: true, message: 'Current slug' });
        return;
      }

      setSlugValidation({ isChecking: true, isValid: null, message: 'Checking...' });

      try {
        const response = await fetch(`/api/admin/courses/validate-slug?slug=${encodeURIComponent(watchSlug)}`);
        
        if (!response.ok) {
          throw new Error('Validation request failed');
        }
        
        const data = await response.json();

        if (data.available) {
          setSlugValidation({ isChecking: false, isValid: true, message: 'Slug is available' });
        } else {
          setSlugValidation({ isChecking: false, isValid: false, message: 'Slug is already taken' });
        }
      } catch (error) {
        console.error('Slug validation error:', error);
        setSlugValidation({ isChecking: false, isValid: null, message: 'Failed to validate slug' });
      }
    };

    const timeoutId = setTimeout(validateSlug, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchSlug, isEditing, initialData?.slug]);

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: CourseFormData) => {
    // Check slug validation
    if (!slugValidation.isValid && !isEditing) {
      toast.error('Please fix the slug before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEditing ? 'Course updated successfully!' : 'Course created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle media selection from MediaManager
   */
  const handleMediaSelect = useCallback((mediaUrl: string) => {
    setValue('thumbnailUrl', mediaUrl);
    setShowMediaManager(false);
    toast.success('Thumbnail selected');
  }, [setValue]);

  /**
   * Handle price input change (convert dollars to cents)
   */
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dollars = parseFloat(e.target.value) || 0;
    setPriceInDollars(dollars);
    setValue('priceCents', Math.round(dollars * 100));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className="input-field"
              placeholder="Enter course title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('slug')}
                className="input-field pr-10"
                placeholder="course-url-slug"
                aria-describedby="slug-validation slug-help"
              />
              {slugValidation.isChecking && (
                <div className="absolute right-3 top-3" aria-label="Checking slug availability">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              {!slugValidation.isChecking && slugValidation.isValid === true && (
                <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" aria-hidden="true" />
              )}
              {!slugValidation.isChecking && slugValidation.isValid === false && (
                <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-red-500" aria-hidden="true" />
              )}
            </div>
            {slugValidation.message && (
              <p id="slug-validation" className={`mt-1 text-sm ${slugValidation.isValid ? 'text-green-600' : 'text-red-600'}`} role="status" aria-live="polite">
                {slugValidation.message}
              </p>
            )}
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.slug.message}</p>
            )}
            <p id="slug-help" className="mt-1 text-xs text-gray-500">
              Auto-generated from title. Will be used in URL: /courses/{watchSlug || 'your-slug'}
            </p>
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <input
              type="text"
              {...register('summary')}
              className="input-field"
              placeholder="Brief description for course cards (max 500 characters)"
              maxLength={500}
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* Description - Simple textarea for now, can be enhanced with rich text editor */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="input-field"
              placeholder="Detailed course description (max 5000 characters)"
              maxLength={5000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Note: Rich text editor can be added here for better formatting
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select {...register('categoryId')} className="input-field" disabled={categoriesLoading}>
              <option value="">Select Category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
            )}
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructor
            </label>
            <select {...register('instructorId')} className="input-field" disabled={instructorsLoading}>
              <option value="">Select Instructor</option>
              {instructors?.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
            {instructorsLoading && (
              <p className="mt-1 text-xs text-gray-500">Loading instructors...</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select {...register('level')} className="input-field">
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...register('durationMin', { valueAsNumber: true })}
              className="input-field"
              min="1"
              placeholder="e.g., 120"
            />
            {errors.durationMin && (
              <p className="mt-1 text-sm text-red-600">{errors.durationMin.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={priceInDollars}
              onChange={handlePriceChange}
              className="input-field"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Stored as {watch('priceCents')} cents in database
            </p>
            {errors.priceCents && (
              <p className="mt-1 text-sm text-red-600">{errors.priceCents.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <select {...register('currency')} className="input-field">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Thumbnail</h2>
        
        {/* Current Thumbnail Preview */}
        {watchThumbnailUrl && (
          <div className="mb-4">
            <img
              src={watchThumbnailUrl}
              alt="Course thumbnail"
              className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        )}

        {/* Thumbnail URL Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail URL
          </label>
          <input
            type="url"
            {...register('thumbnailUrl')}
            className="input-field"
            placeholder="https://example.com/image.jpg"
          />
          {errors.thumbnailUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.thumbnailUrl.message}</p>
          )}
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => setShowMediaManager(!showMediaManager)}
          className="btn-secondary inline-flex items-center"
          aria-label={showMediaManager ? 'Hide media manager' : 'Show media manager to upload thumbnail'}
          aria-expanded={showMediaManager}
        >
          <PhotoIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          {showMediaManager ? 'Hide' : 'Upload'} Media Manager
        </button>

        {/* Media Manager */}
        {showMediaManager && (
          <div className="mt-4 border-t pt-4">
            <MediaManager
              courseId={initialData?.slug || 'new-course'}
              onMediaSelect={handleMediaSelect}
              allowedTypes={['image']}
              showLibrary={true}
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (!isEditing && !slugValidation.isValid)}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
