'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ContactSupportPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has previously closed the popup
    const hasClosedPopup = localStorage.getItem('contactSupportClosed');
    
    if (!hasClosedPopup) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsClosed(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    localStorage.setItem('contactSupportClosed', 'true');
  };

  if (isClosed) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-r from-[#2c4a7c] to-[#3d5a8f] rounded-lg shadow-2xl max-w-md w-full mx-4 sm:mx-0 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors duration-200 z-10"
          aria-label="Close contact support popup"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 pr-12">
          <div className="mb-4">
            <p className="text-white/90 text-xs uppercase tracking-wider mb-2">
              FOR QUERIES, FEEDBACK OR ASSISTANCE
            </p>
            <h3 className="text-white text-xl font-bold mb-1">
              Contact Croma Campus Learner Support
            </h3>
            <p className="text-white/80 text-sm">
              Best of support with us
            </p>
          </div>

          {/* Contact options */}
          <div className="space-y-3">
            {/* Voice support */}
            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 rounded-full p-2">
                  <PhoneIcon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    FOR VOICE SUPPORT
                  </p>
                  <a
                    href="tel:+919715269942"
                    className="text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors"
                  >
                    +91-971 152 6942
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp support */}
            <div className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 rounded-full p-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    FOR WHATSAPP SUPPORT
                  </p>
                  <a
                    href="https://wa.me/919715269942"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors"
                  >
                    +91-971 152 6942
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
      </div>
    </div>
  );
}
