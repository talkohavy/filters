import type { FilterScheme } from './types';
import { RelationOperators } from '../common/constants';
import { OperatorError, SchemaValidationError } from '../common/errors';
import { VALID_OPERATORS, type OperatorNames } from '../Operators';

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
    const { fieldName, operator, value } = filter;

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
    this.validateOperatorRequirements(operator, value, path);
  }

  /**
   * Validates a single filter node (can be a condition or logical operator)
   */
  validateFilterNode(filter: any, path: string): void {
    if (!this.getIsObject(filter)) {
      throw new SchemaValidationError('Filter node must be an object', {
        path,
        received: typeof filter,
        value: filter,
      });
    }

    const hasAND = RelationOperators.AND in filter;
    const hasOR = RelationOperators.OR in filter;
    const hasLogicalNOT = RelationOperators.NOT in filter && Array.isArray(filter[RelationOperators.NOT]);
    const hasFieldName = 'fieldName' in filter;
    const hasOperator = 'operator' in filter;

    // Check for logical operators
    if (hasAND || hasOR || hasLogicalNOT) {
      const operatorCount = [hasAND, hasOR, hasLogicalNOT].filter(Boolean).length;
      if (operatorCount > 1) {
        const operators = [
          hasAND && RelationOperators.AND,
          hasOR && RelationOperators.OR,
          hasLogicalNOT && RelationOperators.NOT,
        ].filter(Boolean);
        throw new SchemaValidationError(`Filter node cannot have multiple logical operators: ${operators.join(', ')}`, {
          path,
          filter,
        });
      }

      const logicalOperator = hasAND ? RelationOperators.AND : hasOR ? RelationOperators.OR : RelationOperators.NOT;
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
    if (Array.isArray(filterScheme)) {
      if (filterScheme.length === 0) return; // Empty schema is valid

      filterScheme.forEach((filter, i) => {
        this.validateFilterNode(filter, `filterScheme[${i}]`);
      });
      return;
    }

    if (this.getIsObject(filterScheme)) {
      this.validateFilterNode(filterScheme, 'filterScheme');
      return;
    }

    throw new SchemaValidationError('Filter schema must be either an array or an object', {
      received: typeof filterScheme,
      value: filterScheme,
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
  validateOperatorRequirements(operator: string, value: any, path: string): void {
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

  private getIsObject(value: any) {
    if (typeof value === 'object' && value !== null) return true;

    return false;
  }
}

export const filterValidator = new FilterValidator();
