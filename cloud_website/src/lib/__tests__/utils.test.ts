import { formatPrice, formatDuration, generateSlug, truncateText } from '../utils';

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(299)).toBe('$299.00');
      expect(formatPrice(299.99)).toBe('$299.99');
    });

    it('should handle different currencies', () => {
      expect(formatPrice(299, 'EUR')).toBe('€299.00');
    });
  });

  describe('formatDuration', () => {
    it('should format hours correctly', () => {
      expect(formatDuration(1)).toBe('1 hour');
      expect(formatDuration(2)).toBe('2 hours');
      expect(formatDuration(0.5)).toBe('30 minutes');
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slugs', () => {
      expect(generateSlug('Complete React Developer Bootcamp')).toBe(
        'complete-react-developer-bootcamp'
      );
      expect(generateSlug('Full-Stack JavaScript & Node.js')).toBe(
        'full-stack-javascript-nodejs'
      );
    });
  });

  describe('truncateText', () => {
    it('should truncate text correctly', () => {
      const text = 'This is a long text that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a long text...');
      expect(truncateText('Short text', 20)).toBe('Short text');
    });
  });
});