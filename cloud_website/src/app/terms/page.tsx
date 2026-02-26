import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Anywheredoor',
  description: 'Read our terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-navy-800 mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: January 2025
          </p>

          <p className="text-lg text-gray-600 mb-8">
            Welcome to Anywheredoor. These Terms of Service govern your use of our platform and services. 
            By accessing or using our services, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-600 mb-6">
            By creating an account or using our services, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Use of Services</h2>
          <p className="text-gray-600 mb-4">
            You may use our services for lawful purposes only. You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Share your account credentials with others</li>
            <li>Distribute course content without permission</li>
            <li>Use our services for any illegal activities</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of our platform</li>
          </ul>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Course Access and Content</h2>
          <p className="text-gray-600 mb-6">
            Course access is granted for personal, non-commercial use only. All course materials 
            are protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Payment and Refunds</h2>
          <p className="text-gray-600 mb-6">
            Payment is required for course enrollment. We offer a 30-day money-back guarantee 
            for most courses. Refund requests must be submitted within the specified timeframe.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Account Termination</h2>
          <p className="text-gray-600 mb-6">
            We reserve the right to suspend or terminate accounts that violate these terms. 
            You may also delete your account at any time through your account settings.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-6">
            Our services are provided "as is" without warranties of any kind. We shall not be 
            liable for any indirect, incidental, or consequential damages arising from your use of our services.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Changes to Terms</h2>
          <p className="text-gray-600 mb-6">
            We may update these terms from time to time. We will notify you of any material 
            changes by posting the new terms on our website.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Contact Information</h2>
          <p className="text-gray-600">
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@anywheredoor.com" className="text-primary-600 hover:text-primary-700">
              legal@anywheredoor.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}