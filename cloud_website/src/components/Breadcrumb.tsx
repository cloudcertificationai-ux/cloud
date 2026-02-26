import Link from 'next/link';
import { generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from './StructuredData';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  includeStructuredData?: boolean;
  showHome?: boolean;
}

export default function Breadcrumb({ 
  items, 
  className = '', 
  includeStructuredData = true,
  showHome = true 
}: BreadcrumbProps) {
  // Prepare breadcrumb data for structured data
  const breadcrumbData = showHome 
    ? [
        { name: 'Home', url: '/' },
        ...items.map(item => ({
          name: item.label,
          url: item.href || '#'
        }))
      ]
    : items.map(item => ({
        name: item.label,
        url: item.href || '#'
      }));

  const structuredData = includeStructuredData 
    ? generateBreadcrumbStructuredData(breadcrumbData)
    : null;

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      
      <nav 
        aria-label="Breadcrumb navigation" 
        className={`flex items-center space-x-2 text-sm bg-gray-50 px-4 py-3 rounded-lg ${className}`}
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {showHome && (
          <>
            <Link
              href="/"
              className="flex items-center text-navy-600 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span itemProp="name">Home</span>
              <meta itemProp="position" content="1" />
            </Link>
            
            {items.length > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </>
        )}
        
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-2"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-navy-600 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-1 py-0.5"
                itemProp="item"
              >
                <span itemProp="name" className="truncate max-w-xs">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span 
                className={`truncate max-w-xs ${
                  index === items.length - 1 
                    ? 'text-navy-800 font-medium' 
                    : 'text-navy-600'
                }`}
                aria-current={index === items.length - 1 ? 'page' : undefined}
                itemProp="name"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + (showHome ? 2 : 1))} />
          </div>
        ))}
      </nav>
    </>
  );
}