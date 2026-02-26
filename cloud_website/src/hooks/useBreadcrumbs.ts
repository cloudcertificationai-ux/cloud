'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { generateBreadcrumbs, BreadcrumbItem } from '@/lib/navigation';

interface UseBreadcrumbsOptions {
  courseTitle?: string;
  categoryName?: string;
  customBreadcrumbs?: BreadcrumbItem[];
}

export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const breadcrumbs = useMemo(() => {
    // If custom breadcrumbs are provided, use them
    if (options.customBreadcrumbs) {
      return options.customBreadcrumbs;
    }

    // Handle query parameters for category filtering
    const category = searchParams.get('category');
    let categoryName = options.categoryName;
    
    if (category && !categoryName) {
      // Convert slug to display name
      categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return generateBreadcrumbs(pathname, options.courseTitle, categoryName);
  }, [pathname, searchParams, options.courseTitle, options.categoryName, options.customBreadcrumbs]);

  return breadcrumbs;
}

export default useBreadcrumbs;