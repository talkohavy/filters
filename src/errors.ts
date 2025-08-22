/**
 * Custom error classes for @talkohavy/filters
 *
 * These error classes provide meaningful error messages and context
 * to help developers debug filtering issues.
 */

/**
 * Base error class for all filter-related errors
 */
export class FilterError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'FilterError';
    this.code = code;
    this.context = context;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FilterError);
    }
  }
}

/**
 * Error thrown when filter schema validation fails
 */
export class SchemaValidationError extends FilterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'SCHEMA_VALIDATION_ERROR', context);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Error thrown when an invalid operator is used
 */
export class OperatorError extends FilterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'OPERATOR_ERROR', context);
    this.name = 'OperatorError';
  }
}

/**
 * Error thrown when field path navigation fails
 */
export class FieldPathError extends FilterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'FIELD_PATH_ERROR', context);
    this.name = 'FieldPathError';
  }
}

/**
 * Error thrown when operator parameters are invalid
 */
export class ParameterError extends FilterError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PARAMETER_ERROR', context);
    this.name = 'ParameterError';
  }
}
