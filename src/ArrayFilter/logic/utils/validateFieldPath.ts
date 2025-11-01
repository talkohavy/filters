import { ParameterError } from '../../../common/errors';

/**
 * Validates field path format
 */
export function validateFieldPath(fieldName: string): void {
  if (typeof fieldName !== 'string') {
    throw new ParameterError('Field path must be a string', { received: typeof fieldName, value: fieldName });
  }

  if (fieldName.trim() === '') {
    throw new ParameterError('Field path cannot be empty', { value: fieldName });
  }

  // Check for invalid characters or patterns
  if (fieldName.includes('..')) {
    throw new ParameterError('Field path cannot contain consecutive dots (..)', { fieldPath: fieldName });
  }

  if (fieldName.startsWith('.') || fieldName.endsWith('.')) {
    throw new ParameterError('Field path cannot start or end with a dot', { fieldPath: fieldName });
  }
}
