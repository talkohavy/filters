import type { LogicalOperatorsValues } from '../common/constants';
import type { FilterScheme } from '../FilterScheme/types';

/**
 * Internal props for building the filter function
 * @internal
 */
export type BuildPredicateFromFilterSchemeProps<T> = {
  /** The filter schema to build function from */
  filterScheme: FilterScheme<T>;
  /** The logical operator to use for combining conditions */
  relationOperator?: LogicalOperatorsValues;
};
