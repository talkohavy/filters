import { OperatorError, ParameterError, SchemaValidationError } from '../common/errors';
import type { OperatorNames } from '../Operators/operators';
import { OPERATORS_REQUIRING_FUNCTION, VALID_OPERATORS } from './logic/constants';
import type { FilterScheme } from './types';

export class FilterValidator {
  /**
   * Finds the closest valid operator to suggest in error messages
   */
  findClosestOperator(invalidOperator: string): string | undefined {
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
   * Validates a filter condition (leaf node with fieldName, operator, value)
   */
  validateFilterCondition(filter: any, path: string): void {
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
    this.validateOperator(operator, `${path}.operator`);

    // Validate operator-specific requirements
    this.validateOperatorRequirements(operator, value, fn, path);
  }

  /**
   * Validates a single filter node (can be a condition or logical operator)
   */
  validateFilterNode(filter: any, path: string): void {
    if (!filter || typeof filter !== 'object') {
      throw new SchemaValidationError('Filter node must be an object', {
        path,
        received: typeof filter,
        value: filter,
      });
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
        this.validateFilterNode(nestedFilters[i], `${path}.${logicalOperator}[${i}]`);
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

    this.validateFilterCondition(filter, path);
  }

  /**
   * Validates a filter schema for structural correctness
   */
  validateFilterSchema(filterScheme: FilterScheme): void {
    if (!Array.isArray(filterScheme)) {
      throw new SchemaValidationError('Filter schema must be an array', {
        received: typeof filterScheme,
        value: filterScheme,
      });
    }

    if (filterScheme.length === 0) return; // <--- Empty schema is valid - it means no filtering

    filterScheme.forEach((filter, i) => {
      this.validateFilterNode(filter, `filterScheme[${i}]`);
    });
  }

  /**
   * Validates that an operator is supported
   */
  validateOperator(operator: any, path = 'operator'): void {
    if (typeof operator !== 'string') {
      throw new OperatorError('Operator must be a string', { path, received: typeof operator, value: operator });
    }

    if (!VALID_OPERATORS.includes(operator as OperatorNames)) {
      throw new OperatorError(`Unknown operator: '${operator}'. Valid operators are: ${VALID_OPERATORS.join(', ')}`, {
        path,
        operator,
        validOperators: VALID_OPERATORS,
        suggestion: this.findClosestOperator(operator),
      });
    }
  }

  /**
   * Validates operator-specific requirements (custom functions, etc.)
   */
  validateOperatorRequirements(operator: string, value: any, fn: any, path: string): void {
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
}

export const filterValidator = new FilterValidator();
