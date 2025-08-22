/**
 * Type definitions for @talkohavy/filters
 *
 * This package provides intuitive filtering capabilities for JavaScript/TypeScript applications.
 * It supports complex filtering logic with nested conditions, logical operators (AND/OR),
 * and various comparison operators.
 */

import type { RelationOperators } from './constants';

/**
 * Generic data item type - represents any object or array that can be filtered
 */
export type DataItem = Record<string, unknown> | unknown[];

/**
 * Logical operator for combining filter conditions with AND logic
 */
type AndOperator<T extends DataItem = DataItem> = { AND?: FilterParent<T> };

/**
 * Logical operator for combining filter conditions with OR logic
 */
type OrOperator<T extends DataItem = DataItem> = { OR?: FilterParent<T> };

/**
 * Parent filter node that can contain multiple child conditions or operators
 */
type FilterParent<T extends DataItem = DataItem> = Array<FilterChild | AndOperator<T> | OrOperator<T>>;

/**
 * Individual filter condition that compares a field value using an operator
 */
type FilterChild = {
  /** The field name or nested path to filter on (e.g., 'name' or 'user.profile.age') */
  fieldName: string;
  /** The value to compare against */
  value: unknown;
  /** The comparison operator to use */
  operator: CompareOperators;
  /** @deprecated Legacy field, use fieldName instead */
  key?: string;
  /** Whether to negate the result of this condition */
  NOT?: boolean;
  /** Optional custom comparison function for 'custom' operator */
  fn?: (itemValue: unknown, filterValue: unknown) => boolean;
  /** For 'applyNot' operator: the base operator to negate */
  baseOperator?: CompareOperators;
};

/**
 * All available comparison operators for filtering data
 *
 * **Equality Operators:**
 * - `equal`, `equals`: Strict equality (===)
 * - `notEqual`: Strict inequality (!==)
 * - `softEqual`: Loose equality (==)
 *
 * **Numeric Operators:**
 * - `gt`: Greater than
 * - `gte`: Greater than or equal
 * - `lt`: Less than
 * - `lte`: Less than or equal
 * - `between`: Value is between two bounds (inclusive)
 * - `in`: Value is a member of an array
 *
 * **String Operators:**
 * - `startsWith`: String starts with value
 * - `endsWith`: String ends with value
 * - `includes`: String contains value
 * - `includesCaseInsensitive`: Case-insensitive string contains
 * - `regex`: String matches a regular expression
 *
 * **Special Operators:**
 * - `custom`: Use a custom comparison function
 * - `isEmptyString`: Check if value is empty string
 * - `isNull`: Check if value is null
 * - `isNullish`: Check if value is null or undefined
 * - `isFalsy`: Check if value is falsy
 * - `isTruthy`: Check if value is truthy
 * - `exists`: Alias for isTruthy
 * - `keyExists`: Check if property key exists in object
 * - `applyNot`: Negate any other operator
 */
export type CompareOperators =
  | 'equal'
  | 'equals'
  | 'notEqual'
  | 'softEqual'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'startsWith'
  | 'endsWith'
  | 'includes'
  | 'includesCaseInsensitive'
  | 'regex'
  | 'custom'
  | 'isEmptyString'
  | 'isNull'
  | 'isNullish'
  | 'isFalsy'
  | 'isTruthy'
  | 'exists'
  | 'keyExists'
  | 'applyNot';

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
export type FilterScheme<T extends DataItem = DataItem> = Array<FilterParent<T> | FilterChild>;

/**
 * Options for the applyFilters method
 */
export type ApplyFiltersProps<T extends DataItem = DataItem> = {
  /** Array of data items to filter */
  data: Array<T>;
};

/**
 * Options for changing the filter schema
 */
export type ChangeSchemaProps<T extends DataItem = DataItem> = {
  /** New filter schema to apply */
  filterScheme: FilterScheme<T>;
};

/**
 * Internal props for building the filter function
 * @internal
 */
export type BuildShouldItemPassProps<T extends DataItem = DataItem> = {
  /** The filter schema to build function from */
  filterScheme: FilterScheme<T>;
  /** The logical operator to use for combining conditions */
  relationOperator?: RelationOperators;
};

/**
 * Internal props for creating boolean filter functions
 * @internal
 */
export type CreateBooleanFunctionProps = {
  /** The field name to filter on */
  fieldName: string;
  /** The comparison operator to use */
  operator: CompareOperators;
  /** The value to compare against */
  value: unknown;
  /** Optional custom comparison function */
  fn?: (itemValue: unknown, filterValue: unknown) => boolean;
};

/**
 * Internal props for extracting nested values from objects
 * @internal
 */
export type ExtractNestedValueFromItemProps<T extends DataItem = DataItem> = {
  /** The data item to extract value from */
  item: T;
  /** The field path (e.g., 'user.profile.name') */
  fieldName: string;
};

/**
 * Props for basic comparison operators that take two values
 * @internal
 */
export type BasicCompareOperatorProps<TItem = any, TValue = any> = {
  /** The value from the data item */
  itemValue: TItem;
  /** The value from the filter condition */
  value: TValue;
};

/**
 * Props for custom comparison operators with user-defined functions
 * @internal
 */
export type CustomCompareOperatorProps<TItem = any, TValue = any> = {
  /** The value from the data item */
  itemValue: TItem;
  /** The value from the filter condition */
  value: TValue;
  /** Custom comparison function */
  fn: (itemValue: TItem, value: TValue) => boolean;
};

/**
 * Props for single-value operators that only check the item value
 * @internal
 */
export type SingleItemCompareOperatorProps<TItem = any> = {
  /** The value from the data item to check */
  itemValue: TItem;
};

/**
 * Props for checking if a key exists in an object
 * @internal
 */
export type KeyExistsProps<T extends DataItem = DataItem> = {
  /** The property key to check for */
  key: string;
  /** The object to check in */
  item: T;
};

/**
 * More flexible DataItem type for internal use to maintain backward compatibility
 * @internal
 */
export type InternalDataItem = Record<string, any> | any[];
