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

export type LeafFilter<T = string> = ExistsFilterChild<T> | OperatorFilterChild<T> | CustomPredicateFilterChild;

/**
 * Utility type to exclude all keys from _ValueBasedFilterChild
 */
type LeafFilterKeys = Omit<OperatorFilterChild, 'NOT'>;
type OrFilterKeys<T = string> = { OR: Array<Filter<T>> };
type NotFilterKeys<T = string> = { NOT: Array<Filter<T>> };

type ExcludeLeafFilterKeys<T> = T & {
  [K in keyof LeafFilterKeys]?: never;
};
type ExcludeOrFilterKeys<T> = T & {
  [K in keyof OrFilterKeys]?: never;
};
type ExcludeNotFilterKeys<T> = T & {
  [K in keyof NotFilterKeys]?: never;
};

/**
 * AND excludes OR, NOT & Leaf filter keys
 */
export type AndFilter<T = string> = ExcludeLeafFilterKeys<
  ExcludeOrFilterKeys<ExcludeNotFilterKeys<{ AND: Array<Filter<T>> }>>
>;

/**
 * OR excludes NOT & Leaf filter keys
 *
 * AND already excludes it.
 */
export type OrFilter<T = string> = ExcludeLeafFilterKeys<ExcludeNotFilterKeys<{ OR: Array<Filter<T>> }>>;

/**
 * NOT excludes Leaf filter keys
 *
 * AND & OR already exclude it.
 */
export type NotFilter<T = string> = ExcludeLeafFilterKeys<{ NOT: Array<Filter<T>> }>;

/**
 * Parent filter node that can contain multiple child conditions or operators
 */
type Filter<T = string> = LeafFilter<T> | AndFilter | OrFilter | NotFilter;

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
