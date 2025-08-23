/**
 * Props for basic comparison operators that take two values
 */
export type ItemBasedOperatorProps = {
  /** The value from the data item */
  itemValue: any;
};

/**
 * Props for basic comparison operators that take two values
 */
export type ValueBasedOperatorProps = ItemBasedOperatorProps & {
  /** The value from the filter condition */
  value: any;
};

/**
 * Props for checking if a key exists in an object
 */
export type KeyExistsProps = {
  /** The property key to check for */
  key: string;
  /** The object to check in */
  item: any;
};

export type OperatorMethodProps = ValueBasedOperatorProps | ItemBasedOperatorProps | KeyExistsProps;

/**
 * Interface for all available operators in the Operators class
 */
export interface IOperators {
  regex(props: OperatorMethodProps): boolean;
  in(props: OperatorMethodProps): boolean;
  between(props: OperatorMethodProps): boolean;
  notEqual(props: OperatorMethodProps): boolean;
  equal(props: OperatorMethodProps): boolean;
  softEqual(props: OperatorMethodProps): boolean;
  gt(props: OperatorMethodProps): boolean;
  gte(props: OperatorMethodProps): boolean;
  lt(props: OperatorMethodProps): boolean;
  lte(props: OperatorMethodProps): boolean;
  startsWith(props: OperatorMethodProps): boolean;
  endsWith(props: OperatorMethodProps): boolean;
  includes(props: OperatorMethodProps): boolean;
  includesCaseInsensitive(props: OperatorMethodProps): boolean;
  isEmptyString(props: OperatorMethodProps): boolean;
  isNull(props: OperatorMethodProps): boolean;
  isNullish(props: OperatorMethodProps): boolean;
  isFalsy(props: OperatorMethodProps): boolean;
  isTruthy(props: OperatorMethodProps): boolean;
  keyExists(props: OperatorMethodProps): boolean;
  exists(props: OperatorMethodProps): boolean;
  equals(props: OperatorMethodProps): boolean;
}
