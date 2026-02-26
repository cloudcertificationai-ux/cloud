import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('renders the footer with brand information', () => {
    render(<Footer />);
    
    // Check for brand name
    expect(screen.getByText('Anywheredoor')).toBeInTheDocument();
    
    // Check for brand description
    expect(screen.getByText(/Transform your career with industry-leading online courses/)).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<Footer />);
    
    // Check for contact details
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('support@anywheredoor.com')).toBeInTheDocument();
    expect(screen.getByText('123 Learning Street, Education City, EC 12345')).toBeInTheDocument();
  });

  it('displays organized navigation links', () => {
    render(<Footer />);
    
    // Check for section headers
    expect(screen.getByText('Popular Courses')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    
    // Check for specific links
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('For Business')).toBeInTheDocument();
  });

  it('displays certifications and industry recognition', () => {
    render(<Footer />);
    
    // Check for certifications section
    expect(screen.getByText('Certifications & Industry Recognition')).toBeInTheDocument();
    expect(screen.getByText('Accredited programs with globally recognized standards')).toBeInTheDocument();
    
    // Check for specific certifications
    expect(screen.getByText('ISO 9001:2015')).toBeInTheDocument();
    expect(screen.getByText('Accredited Provider')).toBeInTheDocument();
    expect(screen.getByText('Industry Recognized')).toBeInTheDocument();
  });

  it('displays trust badges', () => {
    render(<Footer />);
    
    // Check for trust badges
    expect(screen.getByText('Money-Back Guarantee')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
    expect(screen.getByText('Verified Reviews')).toBeInTheDocument();
    expect(screen.getByText('Career Support')).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Footer />);
    
    // Check for social media links
    const twitterLink = screen.getByLabelText('Follow us on Twitter');
    const linkedinLink = screen.getByLabelText('Follow us on LinkedIn');
    const githubLink = screen.getByLabelText('Follow us on GitHub');
    const youtubeLink = screen.getByLabelText('Subscribe to our YouTube channel');
    
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/anywheredoor');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/anywheredoor');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/anywheredoor');
    expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/@anywheredoor');
  });

  it('displays copyright and legal links', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    
    // Check for copyright
    expect(screen.getByText(new RegExp(`© ${currentYear} Anywheredoor`))).toBeInTheDocument();
    
    // Check for legal links (using getAllByText since some links appear multiple times)
    expect(screen.getAllByText('Privacy Policy')).toHaveLength(2); // One in Support, one in bottom
    expect(screen.getAllByText('Terms of Service')).toHaveLength(2); // One in Support, one in bottom
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    expect(screen.getAllByText('Accessibility')).toHaveLength(2); // One in Support, one in bottom
  });

  it('has proper accessibility attributes', () => {
    render(<Footer />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText('Anywheredoor Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Follow us on GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Subscribe to our YouTube channel')).toBeInTheDocument();
  });
});