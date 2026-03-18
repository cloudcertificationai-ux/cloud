import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('renders the footer with logo', () => {
    render(<Footer />);
    
    // Check for logo image
    const logo = screen.getByAltText('Cloud Certification');
    expect(logo).toBeInTheDocument();
  });

  it('displays navigation link sections', () => {
    render(<Footer />);
    
    // Check for section headers
    expect(screen.getByText('TRENDING CERTIFICATION COURSES')).toBeInTheDocument();
    expect(screen.getByText('TRENDING MASTER COURSES')).toBeInTheDocument();
    expect(screen.getByText('COMPANY')).toBeInTheDocument();
    expect(screen.getByText('WORK WITH US')).toBeInTheDocument();
  });

  it('displays certification course links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Cloud Computing Training Program')).toBeInTheDocument();
    expect(screen.getByText('DevOps Training Program')).toBeInTheDocument();
    expect(screen.getByText('Data Science Training Program')).toBeInTheDocument();
  });

  it('displays company links', () => {
    render(<Footer />);
    
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Footer />);
    
    // Check for social media links by aria-label
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
  });

  it('displays ISO certification badge', () => {
    render(<Footer />);
    
    expect(screen.getByText('An ISO 9001:2015 Certified Company')).toBeInTheDocument();
  });

  it('displays payment methods section', () => {
    render(<Footer />);
    
    expect(screen.getByText('WE ACCEPT ONLINE PAYMENTS')).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
