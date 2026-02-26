import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../page';
import { metadata } from '../layout';

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

describe('Contact Page', () => {
  it('should render the contact form with all required fields', () => {
    render(<ContactPage />);
    
    // Check for form title
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    
    // Check for all form fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interested course/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('should display contact information correctly', () => {
    render(<ContactPage />);
    
    // Check for contact information section
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Our Office')).toBeInTheDocument();
    
    // Check for address using more flexible text matching
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('123 Tech Hub Street') || false;
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('Innovation District') || false;
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('San Francisco, CA 94105') || false;
    })).toBeInTheDocument();
    
    // Check for phone and email
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('hello@anywheredoor.com')).toBeInTheDocument();
    
    // Check for office hours
    expect(screen.getByText('Office Hours')).toBeInTheDocument();
    expect(screen.getByText('Monday - Friday')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 6:00 PM PST')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Try to submit empty form
    await user.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate phone number format when provided', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter invalid phone number
    await user.type(phoneInput, 'invalid-phone');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('should validate message length', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter short message
    await user.type(messageInput, 'short');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Submit empty form to trigger validation
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    
    // Start typing in name field
    await user.type(nameInput, 'John');
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
    await user.type(screen.getByLabelText(/subject/i), 'Course Inquiry');
    await user.type(screen.getByLabelText(/message/i), 'I am interested in learning more about your courses.');
    await user.selectOptions(screen.getByLabelText(/interested course/i), 'web-development');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);
    
    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Message sent successfully! We\'ll get back to you soon.')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Form should be cleared
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByLabelText(/subject/i)).toHaveValue('');
    expect(screen.getByLabelText(/message/i)).toHaveValue('');
  });

  it('should display course options in select dropdown', () => {
    render(<ContactPage />);
    
    const courseSelect = screen.getByLabelText(/interested course/i);
    
    // Check for course options
    expect(screen.getByRole('option', { name: 'Select a course' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web Development' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Data Science' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cybersecurity' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cloud Computing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
  });

  it('should have proper quick links', () => {
    render(<ContactPage />);
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    
    // Check for quick links
    const browseCourseLink = screen.getByRole('link', { name: /browse all courses/i });
    const aboutLink = screen.getByRole('link', { name: /about anywheredoor/i });
    const instructorsLink = screen.getByRole('link', { name: /meet our instructors/i });
    
    expect(browseCourseLink).toHaveAttribute('href', '/courses');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(instructorsLink).toHaveAttribute('href', '/instructors');
  });

  it('should have proper SEO metadata', () => {
    expect(metadata.title).toBe('Contact Us - Get in Touch with Anywheredoor');
    expect(metadata.description).toContain('Have questions about our courses?');
    expect(metadata.keywords).toContain('contact anywheredoor');
    expect(metadata.keywords).toContain('course inquiry');
    expect(metadata.openGraph?.title).toBe('Contact Anywheredoor - Get Expert Guidance');
    expect(metadata.openGraph?.description).toContain('Get in touch with our team');
  });

  it('should have proper semantic HTML structure', () => {
    const { container } = render(<ContactPage />);
    
    // Check for proper heading hierarchy
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toContain('Get in');
    
    const h2Elements = container.querySelectorAll('h2');
    expect(h2Elements.length).toBeGreaterThan(0);
    
    const h3Elements = container.querySelectorAll('h3');
    expect(h3Elements.length).toBeGreaterThan(0);
    
    // Check for form structure
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Check for proper labels
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBeGreaterThan(0);
    
    // Check for required field indicators by looking for labels with asterisks
    const labelsWithAsterisks = Array.from(labels).filter(label => 
      label.textContent?.includes('*')
    );
    expect(labelsWithAsterisks.length).toBeGreaterThan(0);
  });

  it('should handle form submission error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock console.error to avoid error logs in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ContactPage />);
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Course Inquiry');
    await user.type(screen.getByLabelText(/message/i), 'I am interested in learning more about your courses.');
    
    // Mock fetch to simulate error
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);
    
    // Check for loading state first
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('There was an error sending your message. Please try again.')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Restore mocks
    global.fetch = originalFetch;
    consoleSpy.mockRestore();
  });
});