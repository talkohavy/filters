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
export type ExistsFilterChild<T = string> = _BaseFilterChild & {
  /** The comparison operator to use */
  operator: T;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
export type OperatorFilterChild<T = string> = _ValueBasedFilterChild & {
  /** The comparison operator to use */
  operator: T;
};

/**
 * Individual filter condition that compares a field value using an operator
 */
export type CustomPredicateFilterChild = _ValueBasedFilterChild & {
  /** Optional custom comparison function for 'custom' operator */
  fn: (itemValue: unknown, filterValue: unknown) => boolean;
};

export type ChildFilter<T = string> = ExistsFilterChild<T> | OperatorFilterChild<T> | CustomPredicateFilterChild;

/**
 * Logical operator for combining filter conditions with AND logic
 */
export type AndFilter<T = string> = { AND: Array<Filter<T>>; OR?: never; NOT?: never; fieldName?: never };

/**
 * Logical operator for combining filter conditions with OR logic
 */
export type OrFilter<T = string> = { OR: Array<Filter<T>>; AND?: never; NOT?: never; fieldName?: never };

/**
 * Logical operator for negating filter conditions (items in array are combined with AND logic)
 */
export type NotFilter<T = string> = { NOT: Array<Filter<T>>; AND?: never; OR?: never; fieldName?: never };

/**
 * Parent filter node that can contain multiple child conditions or operators
 */
export type Filter<T = string> = ChildFilter<T> | AndFilter | OrFilter | NotFilter;

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
 *   },
 *   {
 *     NOT: [
 *       { fieldName: 'category', value: 'archived', operator: 'equal' }
 *     ]
 *   }
 * ];
 * ```
 */
export type FilterScheme<T = string> = Filter<T> | Array<Filter<T>>;
