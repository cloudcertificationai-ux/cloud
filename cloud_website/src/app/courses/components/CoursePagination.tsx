'use client';

interface CoursePaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CoursePagination({
  currentPage,
  totalPages,
  hasMore,
  searchParams,
}: CoursePaginationProps) {
  const createPageURL = (page: number) => {
    if (typeof window === 'undefined') {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== 'page') {
          params.set(key, Array.isArray(value) ? value[0] : value);
        }
      });
      params.set('page', page.toString());
      return `?${params.toString()}`;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    return url.toString();
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const NavBtn = ({ href, disabled, children, label }: { href: string; disabled: boolean; children: React.ReactNode; label: string }) =>
    disabled ? (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-300 cursor-not-allowed" aria-hidden>
        {children}
      </span>
    ) : (
      <a
        href={href}
        aria-label={label}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        {children}
      </a>
    );

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4">
      <p className="text-sm text-slate-500 order-2 sm:order-1">
        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <NavBtn href={createPageURL(currentPage - 1)} disabled={currentPage <= 1} label="Previous page">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </NavBtn>

        {visiblePages.map((page, index) =>
          page === '...' ? (
            <span key={`dots-${index}`} className="w-9 h-9 inline-flex items-center justify-center text-sm text-slate-400">
              ···
            </span>
          ) : (
            <a
              key={page}
              href={createPageURL(page as number)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                page === currentPage
                  ? 'text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              style={page === currentPage ? { background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' } : undefined}
            >
              {page}
            </a>
          )
        )}

        <NavBtn href={createPageURL(currentPage + 1)} disabled={!hasMore} label="Next page">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </NavBtn>
      </div>
    </nav>
  );
}
