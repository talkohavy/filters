export { Filterer } from './Filterer';

// Export error classes for better error handling
export { FilterError, SchemaValidationError, OperatorError, FieldPathError, ParameterError } from './errors';

// Export validation utilities (optional - for advanced users)
export { validateFilterSchema, validateOperator, validateFieldPath } from './validation';

// Re-export types for convenience
export type { FilterScheme, ApplyFiltersProps, CompareOperators, DataItem } from './types';
