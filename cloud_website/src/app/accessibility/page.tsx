import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Anywheredoor',
  description: 'Our commitment to making online learning accessible to everyone.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-navy-800 mb-8">
          Accessibility Statement
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            At Anywheredoor, we are committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Our Commitment</h2>
          <p className="text-gray-600 mb-6">
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
            These guidelines explain how to make web content accessible to people with a wide array of disabilities.
          </p>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Accessibility Features</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Keyboard navigation support</li>
            <li>Screen reader compatibility</li>
            <li>High contrast color schemes</li>
            <li>Scalable text and images</li>
            <li>Alternative text for images</li>
            <li>Descriptive link text</li>
          </ul>

          <h2 className="text-2xl font-semibold text-navy-800 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you encounter any accessibility barriers or have suggestions for improvement, 
            please contact us at{' '}
            <a href="mailto:accessibility@anywheredoor.com" className="text-primary-600 hover:text-primary-700">
              accessibility@anywheredoor.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}