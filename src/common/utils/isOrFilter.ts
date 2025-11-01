import type { OrFilter } from '../../FilterScheme';
import { LogicalOperators } from '../constants';

export function isOrFilter<T>(item: any): item is OrFilter<T> {
  return LogicalOperators.OR in item;
}
