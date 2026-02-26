import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | Anywheredoor',
  description: 'Get help with your courses, account, and technical issues.',
};

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn how to create an account and enroll in courses',
    icon: '🚀',
    links: [
      { title: 'Creating Your Account', href: '#' },
      { title: 'Enrolling in Courses', href: '#' },
      { title: 'Platform Overview', href: '#' }
    ]
  },
  {
    title: 'Course Access',
    description: 'Troubleshoot course access and playback issues',
    icon: '📚',
    links: [
      { title: 'Video Playback Issues', href: '#' },
      { title: 'Downloading Materials', href: '#' },
      { title: 'Mobile App Access', href: '#' }
    ]
  },
  {
    title: 'Billing & Payments',
    description: 'Manage your subscriptions and payment methods',
    icon: '💳',
    links: [
      { title: 'Payment Methods', href: '#' },
      { title: 'Refund Requests', href: '#' },
      { title: 'Billing History', href: '#' }
    ]
  },
  {
    title: 'Certificates',
    description: 'Information about course certificates and credentials',
    icon: '🏆',
    links: [
      { title: 'Earning Certificates', href: '#' },
      { title: 'Downloading Certificates', href: '#' },
      { title: 'Sharing on LinkedIn', href: '#' }
    ]
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to your questions and get the support you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h2 className="text-xl font-semibold text-navy-800">
                  {category.title}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                {category.description}
              </p>
              <ul className="space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-navy-800 mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is available 24/7 to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}