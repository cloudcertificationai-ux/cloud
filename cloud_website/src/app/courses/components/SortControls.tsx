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
      <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h5m5-4v12m0 0l-3-3m3 3l3-3" />
      </svg>
      <select
        id="sort"
        value={`${sortBy}-${sortOrder}`}
        onChange={handleSortChange}
        className="text-sm font-semibold text-slate-700 bg-slate-100 border-0 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors hover:bg-slate-200/70"
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
