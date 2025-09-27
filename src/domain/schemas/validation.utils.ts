import { z } from 'zod';
import { OperationResult } from './whiteboard.schema';

/**
 * Validation utility class for handling Zod schema validations
 * with consistent error handling and result formatting
 */
export class ValidationUtils {
  /**
   * Safely validate data against a Zod schema
   * @param schema - The Zod schema to validate against
   * @param data - The data to validate
   * @returns ValidationResult with success/failure information
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): OperationResult & { data?: T } {
    try {
      const result = schema.parse(data);
      return {
        success: true,
        data: result,
        message: 'Validation successful',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(
          (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
        );
        return {
          success: false,
          error: `Validation failed: ${errorMessages.join(', ')}`,
          message: 'Invalid data provided',
        };
      }
      return {
        success: false,
        error: 'Unknown validation error',
        message: 'Validation failed due to unexpected error',
      };
    }
  }

  /**
   * Safely parse data against a Zod schema, returning null on failure
   * @param schema - The Zod schema to validate against
   * @param data - The data to validate
   * @returns Parsed data or null if validation fails
   */
  static safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
  }

  /**
   * Validate and transform data with a custom error handler
   * @param schema - The Zod schema to validate against
   * @param data - The data to validate
   * @param onError - Custom error handler function
   * @returns Parsed data or result of error handler
   */
  static validateWithHandler<T, E>(
    schema: z.ZodSchema<T>,
    data: unknown,
    onError: (error: z.ZodError) => E
  ): T | E {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return onError(error);
      }
      throw error;
    }
  }

  /**
   * Create a validation middleware function for use in API routes or similar
   * @param schema - The Zod schema to validate against
   * @returns Validation middleware function
   */
  static createValidator<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): T => {
      return schema.parse(data);
    };
  }

  /**
   * Validate an array of items against a schema
   * @param schema - The Zod schema for individual items
   * @param items - Array of items to validate
   * @returns OperationResult with validated items or error information
   */
  static validateArray<T>(
    schema: z.ZodSchema<T>,
    items: unknown[]
  ): OperationResult & { data?: T[] } {
    try {
      const validatedItems: T[] = [];
      const errors: string[] = [];

      items.forEach((item, index) => {
        try {
          validatedItems.push(schema.parse(item));
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(`Item ${index}: ${error.issues[0]?.message || 'Invalid'}`);
          } else {
            errors.push(`Item ${index}: Unknown error`);
          }
        }
      });

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          message: `${errors.length} items failed validation`,
        };
      }

      return {
        success: true,
        data: validatedItems,
        message: `Successfully validated ${validatedItems.length} items`,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to validate array',
        message: 'Array validation failed',
      };
    }
  }

  /**
   * Create a type-safe partial update validator
   * @param baseSchema - The base schema for the entity
   * @param data - The partial update data
   * @returns Validated partial data
   */
  static validatePartialUpdate<T extends Record<string, unknown>>(
    baseSchema: z.ZodObject<z.ZodRawShape>,
    data: Partial<T>
  ): OperationResult & { data?: Partial<T> } {
    // Create a partial version of the schema
    const partialSchema = baseSchema.partial();
    return this.validate(partialSchema, data);
  }
}

/**
 * Decorator for automatic validation of method parameters
 * @param schema - The Zod schema to validate against
 * @returns Method decorator
 */
export function ValidateInput<T>(schema: z.ZodSchema<T>) {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    _target: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]) {
      // Validate the first argument (assuming it's the data to validate)
      if (args.length > 0) {
        const validationResult = ValidationUtils.validate(schema, args[0]);
        if (!validationResult.success) {
          throw new Error(validationResult.error || 'Validation failed');
        }
        args[0] = validationResult.data;
      }

      return method.apply(this, args);
    };
  };
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: z.ZodError,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  static fromZodError(zodError: z.ZodError): ValidationError {
    const fieldErrors: Record<string, string> = {};
    
    zodError.issues.forEach((error: z.ZodIssue) => {
      const path = error.path.join('.');
      fieldErrors[path] = error.message;
    });

    return new ValidationError(
      'Validation failed',
      zodError,
      fieldErrors
    );
  }
}