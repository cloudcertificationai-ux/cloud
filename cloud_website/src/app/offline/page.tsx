'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTryAgain = () => {
    if (isClient) {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (isClient) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          <div className="text-6xl mb-6">📡</div>
          <p className="text-lg text-gray-600 mb-8">
            It looks like you're not connected to the internet. 
            Some content may not be available right now.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleTryAgain}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            What you can do:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Some cached content may still be available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}