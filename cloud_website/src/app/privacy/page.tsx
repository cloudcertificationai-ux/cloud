import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Anywheredoor',
  description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-navy-800 mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: January 2025
          </p>

          <p className="text-lg text-gray-600 mb-8">
            At Anywheredoor, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            enroll in courses, or contact us for support.
          </p>

          <h3 className="text-xl font-semibold text-navy-800 mt-6 mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Course progress and completion data</li>
            <li>Communications with our support team</li>
          </ul>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Provide and maintain our services</li>
            <li>Process payments and transactions</li>
            <li>Send you course updates and communications</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-600 mb-6">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Data Security</h2>
          <p className="text-gray-600 mb-6">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@anywheredoor.com" className="text-primary-600 hover:text-primary-700">
              privacy@anywheredoor.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}