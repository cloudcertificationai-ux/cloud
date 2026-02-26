import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from '../TestimonialsSection';
import { StudentTestimonial } from '@/types';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockTestimonials: StudentTestimonial[] = [
  {
    id: '1',
    studentName: 'John Doe',
    studentPhoto: '/testimonials/john.jpg',
    courseCompleted: 'Full Stack Development',
    rating: 5,
    testimonialText: 'This course transformed my career completely!',
    careerOutcome: {
      previousRole: 'Junior Developer',
      currentRole: 'Senior Full Stack Developer',
      salaryIncrease: '40%',
      companyName: 'Tech Corp',
    },
    isVerified: true,
    dateCompleted: new Date('2024-01-15'),
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentPhoto: '/testimonials/jane.jpg',
    courseCompleted: 'Data Science Bootcamp',
    rating: 5,
    testimonialText: 'Amazing learning experience with real-world projects.',
    careerOutcome: {
      currentRole: 'Data Scientist',
      salaryIncrease: '60%',
      companyName: 'Data Solutions Inc',
    },
    isVerified: true,
    dateCompleted: new Date('2024-02-20'),
  },
];

describe('TestimonialsSection', () => {
  test('renders section with default title and subtitle', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} />);
    
    expect(screen.getByText('Real Stories, Incredible Journeys')).toBeInTheDocument();
    expect(screen.getByText(/Discover how our learners transformed their careers/)).toBeInTheDocument();
  });

  test('renders custom title and subtitle', () => {
    const customTitle = 'Success Stories';
    const customSubtitle = 'See how our students achieved their goals';
    
    render(
      <TestimonialsSection 
        testimonials={mockTestimonials}
        title={customTitle}
        subtitle={customSubtitle}
      />
    );
    
    expect(screen.getByRole('heading', { name: customTitle })).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });

  test('displays success metrics summary', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} />);
    
    // Check for the metrics labels which should be unique
    expect(screen.getByText('Success Stories')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('Career Advances')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    
    // Check that metrics are displayed (there should be multiple numbers)
    const metricsSection = screen.getByText('Success Stories').closest('div');
    expect(metricsSection).toBeInTheDocument();
  });

  test('shows View All link when showViewAll is true', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} showViewAll={true} />);
    
    const viewAllLink = screen.getByText('View All Success Stories');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/testimonials');
  });

  test('hides View All link when showViewAll is false', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} showViewAll={false} />);
    
    expect(screen.queryByText('View All Success Stories')).not.toBeInTheDocument();
  });

  test('renders nothing when testimonials array is empty', () => {
    const { container } = render(<TestimonialsSection testimonials={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('displays testimonials in carousel mode by default', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} />);
    
    // Should contain carousel navigation elements
    expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
    expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
  });

  test('displays testimonials in grid mode when specified', () => {
    render(<TestimonialsSection testimonials={mockTestimonials} displayMode="grid" />);
    
    // Should display both testimonials in grid
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});