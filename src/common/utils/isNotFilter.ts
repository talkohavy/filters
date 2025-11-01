import type { NotFilter } from '../../FilterScheme';
import { LogicalOperators } from '../constants';

export function isNotFilter<T>(filter: any): filter is NotFilter<T> {
  return LogicalOperators.NOT in filter && Array.isArray(filter[LogicalOperators.NOT]);
}
