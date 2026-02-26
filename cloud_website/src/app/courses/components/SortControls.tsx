'use client';

import { useFilterState } from '@/hooks/useFilterState';

export default function SortControls() {
  const { sortBy, sortOrder, setSorting } = useFilterState();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSorting(newSortBy, newSortOrder as 'asc' | 'desc');
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort"
        value={`${sortBy}-${sortOrder}`}
        onChange={handleSortChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="relevance-desc">Relevance</option>
        <option value="rating-desc">Highest Rated</option>
        <option value="rating-asc">Lowest Rated</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="duration-asc">Duration: Short to Long</option>
        <option value="duration-desc">Duration: Long to Short</option>
        <option value="popularity-desc">Most Popular</option>
        <option value="popularity-asc">Least Popular</option>
      </select>
    </div>
  );
}