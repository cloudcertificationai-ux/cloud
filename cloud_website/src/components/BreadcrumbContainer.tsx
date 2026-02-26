'use client';

import Breadcrumb from './Breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { BreadcrumbItem } from '@/lib/navigation';

interface BreadcrumbContainerProps {
  courseTitle?: string;
  categoryName?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  includeStructuredData?: boolean;
}

export default function BreadcrumbContainer({
  courseTitle,
  categoryName,
  customBreadcrumbs,
  className = 'mb-6',
  showHome = true,
  includeStructuredData = true
}: BreadcrumbContainerProps) {
  const breadcrumbs = useBreadcrumbs({
    courseTitle,
    categoryName,
    customBreadcrumbs
  });

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Breadcrumb
        items={breadcrumbs}
        showHome={showHome}
        includeStructuredData={includeStructuredData}
      />
    </div>
  );
}