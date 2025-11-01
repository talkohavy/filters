import type { AndFilter } from '../../FilterScheme';
import { LogicalOperators } from '../constants';

export function isAndFilter<T>(filter: any): filter is AndFilter<T> {
  return LogicalOperators.AND in filter;
}
