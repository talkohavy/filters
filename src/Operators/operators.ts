import type { ItemBasedOperatorProps, KeyExistsProps, ValueBasedOperatorProps } from './types';

class Operators {
  // ----------------------
  // Value-based Operators:
  // ----------------------

  /**
   * Regex operator
   * Returns true if itemValue matches the provided regex pattern
   */
  public regex({ itemValue, value }: ValueBasedOperatorProps): boolean {
    if (typeof itemValue !== 'string') return false;
    if (value instanceof RegExp) return value.test(itemValue);
    if (typeof value === 'string') return new RegExp(value).test(itemValue);
    return false;
  }

  /**
   * Membership operator
   * Returns true if itemValue is included in value (array)
   */
  public in({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return Array.isArray(value) && value.includes(itemValue);
  }

  /**
   * Range operator
   * Returns true if itemValue is between value[0] and value[1] (inclusive)
   */
  public between({ itemValue, value }: ValueBasedOperatorProps): boolean {
    if (!Array.isArray(value) || value.length !== 2) return false;

    const [min, max] = value;

    return itemValue >= min && itemValue <= max;
  }

  /**
   * Strict inequality operator
   * Returns true if itemValue !== value
   */
  public notEqual({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue !== value;
  }

  public equal({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue === value;
  }

  public softEqual({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue == value;
  }

  public gt({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue > value;
  }

  public gte({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue >= value;
  }

  public lt({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue < value;
  }

  public lte({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return itemValue <= value;
  }

  public startsWith({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return typeof itemValue === 'string' && itemValue.startsWith(value);
  }

  public endsWith({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return typeof itemValue === 'string' && itemValue.endsWith(value);
  }

  public includes({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return typeof itemValue === 'string' && itemValue.includes(value);
  }

  public includesCaseInsensitive({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return typeof itemValue === 'string' && itemValue.toLowerCase().includes(String(value).toLowerCase());
  }

  // --------------------------
  // Non-Value-based Operators:
  // --------------------------
  public isEmptyString({ itemValue }: ItemBasedOperatorProps): boolean {
    return itemValue === '';
  }

  public isNull({ itemValue }: ItemBasedOperatorProps): boolean {
    return itemValue === null;
  }

  public isNullish({ itemValue }: ItemBasedOperatorProps): boolean {
    return itemValue == null;
  }

  public isFalsy({ itemValue }: ItemBasedOperatorProps): boolean {
    return !itemValue;
  }

  public isTruthy({ itemValue }: ItemBasedOperatorProps): boolean {
    return !!itemValue;
  }

  public keyExists({ key, item }: KeyExistsProps): boolean {
    return key in item;
  }

  // -------
  // Aliases
  // -------
  public exists({ itemValue }: ItemBasedOperatorProps): boolean {
    return this.isTruthy({ itemValue });
  }

  public equals({ itemValue, value }: ValueBasedOperatorProps): boolean {
    return this.equal({ itemValue, value });
  }
}

export const operators = new Operators();
export type OperatorNames = keyof Operators;

/**
 * List of all valid comparison operators
 */
export const VALID_OPERATORS = Object.getOwnPropertyNames(Operators.prototype).filter(
  (key) => key !== 'constructor',
) as OperatorNames[];
