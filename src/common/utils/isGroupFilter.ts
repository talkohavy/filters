import type { AndFilter, NotFilter, OrFilter } from '../../FilterScheme';
import { isAndFilter } from './isAndFilter';
import { isNotFilter } from './isNotFilter';
import { isOrFilter } from './isOrFilter';

export function isGroupFilter<T = any>(filter: any): filter is AndFilter<T> | OrFilter<T> | NotFilter<T> {
  return isAndFilter(filter) || isOrFilter(filter) || isNotFilter(filter);
}
