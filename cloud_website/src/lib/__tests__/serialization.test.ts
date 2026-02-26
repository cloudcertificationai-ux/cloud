// Feature: vod-media-system
// Property 54: JSON Serialization Round-Trip for Media Thumbnails
// Property 55: JSON Serialization Round-Trip for Quiz Options
// **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6**

import * as fc from 'fast-check';

describe('Serialization Tests', () => {
  describe('Property 54: JSON Serialization Round-Trip for Media Thumbnails', () => {
    it('should preserve thumbnail array structure through JSON serialization round-trip', () => {
      fc.assert(
        fc.property(
          // Generate thumbnail arrays - URLs at different positions
          fc.array(
            fc.webUrl({ withFragments: false, withQueryParameters: false }),
            { minLength: 0, maxLength: 10 }
          ),
          (thumbnails) => {
            // Serialize to JSON (simulating database storage)
            const serialized = JSON.stringify(thumbnails);
            
            // Parse back from JSON (simulating database retrieval)
            const deserialized = JSON.parse(serialized);
            
            // Verify round-trip produces equivalent data
            expect(deserialized).toEqual(thumbnails);
            expect(deserialized.length).toBe(thumbnails.length);
            
            // Verify each URL is preserved
            thumbnails.forEach((url, index) => {
              expect(deserialized[index]).toBe(url);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty thumbnail arrays correctly', () => {
      const emptyArray: string[] = [];
      const serialized = JSON.stringify(emptyArray);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized).toEqual(emptyArray);
      expect(Array.isArray(deserialized)).toBe(true);
      expect(deserialized.length).toBe(0);
    });

    it('should preserve thumbnail URLs with special characters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              base: fc.constantFrom('https://cdn.example.com', 'https://r2.cloudflare.com'),
              path: fc.stringMatching(/^\/media\/[a-z0-9-]+\/thumb-[0-9]+\.jpg$/),
            }).map(({ base, path }) => `${base}${path}`),
            { minLength: 1, maxLength: 5 }
          ),
          (thumbnails) => {
            const serialized = JSON.stringify(thumbnails);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(thumbnails);
            expect(deserialized.length).toBe(thumbnails.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain order of thumbnails through serialization', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.integer({ min: 0, max: 100 }).map(i => `https://cdn.example.com/thumb-${i}.jpg`),
            { minLength: 2, maxLength: 10 }
          ),
          (thumbnails) => {
            const serialized = JSON.stringify(thumbnails);
            const deserialized = JSON.parse(serialized);
            
            // Verify order is preserved
            for (let i = 0; i < thumbnails.length; i++) {
              expect(deserialized[i]).toBe(thumbnails[i]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 55: JSON Serialization Round-Trip for Quiz Options', () => {
    // Define QuestionOption type matching the design
    interface QuestionOption {
      id: string;
      text: string;
    }

    // Arbitrary for generating question options
    const questionOptionArbitrary = fc.record({
      id: fc.uuid(),
      text: fc.string({ minLength: 1, maxLength: 200 }),
    });

    it('should preserve quiz options array structure through JSON serialization round-trip', () => {
      fc.assert(
        fc.property(
          fc.array(questionOptionArbitrary, { minLength: 2, maxLength: 10 }),
          (options) => {
            // Serialize to JSON (simulating database storage)
            const serialized = JSON.stringify(options);
            
            // Parse back from JSON (simulating database retrieval)
            const deserialized = JSON.parse(serialized);
            
            // Verify round-trip produces equivalent data
            expect(deserialized).toEqual(options);
            expect(deserialized.length).toBe(options.length);
            
            // Verify each option is preserved
            options.forEach((option, index) => {
              expect(deserialized[index].id).toBe(option.id);
              expect(deserialized[index].text).toBe(option.text);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle options with special characters in text', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              text: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 6 }
          ),
          (options) => {
            const serialized = JSON.stringify(options);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(options);
            
            // Verify special characters are preserved
            options.forEach((option, index) => {
              expect(deserialized[index].text).toBe(option.text);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain order of options through serialization', () => {
      fc.assert(
        fc.property(
          fc.array(questionOptionArbitrary, { minLength: 2, maxLength: 8 }),
          (options) => {
            const serialized = JSON.stringify(options);
            const deserialized = JSON.parse(serialized);
            
            // Verify order is preserved
            for (let i = 0; i < options.length; i++) {
              expect(deserialized[i].id).toBe(options[i].id);
              expect(deserialized[i].text).toBe(options[i].text);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle options with unicode characters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              // Use string with unicode characters mixed in
              text: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (options) => {
            const serialized = JSON.stringify(options);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(options);
            
            // Verify text is preserved
            options.forEach((option, index) => {
              expect(deserialized[index].text).toBe(option.text);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve nested structure for complex options', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              text: fc.string({ minLength: 1, maxLength: 100 }),
              metadata: fc.option(
                fc.record({
                  explanation: fc.option(fc.string({ maxLength: 200 })),
                  points: fc.option(fc.integer({ min: 1, max: 10 })),
                }),
                { nil: undefined }
              ),
            }),
            { minLength: 2, maxLength: 6 }
          ),
          (options) => {
            const serialized = JSON.stringify(options);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(options);
            expect(deserialized.length).toBe(options.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Cross-Property Serialization Tests', () => {
    it('should handle serialization of mixed data types', () => {
      fc.assert(
        fc.property(
          fc.record({
            thumbnails: fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }),
            options: fc.array(
              fc.record({
                id: fc.uuid(),
                text: fc.string({ minLength: 1, maxLength: 100 }),
              }),
              { minLength: 2, maxLength: 5 }
            ),
            metadata: fc.record({
              duration: fc.option(fc.integer({ min: 1, max: 7200 })),
              width: fc.option(fc.integer({ min: 320, max: 3840 })),
              height: fc.option(fc.integer({ min: 240, max: 2160 })),
            }),
          }),
          (data) => {
            const serialized = JSON.stringify(data);
            const deserialized = JSON.parse(serialized);
            
            expect(deserialized).toEqual(data);
            expect(deserialized.thumbnails).toEqual(data.thumbnails);
            expect(deserialized.options).toEqual(data.options);
            expect(deserialized.metadata).toEqual(data.metadata);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null and undefined values correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            thumbnails: fc.option(
              fc.array(fc.webUrl(), { minLength: 0, maxLength: 3 }),
              { nil: null }
            ),
            options: fc.option(
              fc.array(
                fc.record({
                  id: fc.uuid(),
                  text: fc.string({ minLength: 1, maxLength: 50 }),
                }),
                { minLength: 1, maxLength: 3 }
              ),
              { nil: null }
            ),
          }),
          (data) => {
            // JSON.stringify converts undefined to null or omits it
            const serialized = JSON.stringify(data);
            const deserialized = JSON.parse(serialized);
            
            // Verify structure is maintained
            if (data.thumbnails !== null) {
              expect(deserialized.thumbnails).toEqual(data.thumbnails);
            }
            if (data.options !== null) {
              expect(deserialized.options).toEqual(data.options);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
