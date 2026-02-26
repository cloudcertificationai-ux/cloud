import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch with Anywheredoor',
  description: 'Have questions about our courses? Need career guidance? Contact Anywheredoor today. Our team is ready to help you find the perfect tech course for your goals.',
  keywords: [
    'contact anywheredoor',
    'course inquiry',
    'career guidance',
    'tech education support',
    'student support',
    'course consultation'
  ],
  openGraph: {
    title: 'Contact Anywheredoor - Get Expert Guidance',
    description: 'Get in touch with our team for course recommendations, career guidance, and enrollment support.',
    images: ['/contact-og-image.jpg'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}