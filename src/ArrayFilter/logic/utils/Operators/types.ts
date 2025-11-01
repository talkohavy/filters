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
