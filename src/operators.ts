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
