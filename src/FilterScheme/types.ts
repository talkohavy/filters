import type { OperatorNames } from '../Operators';

/**
 * Individual filter condition that compares a field value using an operator
 */
type _BaseFilterChild = {
  /** The field name or nested path to filter on (e.g., 'name' or 'user.profile.age') */
  fieldName: string;
  /** Whether to negate the result of this condition */
  NOT?: boolean;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
type _ValueBasedFilterChild = _BaseFilterChild & {
  /** The value to compare against */
  value: unknown;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
export type ExistsFilterChild = _BaseFilterChild & {
  /** The comparison operator to use */
  operator: OperatorNames;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
export type OperatorFilterChild = _ValueBasedFilterChild & {
  /** The comparison operator to use */
  operator: OperatorNames;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
export type CustomPredicateFilterChild = _ValueBasedFilterChild & {
  /** Optional custom comparison function for 'custom' operator */
  fn: (itemValue: unknown, filterValue: unknown) => boolean;
};

export type ChildFilter = ExistsFilterChild | OperatorFilterChild | CustomPredicateFilterChild;

/**
 * Logical operator for combining filter conditions with AND logic
 */
type AndFilter = { AND: Array<RecursiveFilter>; OR?: never; fieldName?: never };

/**
 * Logical operator for combining filter conditions with OR logic
 */
type OrFilter = { OR: Array<RecursiveFilter>; AND?: never; fieldName?: never };

/**
 * Parent filter node that can contain multiple child conditions or operators
 */
type RecursiveFilter = ChildFilter | AndFilter | OrFilter;

/**
 * Main filter schema type - an array of filter conditions and logical groupings
 *
 * @example
 * ```typescript
 * const filterScheme: FilterScheme = [
 *   { fieldName: 'name', value: 'John', operator: 'startsWith' },
 *   { fieldName: 'age', value: 18, operator: 'gte' }
 * ];
 * ```
 *
 * @example Complex filter with logical operators
 * ```typescript
 * const complexFilter: FilterScheme = [
 *   {
 *     OR: [
 *       { fieldName: 'status', value: 'active', operator: 'equal' },
 *       { fieldName: 'priority', value: 'high', operator: 'equal' }
 *     ]
 *   }
 * ];
 * ```
 */
export type FilterScheme = RecursiveFilter | Array<RecursiveFilter>;
