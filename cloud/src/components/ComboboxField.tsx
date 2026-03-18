'use client';

/**
 * ComboboxField — generic searchable dropdown with inline create
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4
 */

import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface ComboboxFieldProps<T extends { id: string; name: string }> {
  label: string;
  items: T[];
  value: string; // selected id
  onChange: (id: string) => void;
  onCreateNew: (name: string) => Promise<T>;
  isLoading: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function ComboboxField<T extends { id: string; name: string }>({
  label,
  items,
  value,
  onChange,
  onCreateNew,
  isLoading,
  required,
  error,
  placeholder = 'Search or create…',
}: ComboboxFieldProps<T>) {
  const inputId = useId();
  const listboxId = useId();

  // The text shown in the input
  const selectedItem = items.find((i) => i.id === value);
  const [inputValue, setInputValue] = useState(selectedItem?.name ?? '');
  const [open, setOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keep input text in sync when the external value changes
  useEffect(() => {
    const item = items.find((i) => i.id === value);
    setInputValue(item?.name ?? '');
  }, [value, items]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = items.some(
    (i) => i.name.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreateOption = inputValue.trim().length > 0 && !exactMatch;

  const handleSelect = (item: T) => {
    onChange(item.id);
    setInputValue(item.name);
    setOpen(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    const name = inputValue.trim();
    if (!name) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await onCreateNew(name);
      onChange(created.id);
      setInputValue(created.name);
      setOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          value={inputValue}
          placeholder={isLoading ? 'Loading…' : placeholder}
          disabled={isLoading || isCreating}
          className="input-field pr-10"
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            // Clear selection if user edits the text
            if (value) onChange('');
            setCreateError(null);
          }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDownIcon
          className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto text-sm"
        >
          {filtered.length === 0 && !showCreateOption && (
            <li className="px-3 py-2 text-gray-400">No results</li>
          )}

          {filtered.map((item) => (
            <li
              key={item.id}
              role="option"
              aria-selected={item.id === value}
              className={`cursor-pointer px-3 py-2 hover:bg-blue-50 ${
                item.id === value ? 'bg-blue-50 font-medium' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleSelect(item);
              }}
            >
              {item.name}
            </li>
          ))}

          {showCreateOption && (
            <li
              role="option"
              aria-selected={false}
              className="cursor-pointer px-3 py-2 text-blue-600 hover:bg-blue-50 border-t border-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              {isCreating ? 'Creating…' : `Create "${inputValue.trim()}"`}
            </li>
          )}
        </ul>
      )}

      {/* Validation error from parent (e.g. Zod) */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Inline error from create attempt */}
      {createError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {createError}
        </p>
      )}
    </div>
  );
}
