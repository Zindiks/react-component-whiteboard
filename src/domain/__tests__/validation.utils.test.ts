import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ValidationUtils, ValidationError } from '../schemas/validation.utils';
import { ComponentSchema } from '../schemas/component.schema';

describe('ValidationUtils', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
    email: z.string().email(),
  });

  describe('validate', () => {
    it('should return success for valid data', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      const result = ValidationUtils.validate(testSchema, validData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.message).toBe('Validation successful');
      expect(result.error).toBeUndefined();
    });

    it('should return failure for invalid data', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'invalid-email',
      };

      const result = ValidationUtils.validate(testSchema, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toContain('Validation failed');
      expect(result.message).toBe('Invalid data provided');
    });
  });

  describe('safeParse', () => {
    it('should return parsed data for valid input', () => {
      const validData = {
        name: 'Jane Doe',
        age: 25,
        email: 'jane@example.com',
      };

      const result = ValidationUtils.safeParse(testSchema, validData);
      
      expect(result).toEqual(validData);
    });

    it('should return null for invalid input', () => {
      const invalidData = { name: '', age: -1 };

      const result = ValidationUtils.safeParse(testSchema, invalidData);
      
      expect(result).toBeNull();
    });
  });

  describe('validateArray', () => {
    it('should validate array of valid items', () => {
      const validItems = [
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: 'Jane', age: 25, email: 'jane@example.com' },
      ];

      const result = ValidationUtils.validateArray(testSchema, validItems);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validItems);
      expect(result.message).toBe('Successfully validated 2 items');
    });

    it('should handle array with some invalid items', () => {
      const mixedItems = [
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: '', age: -1, email: 'bad-email' }, // invalid
      ];

      const result = ValidationUtils.validateArray(testSchema, mixedItems);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Item 1:');
      expect(result.message).toBe('1 items failed validation');
    });
  });

  describe('validatePartialUpdate', () => {
    it('should validate partial update data', () => {
      const partialData = { name: 'Updated Name' };

      const result = ValidationUtils.validatePartialUpdate(testSchema, partialData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(partialData);
    });

    it('should reject invalid partial data', () => {
      const invalidPartialData = { age: -10 };

      const result = ValidationUtils.validatePartialUpdate(testSchema, invalidPartialData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('age');
    });
  });

  describe('Component schema validation', () => {
    it('should validate valid component data', () => {
      const validComponent = {
        id: 1,
        x: 100,
        y: 200,
        type: 'rectangle',
        width: 150,
        height: 100,
      };

      const result = ValidationUtils.validate(ComponentSchema, validComponent);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validComponent);
    });

    it('should reject component with invalid type', () => {
      const invalidComponent = {
        id: 1,
        x: 100,
        y: 200,
        type: 'invalid-type',
      };

      const result = ValidationUtils.validate(ComponentSchema, invalidComponent);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('type');
    });

    it('should reject component with negative dimensions', () => {
      const invalidComponent = {
        id: 1,
        x: 100,
        y: 200,
        type: 'rectangle',
        width: -10,
        height: 50,
      };

      const result = ValidationUtils.validate(ComponentSchema, invalidComponent);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('width');
    });

    it('should reject component with invalid URL', () => {
      const invalidComponent = {
        id: 1,
        x: 100,
        y: 200,
        type: 'image',
        imageSrc: 'not-a-url',
      };

      const result = ValidationUtils.validate(ComponentSchema, invalidComponent);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('imageSrc');
    });
  });
});

describe('ValidationError', () => {
  it('should create ValidationError from ZodError', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    try {
      schema.parse({ name: '', age: -1 });
    } catch (zodError) {
      const validationError = ValidationError.fromZodError(zodError as z.ZodError);
      
      expect(validationError).toBeInstanceOf(ValidationError);
      expect(validationError.message).toBe('Validation failed');
      expect(validationError.fieldErrors).toBeDefined();
      expect(Object.keys(validationError.fieldErrors!)).toContain('name');
      expect(Object.keys(validationError.fieldErrors!)).toContain('age');
    }
  });
});