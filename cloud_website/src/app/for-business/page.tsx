'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';
import EnterpriseSolutions from '@/components/EnterpriseSolutions';
import EnterpriseContactModal from '@/components/EnterpriseContactModal';
import { 
  enterpriseSolutions, 
  fortune500Clients, 
  enterpriseCaseStudies 
} from '@/data/sample-data';
import { EnterpriseInquiry } from '@/types';

// Note: This would normally be generated server-side
// export const metadata: Metadata = {
//   title: 'Enterprise Learning Solutions | AnyWhereDoor',
//   description: 'Transform your workforce with enterprise-grade learning solutions trusted by Fortune 500 companies.',
// };

export default function ForBusinessPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [modalRequestType, setModalRequestType] = useState<'demo' | 'consultation' | 'custom_training' | 'platform_access'>('consultation');

  const handleContactClick = () => {
    setModalRequestType('consultation');
    setIsContactModalOpen(true);
  };

  const handleDemoClick = () => {
    setModalRequestType('demo');
    setIsDemoModalOpen(true);
  };

  const handleCustomTrainingClick = () => {
    setModalRequestType('custom_training');
    setIsContactModalOpen(true);
  };

  const handlePlatformAccessClick = () => {
    setModalRequestType('platform_access');
    setIsContactModalOpen(true);
  };

  const handleInquirySubmit = async (inquiry: EnterpriseInquiry) => {
    // In a real application, this would send the inquiry to your backend
    console.log('Enterprise inquiry submitted:', inquiry);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message or redirect
    alert('Thank you for your inquiry! Our enterprise team will contact you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-white">      
      <main>
        <EnterpriseSolutions
          solutions={enterpriseSolutions}
          clientLogos={fortune500Clients}
          caseStudies={enterpriseCaseStudies}
          onContactClick={handleContactClick}
          onDemoClick={handleDemoClick}
        />

        {/* Additional CTA Section */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Choose the option that best fits your organization's needs
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Schedule a Demo</h3>
                <p className="text-gray-600 mb-4">
                  See our platform in action with a personalized demonstration
                </p>
                <button
                  onClick={handleDemoClick}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book Demo
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Custom Training</h3>
                <p className="text-gray-600 mb-4">
                  Request a tailored training program for your specific needs
                </p>
                <button
                  onClick={handleCustomTrainingClick}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Request Training
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Platform Access</h3>
                <p className="text-gray-600 mb-4">
                  Get access to our Learning Hub+ enterprise platform
                </p>
                <button
                  onClick={handlePlatformAccessClick}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Get Access
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Modal */}
      <EnterpriseContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleInquirySubmit}
        requestType={modalRequestType}
      />

      {/* Demo Modal - using the same contact modal but with demo request type */}
      <EnterpriseContactModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSubmit={handleInquirySubmit}
        requestType="demo"
      />
    </div>
  );
}