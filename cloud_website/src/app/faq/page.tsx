import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Anywheredoor',
  description: 'Find answers to common questions about our courses, pricing, and learning platform.',
};

const faqs = [
  {
    question: 'How do I enroll in a course?',
    answer: 'You can enroll in any course by clicking the "Enroll Now" button on the course page. You\'ll need to create an account and complete the payment process.'
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a 30-day money-back guarantee for all courses. If you\'re not satisfied, contact us within 30 days of enrollment for a full refund.'
  },
  {
    question: 'Are the courses self-paced or instructor-led?',
    answer: 'We offer both self-paced and live instructor-led courses. Check the course details to see which format is available.'
  },
  {
    question: 'Do I get a certificate upon completion?',
    answer: 'Yes, you\'ll receive a certificate of completion for each course you finish. Our certificates are recognized by industry leaders.'
  },
  {
    question: 'Can I access courses on mobile devices?',
    answer: 'Absolutely! Our platform is fully responsive and works on all devices including smartphones and tablets.'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-navy-800 mb-8">
          Frequently Asked Questions
        </h1>
        
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-navy-800 mb-3">
                {faq.question}
              </h2>
              <p className="text-gray-600">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-navy-800 mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}