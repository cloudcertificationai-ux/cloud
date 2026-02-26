'use client';

/**
 * CurriculumBuilder Component
 * 
 * Drag-and-drop curriculum builder with:
 * - @dnd-kit/core and @dnd-kit/sortable for drag-and-drop
 * - Hierarchical display of modules and lessons (collapsible modules)
 * - Module and lesson CRUD operations (inline forms or modals)
 * - Reorder operations (update order field via API)
 * - Optimistic UI updates with TanStack Query
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  VideoCameraIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { ConfirmDialog } from './ConfirmDialog';
import { LessonEditor } from './LessonEditor';

export interface CurriculumLesson {
  id: string;
  title: string;
  order: number;
  moduleId: string;
  type?: 'video' | 'article' | 'quiz' | 'ar';
  duration?: number;
  videoUrl?: string;
  content?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumBuilderProps {
  courseId: string;
  modules: CurriculumModule[];
  onUpdate?: () => void;
}

interface ReorderUpdate {
  type: 'module' | 'lesson';
  id: string;
  order: number;
  moduleId?: string;
}

/**
 * Get lesson type icon
 */
function getLessonIcon(type?: string) {
  switch (type) {
    case 'video':
      return <VideoCameraIcon className="h-4 w-4" />;
    case 'article':
      return <DocumentTextIcon className="h-4 w-4" />;
    case 'quiz':
      return <QuestionMarkCircleIcon className="h-4 w-4" />;
    case 'ar':
      return <CubeIcon className="h-4 w-4" />;
    default:
      return <DocumentTextIcon className="h-4 w-4" />;
  }
}

/**
 * Sortable Module Item
 */
function SortableModuleItem({
  module,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  module: CurriculumModule;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors">
        {/* Module Header */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-t-lg">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-800"
            aria-label="Drag to reorder module"
          >
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-900"
            aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Module {module.order + 1}: {module.title}
            </h3>
            <p className="text-xs text-gray-500">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddLesson}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add lesson"
              aria-label="Add lesson to module"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit module"
              aria-label="Edit module"
            >
              <PencilIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete module"
              aria-label="Delete module"
            >
              <TrashIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Lessons List */}
        {isExpanded && (
          <div className="p-4 space-y-2">
            {module.lessons.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No lessons yet. Click + to add a lesson.
              </p>
            ) : (
              <SortableContext
                items={module.lessons.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {module.lessons.map((lesson) => (
                  <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={() => onEditLesson(lesson.id)}
                    onDelete={() => onDeleteLesson(lesson.id)}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sortable Lesson Item
 */
function SortableLessonItem({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: CurriculumLesson;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-800"
        aria-label="Drag to reorder lesson"
      >
        <Bars3Icon className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="text-gray-600">{getLessonIcon(lesson.type)}</div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {lesson.order + 1}. {lesson.title}
        </p>
        {lesson.duration && (
          <p className="text-xs text-gray-500">{lesson.duration} min</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          title="Edit lesson"
          aria-label="Edit lesson"
        >
          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Delete lesson"
          aria-label="Delete lesson"
        >
          <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Main CurriculumBuilder Component
 */
export function CurriculumBuilder({
  courseId,
  modules: initialModules,
  onUpdate,
}: CurriculumBuilderProps) {
  const [modules, setModules] = useState<CurriculumModule[]>(initialModules);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialModules.map((m) => m.id))
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'module' | 'lesson';
    id: string;
    title: string;
  } | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [showAddModule, setShowAddModule] = useState(false);
  const [showLessonEditor, setShowLessonEditor] = useState<{
    moduleId: string;
    lessonId?: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Reorder mutation
   */
  const reorderMutation = useMutation({
    mutationFn: async (updates: ReorderUpdate[]) => {
      const response = await fetch(`/api/admin/courses/${courseId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reorder');
      // Revert optimistic update
      setModules(initialModules);
    },
  });

  /**
   * Delete module mutation
   */
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete module');
      }
    },
    onSuccess: () => {
      toast.success('Module deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete module');
    },
  });

  /**
   * Delete lesson mutation
   */
  const deleteLessonMutation = useMutation({
    mutationFn: async ({ moduleId, lessonId }: { moduleId: string; lessonId: string }) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lesson');
      }
    },
    onSuccess: () => {
      toast.success('Lesson deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lesson');
    },
  });

  /**
   * Create module mutation
   */
  const createModuleMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create module');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Module created successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      onUpdate?.();
      setShowAddModule(false);
      setModuleTitle('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create module');
    },
  });

  /**
   * Update module mutation
   */
  const updateModuleMutation = useMutation({
    mutationFn: async ({ moduleId, title }: { moduleId: string; title: string }) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update module');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Module updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      onUpdate?.();
      setEditingModule(null);
      setModuleTitle('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update module');
    },
  });

  /**
   * Create lesson mutation
   */
  const createLessonMutation = useMutation({
    mutationFn: async ({
      moduleId,
      lessonData,
    }: {
      moduleId: string;
      lessonData: any;
    }) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lesson');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Lesson created successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      onUpdate?.();
      setShowLessonEditor(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create lesson');
    },
  });

  /**
   * Update lesson mutation
   */
  const updateLessonMutation = useMutation({
    mutationFn: async ({
      moduleId,
      lessonId,
      lessonData,
    }: {
      moduleId: string;
      lessonId: string;
      lessonData: any;
    }) => {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lesson');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Lesson updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] });
      onUpdate?.();
      setShowLessonEditor(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update lesson');
    },
  });

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      // Check if dragging a module
      const activeModule = modules.find((m) => m.id === active.id);
      const overModule = modules.find((m) => m.id === over.id);

      if (activeModule && overModule) {
        // Reorder modules
        const oldIndex = modules.findIndex((m) => m.id === active.id);
        const newIndex = modules.findIndex((m) => m.id === over.id);

        const newModules = arrayMove(modules, oldIndex, newIndex).map((m, idx) => ({
          ...m,
          order: idx,
        }));

        // Optimistic update
        setModules(newModules);

        // Send to API
        const updates: ReorderUpdate[] = newModules.map((m) => ({
          type: 'module',
          id: m.id,
          order: m.order,
        }));

        reorderMutation.mutate(updates);
      } else {
        // Check if dragging a lesson
        for (const module of modules) {
          const activeLesson = module.lessons.find((l) => l.id === active.id);
          const overLesson = module.lessons.find((l) => l.id === over.id);

          if (activeLesson && overLesson) {
            // Reorder lessons within same module
            const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
            const newIndex = module.lessons.findIndex((l) => l.id === over.id);

            const newLessons = arrayMove(module.lessons, oldIndex, newIndex).map(
              (l, idx) => ({
                ...l,
                order: idx,
              })
            );

            const newModules = modules.map((m) =>
              m.id === module.id ? { ...m, lessons: newLessons } : m
            );

            // Optimistic update
            setModules(newModules);

            // Send to API
            const updates: ReorderUpdate[] = newLessons.map((l) => ({
              type: 'lesson',
              id: l.id,
              order: l.order,
              moduleId: module.id,
            }));

            reorderMutation.mutate(updates);
            break;
          }
        }
      }
    },
    [modules, reorderMutation]
  );

  /**
   * Toggle module expansion
   */
  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'module') {
      deleteModuleMutation.mutate(deleteConfirm.id);
    } else {
      const module = modules.find((m) =>
        m.lessons.some((l) => l.id === deleteConfirm.id)
      );
      if (module) {
        deleteLessonMutation.mutate({
          moduleId: module.id,
          lessonId: deleteConfirm.id,
        });
      }
    }

    setDeleteConfirm(null);
  }, [deleteConfirm, modules, deleteModuleMutation, deleteLessonMutation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Curriculum</h2>
          <p className="text-sm text-gray-600">
            Drag and drop to reorder modules and lessons
          </p>
        </div>
        <button
          onClick={() => setShowAddModule(true)}
          className="btn-primary inline-flex items-center"
          aria-label="Add new module to curriculum"
        >
          <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          Add Module
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModule && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-900 mb-4">New Module</h3>
          <input
            type="text"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Module title"
            className="input-field mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && moduleTitle.trim()) {
                createModuleMutation.mutate(moduleTitle.trim());
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (moduleTitle.trim()) {
                  createModuleMutation.mutate(moduleTitle.trim());
                } else {
                  toast.error('Module title is required');
                }
              }}
              className="btn-primary"
              disabled={createModuleMutation.isPending || !moduleTitle.trim()}
            >
              {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
            </button>
            <button
              onClick={() => {
                setShowAddModule(false);
                setModuleTitle('');
              }}
              className="btn-secondary"
              disabled={createModuleMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Module Form */}
      {editingModule && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Edit Module</h3>
          <input
            type="text"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Module title"
            className="input-field mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && moduleTitle.trim()) {
                updateModuleMutation.mutate({
                  moduleId: editingModule,
                  title: moduleTitle.trim(),
                });
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (moduleTitle.trim()) {
                  updateModuleMutation.mutate({
                    moduleId: editingModule,
                    title: moduleTitle.trim(),
                  });
                } else {
                  toast.error('Module title is required');
                }
              }}
              className="btn-primary"
              disabled={updateModuleMutation.isPending || !moduleTitle.trim()}
            >
              {updateModuleMutation.isPending ? 'Updating...' : 'Update Module'}
            </button>
            <button
              onClick={() => {
                setEditingModule(null);
                setModuleTitle('');
              }}
              className="btn-secondary"
              disabled={updateModuleMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No modules yet</p>
          <button
            onClick={() => setShowAddModule(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add First Module
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((module) => (
              <SortableModuleItem
                key={module.id}
                module={module}
                isExpanded={expandedModules.has(module.id)}
                onToggle={() => toggleModule(module.id)}
                onEdit={() => {
                  const module = modules.find((m) => m.id === module.id);
                  if (module) {
                    setModuleTitle(module.title);
                    setEditingModule(module.id);
                  }
                }}
                onDelete={() =>
                  setDeleteConfirm({
                    type: 'module',
                    id: module.id,
                    title: module.title,
                  })
                }
                onAddLesson={() => {
                  setShowLessonEditor({ moduleId: module.id });
                }}
                onEditLesson={(lessonId) => {
                  setShowLessonEditor({ moduleId: module.id, lessonId });
                }}
                onDeleteLesson={(lessonId) => {
                  const lesson = module.lessons.find((l) => l.id === lessonId);
                  if (lesson) {
                    setDeleteConfirm({
                      type: 'lesson',
                      id: lessonId,
                      title: lesson.title,
                    });
                  }
                }}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-90">
                <p className="text-sm font-medium">Dragging...</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Lesson Editor Modal */}
      {showLessonEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <LessonEditor
                lessonId={showLessonEditor.lessonId}
                moduleId={showLessonEditor.moduleId}
                courseId={courseId}
                initialData={
                  showLessonEditor.lessonId
                    ? (() => {
                        const module = modules.find(
                          (m) => m.id === showLessonEditor.moduleId
                        );
                        const lesson = module?.lessons.find(
                          (l) => l.id === showLessonEditor.lessonId
                        );
                        return lesson
                          ? {
                              title: lesson.title,
                              type: lesson.type || 'video',
                              videoUrl: lesson.videoUrl,
                              duration: lesson.duration,
                              content: lesson.content,
                            }
                          : undefined;
                      })()
                    : undefined
                }
                onSave={async (lessonData) => {
                  if (showLessonEditor.lessonId) {
                    await updateLessonMutation.mutateAsync({
                      moduleId: showLessonEditor.moduleId,
                      lessonId: showLessonEditor.lessonId,
                      lessonData,
                    });
                  } else {
                    await createLessonMutation.mutateAsync({
                      moduleId: showLessonEditor.moduleId,
                      lessonData,
                    });
                  }
                }}
                onCancel={() => setShowLessonEditor(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title={`Delete ${deleteConfirm.type}`}
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          variant="danger"
        />
      )}
    </div>
  );
}
