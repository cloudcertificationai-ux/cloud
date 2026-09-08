'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ViewToggleProps {
  view: 'grid' | 'list';
}

export default function ViewToggle({ view }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = (next: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', next);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center rounded-xl p-1 bg-slate-100">
      <button
        onClick={() => setView('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        className={`p-1.5 rounded-lg transition-all ${
          view === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => setView('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`p-1.5 rounded-lg transition-all ${
          view === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
