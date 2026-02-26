'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getRelatedNavigation, getContextualCTA } from '@/lib/navigation';

interface NavigationFlowProps {
  className?: string;
  showRelated?: boolean;
  showCTA?: boolean;
}

export default function NavigationFlow({ 
  className = '', 
  showRelated = true, 
  showCTA = true 
}: NavigationFlowProps) {
  const pathname = usePathname();
  const relatedNavigation = getRelatedNavigation(pathname);
  const contextualCTA = getContextualCTA(pathname);

  if (!showRelated && !showCTA) return null;

  return (
    <div className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contextual Call-to-Action */}
        {showCTA && (
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Take the Next Step?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={contextualCTA.primary.href}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                {contextualCTA.primary.label}
              </Link>
              {contextualCTA.secondary && (
                <Link
                  href={contextualCTA.secondary.href}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  {contextualCTA.secondary.label}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Related Navigation */}
        {showRelated && relatedNavigation.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              You Might Also Be Interested In
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                  <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {item.label}
                  </h5>
                  {item.description && (
                    <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Learn more</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}