import type { LeafFilter } from '../../FilterScheme';
import { FIELD_NAME_KEY, OPERATOR_KEY } from '../constants';

export function isLeafFilter<T>(filter: any): filter is LeafFilter<T> {
  return FIELD_NAME_KEY in filter && OPERATOR_KEY in filter;
}
