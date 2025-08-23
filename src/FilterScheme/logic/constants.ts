import { type OperatorNames, Operators } from '../../Operators/operators';

/**
 * Operators that require custom functions
 */
export const OPERATORS_REQUIRING_FUNCTION = ['custom'];

/**
 * List of all valid comparison operators
 */
export const VALID_OPERATORS = Object.getOwnPropertyNames(Operators.prototype).filter(
  (key) => key !== 'constructor',
) as OperatorNames[];
