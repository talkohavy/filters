import type { RelationOperatorsValues } from '../common/constants';
import type { FilterScheme } from '../FilterScheme/types';
import type { OperatorNames } from '../Operators/operators';

/**
 * Internal props for building the filter function
 * @internal
 */
export type BuildPredicateFromFilterSchemeProps = {
  /** The filter schema to build function from */
  filterScheme: FilterScheme;
  /** The logical operator to use for combining conditions */
  relationOperator?: RelationOperatorsValues;
};

/**
 * Internal props for creating boolean filter functions
 * @internal
 */
export type CreateBooleanFunctionProps = {
  /** The field name to filter on */
  fieldName: string;
  /** The comparison operator to use */
  operator: OperatorNames;
  /** The value to compare against */
  value: unknown;
  /** Optional custom comparison function */
  fn?: (itemValue: unknown, filterValue: unknown) => boolean;
};
