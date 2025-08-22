/**
 * Comparison and unary operator functions for @talkohavy/filters
 * These are used by the Filterer class to perform filtering logic.
 */
import type {
  BasicCompareOperatorProps,
  CustomCompareOperatorProps,
  SingleItemCompareOperatorProps,
  KeyExistsProps,
} from './types';

// Two-values comparison:
/**
 * Membership operator
 * Returns true if itemValue is included in value (array)
 * value must be an array
 */
export function inOperator({ itemValue, value }: BasicCompareOperatorProps) {
  return Array.isArray(value) && value.includes(itemValue);
}
/**
 * Range operator
 * Returns true if itemValue is between value[0] and value[1] (inclusive)
 * value must be a two-element array: [min, max]
 */
export function between({ itemValue, value }: BasicCompareOperatorProps) {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [min, max] = value;
  return itemValue >= min && itemValue <= max;
}
/**
 * Strict inequality operator
 * Returns true if itemValue !== value
 */
export function notEqual({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue !== value;
}
export function equal({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue === value;
}
export function softEqual({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue == value;
}
export function gt({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue > value;
}
export function gte({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue >= value;
}
export function lt({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue < value;
}
export function lte({ itemValue, value }: BasicCompareOperatorProps) {
  return itemValue <= value;
}
export function startsWith({ itemValue, value }: BasicCompareOperatorProps) {
  return typeof itemValue === 'string' && itemValue.startsWith(value);
}
export function endsWith({ itemValue, value }: BasicCompareOperatorProps) {
  return typeof itemValue === 'string' && itemValue.endsWith(value);
}
export function includes({ itemValue, value }: BasicCompareOperatorProps) {
  return typeof itemValue === 'string' && itemValue.includes(value);
}
export function includesCaseInsensitive({ itemValue, value }: BasicCompareOperatorProps) {
  return typeof itemValue === 'string' && itemValue.toLowerCase().includes(String(value).toLowerCase());
}
export function custom({ itemValue, value, fn }: CustomCompareOperatorProps) {
  return fn(itemValue, value);
}

// One-value comparison:
export function isEmptyString({ itemValue }: SingleItemCompareOperatorProps) {
  return itemValue === '';
}
export function isNull({ itemValue }: SingleItemCompareOperatorProps) {
  return itemValue === null;
}
export function isNullish({ itemValue }: SingleItemCompareOperatorProps) {
  return itemValue == null;
}
export function isFalsy({ itemValue }: SingleItemCompareOperatorProps) {
  return !itemValue;
}
export function isTruthy({ itemValue }: SingleItemCompareOperatorProps) {
  return !!itemValue;
}
export function keyExists({ key, item }: KeyExistsProps) {
  return key in item;
}
export function applyNot(fn: (item: any) => boolean) {
  return (item: any) => !fn(item);
}

// Aliases
export const exists = isTruthy;
export const equals = equal;
