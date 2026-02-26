import { render, screen } from '@testing-library/react';
import AboutPage, { metadata } from '../page';
import { successMetrics, testimonials } from '../../../data/sample-data';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, priority, className, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-priority={priority}
        data-testid="next-image"
        {...props}
      />
    );
  };
});

describe('About Page', () => {
  it('should render the mission statement section', () => {
    render(<AboutPage />);
    
    // Check for mission statement content
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText(/democratize access to high-quality technology education/)).toBeInTheDocument();
    expect(screen.getByText(/bridge the gap between traditional education/)).toBeInTheDocument();
  });

  it('should display success metrics correctly', () => {
    render(<AboutPage />);
    
    // Check for statistics dashboard
    expect(screen.getByText('Our Impact in Numbers')).toBeInTheDocument();
    
    // Check for specific metrics
    expect(screen.getByText(`${successMetrics.totalStudents.toLocaleString()}+`)).toBeInTheDocument();
    expect(screen.getByText(`${successMetrics.jobPlacementRate}%`)).toBeInTheDocument();
    expect(screen.getByText(successMetrics.averageSalaryIncrease)).toBeInTheDocument();
    expect(screen.getByText(successMetrics.averageRating.toString())).toBeInTheDocument();
    
    // Check for metric labels
    expect(screen.getByText('Students Enrolled')).toBeInTheDocument();
    expect(screen.getByText('Job Placement Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg. Salary Increase')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
  });

  it('should display industry partners', () => {
    render(<AboutPage />);
    
    expect(screen.getByText('Trusted by Industry Leaders')).toBeInTheDocument();
    
    // Check that all industry partners are displayed
    successMetrics.industryPartners.forEach(partner => {
      expect(screen.getByText(partner)).toBeInTheDocument();
    });
  });

  it('should display alumni success stories', () => {
    render(<AboutPage />);
    
    expect(screen.getByText('Alumni Success Stories')).toBeInTheDocument();
    
    // Check that testimonials are displayed
    testimonials.forEach(testimonial => {
      expect(screen.getByText(testimonial.studentName)).toBeInTheDocument();
      expect(screen.getByText(`${testimonial.careerOutcome.currentRole} at ${testimonial.careerOutcome.companyName}`)).toBeInTheDocument();
      expect(screen.getByText(`"${testimonial.testimonialText}"`)).toBeInTheDocument();
      expect(screen.getByText(`Course: ${testimonial.courseCompleted}`)).toBeInTheDocument();
      expect(screen.getByText(`+${testimonial.careerOutcome.salaryIncrease} salary increase`)).toBeInTheDocument();
    });
  });

  it('should have proper call-to-action buttons', () => {
    render(<AboutPage />);
    
    // Check for CTA section
    expect(screen.getByText('Ready to Transform Your Career?')).toBeInTheDocument();
    
    // Check for CTA buttons
    const browseCoursesBtns = screen.getAllByText('Browse Courses');
    const contactUsBtns = screen.getAllByText('Contact Us');
    
    expect(browseCoursesBtns.length).toBeGreaterThan(0);
    expect(contactUsBtns.length).toBeGreaterThan(0);
    
    // Check that buttons have proper links
    const browseCourseLinks = screen.getAllByRole('link', { name: /browse courses/i });
    const contactUsLinks = screen.getAllByRole('link', { name: /contact us/i });
    
    expect(browseCourseLinks[0]).toHaveAttribute('href', '/courses');
    expect(contactUsLinks[0]).toHaveAttribute('href', '/contact');
  });

  it('should have proper SEO metadata', () => {
    expect(metadata.title).toBe('About Us - Transforming Careers Through Technology Education');
    expect(metadata.description).toContain('Learn about Anywheredoor\'s mission');
    expect(metadata.keywords).toContain('about anywheredoor');
    expect(metadata.keywords).toContain('online learning platform');
    expect(metadata.openGraph?.title).toBe('About Anywheredoor - Technology Education Platform');
    expect(metadata.openGraph?.description).toContain('Transforming careers through expert-led technology courses');
  });

  it('should display verified testimonials correctly', () => {
    render(<AboutPage />);
    
    // Check for verified badges on testimonials
    const verifiedTestimonials = testimonials.filter(t => t.isVerified);
    const verifiedBadges = screen.getAllByText('Verified');
    
    expect(verifiedBadges.length).toBe(verifiedTestimonials.length);
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<AboutPage />);
    
    // Check for proper heading hierarchy
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toContain('Transforming Careers Through');
    
    const h2Elements = container.querySelectorAll('h2');
    expect(h2Elements.length).toBeGreaterThan(0);
    
    const h3Elements = container.querySelectorAll('h3');
    expect(h3Elements.length).toBeGreaterThan(0);
    
    // Check for proper section structure
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(5); // Hero, Mission, Stats, Partners, Stories, CTA
  });

  it('should render images with proper attributes', () => {
    render(<AboutPage />);
    
    const images = screen.getAllByTestId('next-image');
    expect(images.length).toBeGreaterThan(0);
    
    // Check mission image
    const missionImage = images.find(img => 
      img.getAttribute('alt') === 'Students learning technology skills'
    );
    expect(missionImage).toBeInTheDocument();
    expect(missionImage).toHaveAttribute('src', '/about/mission-image.jpg');
    
    // Check testimonial images
    testimonials.forEach(testimonial => {
      const testimonialImage = images.find(img => 
        img.getAttribute('alt') === testimonial.studentName
      );
      expect(testimonialImage).toBeInTheDocument();
      expect(testimonialImage).toHaveAttribute('src', testimonial.studentPhoto);
    });
  });
});