import {
  Course,
  Instructor,
  CourseCategory,
  CurriculumModule,
  Lesson,
  StudentTestimonial,
  ValidationResult,
} from '@/types';

// Validation utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  // Accept relative URLs (starting with /) or absolute URLs
  if (url.startsWith('/')) {
    return true;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Validate Course data structure
export const validateCourse = (course: Course): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!course.id || typeof course.id !== 'string') {
    errors.push('Course ID is required and must be a string');
  }

  if (!course.title || typeof course.title !== 'string' || course.title.trim().length === 0) {
    errors.push('Course title is required and must be a non-empty string');
  }

  if (!course.slug || !isValidSlug(course.slug)) {
    errors.push('Course slug is required and must be a valid slug format');
  }

  if (!course.shortDescription || typeof course.shortDescription !== 'string') {
    errors.push('Course short description is required');
  }

  if (!course.longDescription || typeof course.longDescription !== 'string') {
    errors.push('Course long description is required');
  }

  // Category validation
  if (!course.category || typeof course.category !== 'object') {
    errors.push('Course category is required');
  } else {
    const categoryValidation = validateCourseCategory(course.category);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors.map(err => `Category: ${err}`));
    }
  }

  // Level validation
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(course.level)) {
    errors.push('Course level must be Beginner, Intermediate, or Advanced');
  }

  // Duration validation
  if (!course.duration || typeof course.duration !== 'object') {
    errors.push('Course duration is required');
  } else {
    if (typeof course.duration.hours !== 'number' || isNaN(course.duration.hours) || course.duration.hours <= 0) {
      errors.push('Course duration hours must be a positive number');
    }
    if (typeof course.duration.weeks !== 'number' || isNaN(course.duration.weeks) || course.duration.weeks <= 0) {
      errors.push('Course duration weeks must be a positive number');
    }
  }

  // Price validation
  if (!course.price || typeof course.price !== 'object') {
    errors.push('Course price is required');
  } else {
    if (typeof course.price.amount !== 'number' || isNaN(course.price.amount) || course.price.amount < 0) {
      errors.push('Course price amount must be a non-negative number');
    }
    if (!course.price.currency || typeof course.price.currency !== 'string') {
      errors.push('Course price currency is required');
    }
    if (course.price.originalPrice !== undefined && 
        (typeof course.price.originalPrice !== 'number' || 
         isNaN(course.price.originalPrice) || 
         course.price.originalPrice <= course.price.amount)) {
      errors.push('Course original price must be greater than current price');
    }
  }

  // Rating validation
  if (!course.rating || typeof course.rating !== 'object') {
    errors.push('Course rating is required');
  } else {
    if (typeof course.rating.average !== 'number' || isNaN(course.rating.average) || course.rating.average < 0 || course.rating.average > 5) {
      errors.push('Course rating average must be between 0 and 5');
    }
    if (typeof course.rating.count !== 'number' || isNaN(course.rating.count) || course.rating.count < 0) {
      errors.push('Course rating count must be a non-negative number');
    }
  }

  // Thumbnail URL validation
  if (!course.thumbnailUrl || !isValidUrl(course.thumbnailUrl)) {
    errors.push('Course thumbnail URL is required and must be a valid URL');
  }

  // Instructor IDs validation
  if (!Array.isArray(course.instructorIds) || course.instructorIds.length === 0) {
    errors.push('Course must have at least one instructor ID');
  }

  // Curriculum validation
  if (!Array.isArray(course.curriculum)) {
    errors.push('Course curriculum must be an array');
  } else {
    course.curriculum.forEach((module, index) => {
      const moduleValidation = validateCurriculumModule(module);
      if (!moduleValidation.isValid) {
        errors.push(...moduleValidation.errors.map(err => `Module ${index + 1}: ${err}`));
      }
    });
  }

  // Tags validation
  if (!Array.isArray(course.tags)) {
    errors.push('Course tags must be an array');
  }

  // Mode validation
  if (!['Live', 'Self-Paced', 'Hybrid'].includes(course.mode)) {
    errors.push('Course mode must be Live, Self-Paced, or Hybrid');
  }

  // Enrollment count validation
  if (typeof course.enrollmentCount !== 'number' || isNaN(course.enrollmentCount) || course.enrollmentCount < 0) {
    errors.push('Course enrollment count must be a non-negative number');
  }

  // Active status validation
  if (typeof course.isActive !== 'boolean') {
    errors.push('Course isActive must be a boolean');
  }

  // Date validation
  if (!(course.createdAt instanceof Date) || isNaN(course.createdAt.getTime())) {
    errors.push('Course createdAt must be a valid Date');
  }

  if (!(course.updatedAt instanceof Date) || isNaN(course.updatedAt.getTime())) {
    errors.push('Course updatedAt must be a valid Date');
  }

  if (course.createdAt instanceof Date && course.updatedAt instanceof Date && 
      course.updatedAt < course.createdAt) {
    errors.push('Course updatedAt must be after createdAt');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate Instructor data structure
export const validateInstructor = (instructor: Instructor): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!instructor.id || typeof instructor.id !== 'string') {
    errors.push('Instructor ID is required and must be a string');
  }

  if (!instructor.name || typeof instructor.name !== 'string' || instructor.name.trim().length === 0) {
    errors.push('Instructor name is required and must be a non-empty string');
  }

  if (!instructor.title || typeof instructor.title !== 'string') {
    errors.push('Instructor title is required');
  }

  if (!instructor.bio || typeof instructor.bio !== 'string') {
    errors.push('Instructor bio is required');
  }

  if (!instructor.profileImageUrl || !isValidUrl(instructor.profileImageUrl)) {
    errors.push('Instructor profile image URL is required and must be a valid URL');
  }

  // Expertise validation
  if (!Array.isArray(instructor.expertise) || instructor.expertise.length === 0) {
    errors.push('Instructor must have at least one expertise area');
  }

  // Experience validation
  if (!instructor.experience || typeof instructor.experience !== 'object') {
    errors.push('Instructor experience is required');
  } else {
    if (typeof instructor.experience.years !== 'number' || 
        isNaN(instructor.experience.years) || 
        instructor.experience.years < 0) {
      errors.push('Instructor experience years must be a non-negative number');
    }
    if (!Array.isArray(instructor.experience.companies)) {
      errors.push('Instructor experience companies must be an array');
    }
  }

  // Social links validation
  if (instructor.socialLinks) {
    if (instructor.socialLinks.linkedin && !isValidUrl(instructor.socialLinks.linkedin)) {
      errors.push('Instructor LinkedIn URL must be a valid URL');
    }
    if (instructor.socialLinks.twitter && !isValidUrl(instructor.socialLinks.twitter)) {
      errors.push('Instructor Twitter URL must be a valid URL');
    }
    if (instructor.socialLinks.github && !isValidUrl(instructor.socialLinks.github)) {
      errors.push('Instructor GitHub URL must be a valid URL');
    }
  }

  // Course IDs validation
  if (!Array.isArray(instructor.courseIds)) {
    errors.push('Instructor course IDs must be an array');
  }

  // Rating validation
  if (!instructor.rating || typeof instructor.rating !== 'object') {
    errors.push('Instructor rating is required');
  } else {
    if (typeof instructor.rating.average !== 'number' || isNaN(instructor.rating.average) || instructor.rating.average < 0 || instructor.rating.average > 5) {
      errors.push('Instructor rating average must be between 0 and 5');
    }
    if (typeof instructor.rating.count !== 'number' || isNaN(instructor.rating.count) || instructor.rating.count < 0) {
      errors.push('Instructor rating count must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate CourseCategory data structure
export const validateCourseCategory = (category: CourseCategory): ValidationResult => {
  const errors: string[] = [];

  if (!category.id || typeof category.id !== 'string') {
    errors.push('Category ID is required and must be a string');
  }

  if (!category.name || typeof category.name !== 'string' || category.name.trim().length === 0) {
    errors.push('Category name is required and must be a non-empty string');
  }

  if (!category.slug || !isValidSlug(category.slug)) {
    errors.push('Category slug is required and must be a valid slug format');
  }

  if (!category.description || typeof category.description !== 'string') {
    errors.push('Category description is required');
  }

  if (!category.color || typeof category.color !== 'string' || !category.color.match(/^#[0-9A-Fa-f]{6}$/)) {
    errors.push('Category color is required and must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate CurriculumModule data structure
export const validateCurriculumModule = (module: CurriculumModule): ValidationResult => {
  const errors: string[] = [];

  if (!module.id || typeof module.id !== 'string') {
    errors.push('Module ID is required and must be a string');
  }

  if (!module.title || typeof module.title !== 'string' || module.title.trim().length === 0) {
    errors.push('Module title is required and must be a non-empty string');
  }

  if (!module.description || typeof module.description !== 'string') {
    errors.push('Module description is required');
  }

  if (typeof module.order !== 'number' || isNaN(module.order) || module.order <= 0) {
    errors.push('Module order must be a positive number');
  }

  if (!Array.isArray(module.lessons)) {
    errors.push('Module lessons must be an array');
  } else {
    module.lessons.forEach((lesson, index) => {
      const lessonValidation = validateLesson(lesson);
      if (!lessonValidation.isValid) {
        errors.push(...lessonValidation.errors.map(err => `Lesson ${index + 1}: ${err}`));
      }
    });
  }

  if (typeof module.estimatedHours !== 'number' || isNaN(module.estimatedHours) || module.estimatedHours <= 0) {
    errors.push('Module estimated hours must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate Lesson data structure
export const validateLesson = (lesson: Lesson): ValidationResult => {
  const errors: string[] = [];

  if (!lesson.id || typeof lesson.id !== 'string') {
    errors.push('Lesson ID is required and must be a string');
  }

  if (!lesson.title || typeof lesson.title !== 'string' || lesson.title.trim().length === 0) {
    errors.push('Lesson title is required and must be a non-empty string');
  }

  if (!['Video', 'Reading', 'Exercise', 'Quiz'].includes(lesson.type)) {
    errors.push('Lesson type must be Video, Reading, Exercise, or Quiz');
  }

  if (typeof lesson.duration !== 'number' || isNaN(lesson.duration) || lesson.duration <= 0) {
    errors.push('Lesson duration must be a positive number');
  }

  if (typeof lesson.isPreview !== 'boolean') {
    errors.push('Lesson isPreview must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate StudentTestimonial data structure
export const validateStudentTestimonial = (testimonial: StudentTestimonial): ValidationResult => {
  const errors: string[] = [];

  if (!testimonial.id || typeof testimonial.id !== 'string') {
    errors.push('Testimonial ID is required and must be a string');
  }

  if (!testimonial.studentName || typeof testimonial.studentName !== 'string' || testimonial.studentName.trim().length === 0) {
    errors.push('Student name is required and must be a non-empty string');
  }

  if (!testimonial.studentPhoto || !isValidUrl(testimonial.studentPhoto)) {
    errors.push('Student photo URL is required and must be a valid URL');
  }

  if (!testimonial.courseCompleted || typeof testimonial.courseCompleted !== 'string') {
    errors.push('Course completed is required');
  }

  if (typeof testimonial.rating !== 'number' || isNaN(testimonial.rating) || testimonial.rating < 1 || testimonial.rating > 5) {
    errors.push('Testimonial rating must be between 1 and 5');
  }

  if (!testimonial.testimonialText || typeof testimonial.testimonialText !== 'string' || testimonial.testimonialText.trim().length === 0) {
    errors.push('Testimonial text is required and must be a non-empty string');
  }

  // Career outcome validation
  if (!testimonial.careerOutcome || typeof testimonial.careerOutcome !== 'object') {
    errors.push('Career outcome is required');
  } else {
    if (!testimonial.careerOutcome.currentRole || typeof testimonial.careerOutcome.currentRole !== 'string') {
      errors.push('Current role is required');
    }
    if (!testimonial.careerOutcome.companyName || typeof testimonial.careerOutcome.companyName !== 'string') {
      errors.push('Company name is required');
    }
  }

  if (typeof testimonial.isVerified !== 'boolean') {
    errors.push('Testimonial isVerified must be a boolean');
  }

  if (!(testimonial.dateCompleted instanceof Date) || isNaN(testimonial.dateCompleted.getTime())) {
    errors.push('Date completed must be a valid Date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Batch validation functions
export const validateCourses = (courses: Course[]): ValidationResult => {
  const errors: string[] = [];
  
  courses.forEach((course, index) => {
    const validation = validateCourse(course);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(err => `Course ${index + 1}: ${err}`));
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateInstructors = (instructors: Instructor[]): ValidationResult => {
  const errors: string[] = [];
  
  instructors.forEach((instructor, index) => {
    const validation = validateInstructor(instructor);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(err => `Instructor ${index + 1}: ${err}`));
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};