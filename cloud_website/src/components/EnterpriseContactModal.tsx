'use client';

import React, { useEffect } from 'react';
import { EnterpriseInquiry } from '@/types';
import EnterpriseContactForm from './EnterpriseContactForm';

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inquiry: EnterpriseInquiry) => void;
  requestType?: 'demo' | 'consultation' | 'custom_training' | 'platform_access';
}

const EnterpriseContactModal: React.FC<EnterpriseContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requestType = 'consultation',
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFormSubmit = async (inquiry: EnterpriseInquiry) => {
    await onSubmit(inquiry);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-lg transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Form */}
        <EnterpriseContactForm
          onSubmit={handleFormSubmit}
          onClose={onClose}
          requestType={requestType}
          className="relative"
        />
      </div>
    </div>
  );
};

export default EnterpriseContactModal;