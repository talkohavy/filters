import { type OperatorNames, Operators } from '../../Operators/operators';

/**
 * List of all valid comparison operators
 */
export const VALID_OPERATORS = Object.getOwnPropertyNames(Operators.prototype).filter(
  (key) => key !== 'constructor',
) as OperatorNames[];
