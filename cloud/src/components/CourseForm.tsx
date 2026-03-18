'use client';

/**
 * CourseForm Component
 * Comprehensive course creation and editing form with rich content fields.
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ComboboxField } from './ComboboxField';
import { MediaUploadSection } from './MediaUploadSection';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

// ─── Validation Schema ────────────────────────────────────────────────────────

const handsOnProjectSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  skills: z.array(z.string()),
  duration: z.string().min(1, 'Required'),
});

const caseStudySchema = z.object({
  company: z.string().min(1, 'Required'),
  industry: z.string().min(1, 'Required'),
  challenge: z.string().min(1, 'Required'),
  solution: z.string().min(1, 'Required'),
  outcome: z.string().min(1, 'Required'),
});

const certificationSchema = z.object({
  title: z.string().min(1, 'Required'),
  issuer: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
});

const courseFormSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  summary: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).default('INR'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  durationMin: z.number().int().min(1).optional(),
  language: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  videoUrls: z.array(z.string().url()),
  documentUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  instructorId: z.string().optional(),
  learningOutcomes: z.array(z.string()),
  handsOnProjects: z.array(handsOnProjectSchema),
  caseStudies: z.array(caseStudySchema),
  courseFeatures: z.array(z.string()),
  requirements: z.array(z.string()),
  certifications: z.array(certificationSchema),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export interface CourseFormProps {
  initialData?: Partial<CourseFormData & { videoUrls?: string[]; documentUrl?: string }>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

interface Category { id: string; name: string; slug: string; }
interface Instructor { id: string; name: string; bio?: string; avatar?: string; }

// ─── StringListField helper ───────────────────────────────────────────────────

function StringListField({
  label, placeholder, fields, append, remove, register, fieldName,
}: {
  label: string; placeholder: string; fields: { id: string }[];
  append: (v: string) => void; remove: (i: number) => void;
  register: any; fieldName: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button type="button" onClick={() => append('')} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <PlusIcon className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input {...register(`${fieldName}.${index}`)} className="input-field flex-1" placeholder={placeholder} />
            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-sm text-gray-400 italic">No items yet. Click Add to start.</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CourseForm({ initialData, onSubmit, onCancel, isEditing = false }: CourseFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugValidation, setSlugValidation] = useState<{ isChecking: boolean; isValid: boolean | null; message: string }>
    ({ isChecking: false, isValid: null, message: '' });
  const [priceInDollars, setPriceInDollars] = useState(initialData?.priceCents ? initialData.priceCents / 100 : 0);

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      summary: initialData?.summary || '',
      description: initialData?.description || '',
      priceCents: initialData?.priceCents || 0,
      currency: initialData?.currency || 'INR',
      level: initialData?.level as any,
      durationMin: initialData?.durationMin,
      language: initialData?.language || 'English',
      thumbnailUrl: initialData?.thumbnailUrl || '',
      videoUrls: (initialData as any)?.videoUrls || [],
      documentUrl: (initialData as any)?.documentUrl || '',
      categoryId: initialData?.categoryId || '',
      instructorId: initialData?.instructorId || '',
      learningOutcomes: initialData?.learningOutcomes || [],
      handsOnProjects: initialData?.handsOnProjects || [],
      caseStudies: initialData?.caseStudies || [],
      courseFeatures: initialData?.courseFeatures || [],
      requirements: initialData?.requirements || [],
      certifications: initialData?.certifications || [],
    },
  });

  const watchTitle = watch('title');
  const watchSlug = watch('slug');
  const watchThumbnailUrl = watch('thumbnailUrl');
  const watchVideoUrls = watch('videoUrls');
  const watchDocumentUrl = watch('documentUrl');

  const learningOutcomesArr = useFieldArray({ control, name: 'learningOutcomes' as any });
  const courseFeatureArr = useFieldArray({ control, name: 'courseFeatures' as any });
  const requirementsArr = useFieldArray({ control, name: 'requirements' as any });
  const projectsArr = useFieldArray({ control, name: 'handsOnProjects' });
  const caseStudiesArr = useFieldArray({ control, name: 'caseStudies' });
  const certificationsArr = useFieldArray({ control, name: 'certifications' });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => { const r = await fetch('/api/admin/categories'); if (!r.ok) throw new Error(); return r.json(); },
  });
  const { data: instructors, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: async () => { const r = await fetch('/api/admin/instructors'); if (!r.ok) throw new Error(); return r.json(); },
  });

  const handleCreateCategory = async (name: string): Promise<Category> => {
    const r = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    if (r.status === 409) throw new Error('Category already exists');
    if (!r.ok) throw new Error('Failed to create category');
    const created = await r.json();
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    return created;
  };

  const handleCreateInstructor = async (name: string): Promise<Instructor> => {
    const r = await fetch('/api/admin/instructors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    if (!r.ok) throw new Error('Failed to create instructor');
    const created = await r.json();
    queryClient.invalidateQueries({ queryKey: ['instructors'] });
    return created;
  };

  const generateSlug = useCallback((title: string) =>
    title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''), []);

  useEffect(() => {
    if (watchTitle && (!isEditing || !watchSlug)) setValue('slug', generateSlug(watchTitle));
  }, [watchTitle, isEditing, watchSlug, generateSlug, setValue]);

  useEffect(() => {
    const validate = async () => {
      if (!watchSlug || watchSlug.length < 3) { setSlugValidation({ isChecking: false, isValid: null, message: '' }); return; }
      if (isEditing && watchSlug === initialData?.slug) { setSlugValidation({ isChecking: false, isValid: true, message: 'Current slug' }); return; }
      setSlugValidation({ isChecking: true, isValid: null, message: 'Checking...' });
      try {
        const r = await fetch(`/api/admin/courses/validate-slug?slug=${encodeURIComponent(watchSlug)}`);
        const data = await r.json();
        setSlugValidation({ isChecking: false, isValid: data.available, message: data.available ? 'Slug is available' : 'Slug is already taken' });
      } catch { setSlugValidation({ isChecking: false, isValid: null, message: 'Failed to validate slug' }); }
    };
    const t = setTimeout(validate, 500);
    return () => clearTimeout(t);
  }, [watchSlug, isEditing, initialData?.slug]);

  const handleFormSubmit = async (data: CourseFormData) => {
    if (!slugValidation.isValid && !isEditing) { toast.error('Please fix the slug before submitting'); return; }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(isEditing ? 'Course updated!' : 'Course created!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save course');
    } finally { setIsSubmitting(false); }
  };

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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title <span className="text-red-500">*</span></label>
            <input type="text" {...register('title')} className="input-field" placeholder="Enter course title" />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="text" {...register('slug')} className="input-field pr-10" placeholder="course-url-slug" />
              {slugValidation.isChecking && <div className="absolute right-3 top-3"><div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}
              {!slugValidation.isChecking && slugValidation.isValid === true && <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />}
              {!slugValidation.isChecking && slugValidation.isValid === false && <XCircleIcon className="absolute right-3 top-3 h-5 w-5 text-red-500" />}
            </div>
            {slugValidation.message && <p className={`mt-1 text-sm ${slugValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>{slugValidation.message}</p>}
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Auto-generated from title. URL: /courses/{watchSlug || 'your-slug'}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
            <input type="text" {...register('summary')} className="input-field" placeholder="Brief description for course cards (max 500 chars)" maxLength={500} />
            {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea {...register('description')} rows={6} className="input-field" placeholder="Detailed course description (max 5000 chars)" maxLength={5000} />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <ComboboxField<Category> label="Category" items={categories ?? []} value={field.value ?? ''} onChange={field.onChange}
                onCreateNew={handleCreateCategory} isLoading={categoriesLoading} required error={errors.categoryId?.message} placeholder="Search or create category…" />
            )} />
          </div>

          <div>
            <Controller name="instructorId" control={control} render={({ field }) => (
              <ComboboxField<Instructor> label="Instructor" items={instructors ?? []} value={field.value ?? ''} onChange={field.onChange}
                onCreateNew={handleCreateInstructor} isLoading={instructorsLoading} error={errors.instructorId?.message} placeholder="Search or create instructor…" />
            )} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select {...register('level')} className="input-field">
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input type="number" {...register('durationMin', { valueAsNumber: true })} className="input-field" min="1" placeholder="e.g., 120" />
            {errors.durationMin && <p className="mt-1 text-sm text-red-600">{errors.durationMin.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <input type="text" {...register('language')} className="input-field" placeholder="e.g., English" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
            <input type="number" value={priceInDollars} onChange={handlePriceChange} className="input-field" min="0" step="0.01" placeholder="0.00" />
            <p className="mt-1 text-xs text-gray-500">Stored as {watch('priceCents')} cents</p>
            {errors.priceCents && <p className="mt-1 text-sm text-red-600">{errors.priceCents.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency <span className="text-red-500">*</span></label>
            <select {...register('currency')} className="input-field">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Media</h2>
        <div className="space-y-8">
          <MediaUploadSection label="Thumbnail" mediaType="image" acceptedMimeTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
            currentUrl={watchThumbnailUrl || ''} onUploadComplete={(url) => setValue('thumbnailUrl', url)} onRemove={() => setValue('thumbnailUrl', '')} courseId={initialData?.slug || 'new-course'} />

          {/* Multiple Videos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Course Videos</label>
              <button
                type="button"
                onClick={() => setValue('videoUrls', [...(watchVideoUrls || []), ''])}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="w-4 h-4" /> Add Video
              </button>
            </div>
            <div className="space-y-4">
              {(watchVideoUrls || []).map((url, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <MediaUploadSection
                      label={`Video ${index + 1}`}
                      mediaType="video"
                      acceptedMimeTypes={['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']}
                      currentUrl={url}
                      onUploadComplete={(newUrl) => {
                        const updated = [...(watchVideoUrls || [])];
                        updated[index] = newUrl;
                        setValue('videoUrls', updated);
                      }}
                      onRemove={() => {
                        const updated = (watchVideoUrls || []).filter((_, i) => i !== index);
                        setValue('videoUrls', updated);
                      }}
                      courseId={initialData?.slug || 'new-course'}
                    />
                  </div>
                </div>
              ))}
              {(!watchVideoUrls || watchVideoUrls.length === 0) && (
                <p className="text-sm text-gray-400 italic">No videos yet. Click "Add Video" to start.</p>
              )}
            </div>
          </div>

          <MediaUploadSection label="Course Document" mediaType="pdf" acceptedMimeTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            currentUrl={watchDocumentUrl || ''} onUploadComplete={(url) => setValue('documentUrl', url)} onRemove={() => setValue('documentUrl', '')} courseId={initialData?.slug || 'new-course'} />
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Job-Ready Skills / Learning Outcomes</h2>
        <p className="text-sm text-gray-500 mb-4">Shown as checkmarks under "Job-Ready Skills You'll Master" on the course page.</p>
        <StringListField label="Outcomes" placeholder="e.g., Build portfolio projects that impress hiring managers"
          fields={learningOutcomesArr.fields} append={() => learningOutcomesArr.append('' as any)}
          remove={learningOutcomesArr.remove} register={register} fieldName="learningOutcomes" />
      </div>

      {/* Hands-on Projects */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Hands-on Projects</h2>
        <p className="text-sm text-gray-500 mb-4">Project cards shown in the "Hands-on Projects" section.</p>
        <div className="space-y-6">
          {projectsArr.fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Project {index + 1}</span>
                <button type="button" onClick={() => projectsArr.remove(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Title</label>
                  <input {...register(`handsOnProjects.${index}.title`)} className="input-field" placeholder="E-commerce Platform" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Duration</label>
                  <input {...register(`handsOnProjects.${index}.duration`)} className="input-field" placeholder="2-3 weeks" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <textarea {...register(`handsOnProjects.${index}.description`)} rows={2} className="input-field" placeholder="What students will build..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Skills Applied (comma-separated)</label>
                  <input
                    className="input-field"
                    placeholder="React, Node.js, Database Design"
                    defaultValue={(field as any).skills?.join(', ') || ''}
                    onChange={(e) => setValue(`handsOnProjects.${index}.skills`, e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => projectsArr.append({ title: '', description: '', skills: [], duration: '' })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
            <PlusIcon className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Case Studies */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Real-world Case Studies</h2>
        <p className="text-sm text-gray-500 mb-4">Company case studies shown in the "Real-world Case Studies" section.</p>
        <div className="space-y-6">
          {caseStudiesArr.fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Case Study {index + 1}</span>
                <button type="button" onClick={() => caseStudiesArr.remove(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Company</label>
                  <input {...register(`caseStudies.${index}.company`)} className="input-field" placeholder="TechCorp Solutions" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Industry</label>
                  <input {...register(`caseStudies.${index}.industry`)} className="input-field" placeholder="Enterprise Software" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Challenge</label>
                  <input {...register(`caseStudies.${index}.challenge`)} className="input-field" placeholder="Modernizing legacy systems" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Outcome</label>
                  <input {...register(`caseStudies.${index}.outcome`)} className="input-field" placeholder="40% performance improvement" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Solution</label>
                  <textarea {...register(`caseStudies.${index}.solution`)} rows={2} className="input-field" placeholder="How the challenge was solved..." />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => caseStudiesArr.append({ company: '', industry: '', challenge: '', solution: '', outcome: '' })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
            <PlusIcon className="w-4 h-4" /> Add Case Study
          </button>
        </div>
      </div>

      {/* Features & Requirements */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Features & Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StringListField label="Course Features" placeholder="e.g., Lifetime access to course materials"
            fields={courseFeatureArr.fields} append={() => courseFeatureArr.append('' as any)}
            remove={courseFeatureArr.remove} register={register} fieldName="courseFeatures" />
          <StringListField label="Requirements" placeholder="e.g., Basic computer skills"
            fields={requirementsArr.fields} append={() => requirementsArr.append('' as any)}
            remove={requirementsArr.remove} register={register} fieldName="requirements" />
        </div>
      </div>

      {/* Certifications */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Certifications</h2>
        <p className="text-sm text-gray-500 mb-4">Certificates awarded upon course completion.</p>
        <div className="space-y-6">
          {certificationsArr.fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Certificate {index + 1}</span>
                <button type="button" onClick={() => certificationsArr.remove(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Certificate Title</label>
                  <input {...register(`certifications.${index}.title`)} className="input-field" placeholder="React Developer Certificate" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Issuer</label>
                  <input {...register(`certifications.${index}.issuer`)} className="input-field" placeholder="Anywheredoor Academy" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <input {...register(`certifications.${index}.description`)} className="input-field" placeholder="Comprehensive certification covering..." />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => certificationsArr.append({ title: '', issuer: '', description: '' })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
            <PlusIcon className="w-4 h-4" /> Add Certificate
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
        <button type="submit" disabled={isSubmitting || (!isEditing && !slugValidation.isValid)} className="btn-primary">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
