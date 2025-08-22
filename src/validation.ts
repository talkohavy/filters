/**
 * Validation utilities for @talkohavy/filters
 *
 * These utilities provide runtime validation for filter schemas,
 * operators, and parameters to catch errors early and provide
 * meaningful error messages.
 */

import type { FilterScheme, CompareOperators, DataItem } from './types';
import { SchemaValidationError, OperatorError, ParameterError } from './errors';

/**
 * List of all valid comparison operators
 */
const VALID_OPERATORS: CompareOperators[] = [
  'equal',
  'equals',
  'notEqual',
  'softEqual',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'in',
  'startsWith',
  'endsWith',
  'includes',
  'includesCaseInsensitive',
  'regex',
  'custom',
  'isEmptyString',
  'isNull',
  'isNullish',
  'isFalsy',
  'isTruthy',
  'exists',
  'keyExists',
  'applyNot',
];

/**
 * Operators that require custom functions
 */
const OPERATORS_REQUIRING_FUNCTION = ['custom'];

/**
 * Validates a filter schema for structural correctness
 */
export function validateFilterSchema<T extends DataItem = DataItem>(filterScheme: FilterScheme<T>): void {
  if (!Array.isArray(filterScheme)) {
    throw new SchemaValidationError('Filter schema must be an array', {
      received: typeof filterScheme,
      value: filterScheme,
    });
  }

  if (filterScheme.length === 0) {
    // Empty schema is valid - it means no filtering
    return;
  }

  for (let i = 0; i < filterScheme.length; i++) {
    const filter = filterScheme[i];
    validateFilterNode(filter, `filterScheme[${i}]`);
  }
}

/**
 * Validates a single filter node (can be a condition or logical operator)
 */
function validateFilterNode(filter: any, path: string): void {
  if (!filter || typeof filter !== 'object') {
    throw new SchemaValidationError('Filter node must be an object', { path, received: typeof filter, value: filter });
  }

  const hasAND = 'AND' in filter;
  const hasOR = 'OR' in filter;
  const hasFieldName = 'fieldName' in filter;
  const hasOperator = 'operator' in filter;

  // Check for logical operators
  if (hasAND || hasOR) {
    if (hasAND && hasOR) {
      throw new SchemaValidationError('Filter node cannot have both AND and OR operators', { path, filter });
    }

    const logicalOperator = hasAND ? 'AND' : 'OR';
    const nestedFilters = filter[logicalOperator];

    if (!Array.isArray(nestedFilters)) {
      throw new SchemaValidationError(`${logicalOperator} operator must contain an array of filters`, {
        path: `${path}.${logicalOperator}`,
        received: typeof nestedFilters,
        value: nestedFilters,
      });
    }

    if (nestedFilters.length === 0) {
      throw new SchemaValidationError(`${logicalOperator} operator cannot be empty`, {
        path: `${path}.${logicalOperator}`,
      });
    }

    // Recursively validate nested filters
    for (let i = 0; i < nestedFilters.length; i++) {
      validateFilterNode(nestedFilters[i], `${path}.${logicalOperator}[${i}]`);
    }
    return;
  }

  // If not a logical operator, it must be a filter condition
  if (!hasFieldName && !hasOperator) {
    throw new SchemaValidationError(`Filter condition must have 'fieldName' and 'operator' properties`, {
      path,
      filter,
      missing: ['fieldName', 'operator'],
    });
  }

  if (!hasFieldName) {
    throw new SchemaValidationError(`Filter condition must have 'fieldName' property`, {
      path,
      filter,
      missing: ['fieldName'],
    });
  }

  if (!hasOperator) {
    throw new SchemaValidationError(`Filter condition must have 'operator' property`, {
      path,
      filter,
      missing: ['operator'],
    });
  }

  validateFilterCondition(filter, path);
}

/**
 * Validates a filter condition (leaf node with fieldName, operator, value)
 */
function validateFilterCondition(filter: any, path: string): void {
  const { fieldName, operator, value, fn } = filter;

  // Validate fieldName
  if (typeof fieldName !== 'string' || fieldName.trim() === '') {
    throw new SchemaValidationError('Field name must be a non-empty string', {
      path: `${path}.fieldName`,
      received: typeof fieldName,
      value: fieldName,
    });
  }

  // Validate operator
  validateOperator(operator, `${path}.operator`);

  // Validate operator-specific requirements
  validateOperatorRequirements(operator, value, fn, path);
}

/**
 * Validates that an operator is supported
 */
export function validateOperator(operator: any, path = 'operator'): void {
  if (typeof operator !== 'string') {
    throw new OperatorError('Operator must be a string', { path, received: typeof operator, value: operator });
  }

  if (!VALID_OPERATORS.includes(operator as CompareOperators)) {
    throw new OperatorError(`Unknown operator: '${operator}'. Valid operators are: ${VALID_OPERATORS.join(', ')}`, {
      path,
      operator,
      validOperators: VALID_OPERATORS,
      suggestion: findClosestOperator(operator),
    });
  }
}

/**
 * Validates operator-specific requirements (custom functions, etc.)
 */
function validateOperatorRequirements(operator: string, value: any, fn: any, path: string): void {
  // Check if operator requires a custom function
  if (OPERATORS_REQUIRING_FUNCTION.includes(operator)) {
    if (typeof fn !== 'function') {
      throw new ParameterError(`Operator '${operator}' requires a custom function in the 'fn' property`, {
        path,
        operator,
        received: typeof fn,
        value: fn,
      });
    }
  }

  // For keyExists operator, value should be a string (the key name)
  if (operator === 'keyExists') {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ParameterError(`Operator 'keyExists' requires a non-empty string value (the property key to check)`, {
        path,
        operator,
        received: typeof value,
        value,
      });
    }
  }

  // String operators should ideally work with string values
  const stringOperators = ['startsWith', 'endsWith', 'includes', 'includesCaseInsensitive'];
  if (stringOperators.includes(operator) && typeof value !== 'string') {
    // This is a warning, not an error, as the operators might handle non-strings gracefully
    console.warn(
      `Warning: Operator '${operator}' typically expects a string value, but received ${typeof value}. ` +
        `This might cause unexpected behavior. Path: ${path}`,
    );
  }
}

/**
 * Finds the closest valid operator to suggest in error messages
 */
function findClosestOperator(invalidOperator: string): string | undefined {
  const lowercaseInput = invalidOperator.toLowerCase();

  // Simple suggestions based on common mistakes
  const suggestions: Record<string, string> = {
    eq: 'equal',
    equals: 'equal',
    ne: 'notEqual', // We don't have this yet, but it's a common expectation
    neq: 'notEqual',
    notequal: 'notEqual',
    gt: 'gt',
    greater: 'gt',
    greaterthan: 'gt',
    gte: 'gte',
    greaterequal: 'gte',
    lt: 'lt',
    less: 'lt',
    lessthan: 'lt',
    lte: 'lte',
    lessequal: 'lte',
    contains: 'includes',
    has: 'includes',
    startswith: 'startsWith',
    beginswith: 'startsWith',
    endswith: 'endsWith',
    null: 'isNull',
    isnull: 'isNull',
    undefined: 'isNullish',
    isundefined: 'isNullish',
    truthy: 'isTruthy',
    falsy: 'isFalsy',
    empty: 'isEmptyString',
    isempty: 'isEmptyString',
    exists: 'exists',
    exist: 'exists',
  };

  return suggestions[lowercaseInput];
}

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
