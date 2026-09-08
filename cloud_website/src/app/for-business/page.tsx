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
//   title: 'Enterprise Learning Solutions | Cloud Certification',
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
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <main>
        <EnterpriseSolutions
          solutions={enterpriseSolutions}
          clientLogos={fortune500Clients}
          caseStudies={enterpriseCaseStudies}
          onContactClick={handleContactClick}
          onDemoClick={handleDemoClick}
        />

        {/* Additional CTA Section — SaaS dashboard action cards */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1d4ed8' }}>Get started</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold mt-2" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Choose the option that fits your team
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="flex flex-col bg-white rounded-3xl p-7" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5" style={{ background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.16)' }}>🖥️</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Schedule a Demo</h3>
                <p className="text-sm mb-6 flex-1" style={{ color: '#64748b' }}>
                  See our platform in action with a personalized demonstration tailored to your organization.
                </p>
                <button
                  onClick={handleDemoClick}
                  className="w-full text-white text-sm font-bold py-3 rounded-xl transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
                >
                  Book Demo
                </button>
              </div>

              <div className="flex flex-col bg-white rounded-3xl p-7" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.16)' }}>🎓</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Custom Training</h3>
                <p className="text-sm mb-6 flex-1" style={{ color: '#64748b' }}>
                  Request a tailored training program built around your team&rsquo;s specific skill gaps.
                </p>
                <button
                  onClick={handleCustomTrainingClick}
                  className="w-full text-white text-sm font-bold py-3 rounded-xl transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg,#10b981,#0ea5e9)' }}
                >
                  Request Training
                </button>
              </div>

              <div className="flex flex-col bg-white rounded-3xl p-7" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.16)' }}>🏢</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Platform Access</h3>
                <p className="text-sm mb-6 flex-1" style={{ color: '#64748b' }}>
                  Get access to our Learning Hub+ enterprise platform with dedicated support.
                </p>
                <button
                  onClick={handlePlatformAccessClick}
                  className="w-full text-white text-sm font-bold py-3 rounded-xl transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(90deg,#7c3aed,#1d4ed8)' }}
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