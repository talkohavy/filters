import type { RelationOperators } from '../constants';

type AndOperator = { AND?: FilterParent };

type OrOperator = { OR?: FilterParent };

type FilterParent = Array<Partial<FilterChild> & AndOperator & OrOperator>;

type FilterChild = { fieldName: string; value: any; operator: CompareOperators; key: string; NOT: boolean };

export type FiltererProps = {
  filterScheme: FilterScheme;
};

export type CompareOperators =
  | 'equal'
  | 'equals'
  | 'softEqual'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'startsWith'
  | 'endsWith'
  | 'includes'
  | 'includesCaseInsensitive'
  | 'custom'
  | 'isEmptyString'
  | 'isNull'
  | 'isNullish'
  | 'isFalsy'
  | 'isTruthy'
  | 'exists'
  | 'keyExists'
  | 'applyNot';

export type FilterScheme = Array<FilterParent | FilterChild>;

export type ApplyFiltersProps = {
  data: Array<any>;
};

export type ChangeSchemaProps = {
  filterScheme: FilterScheme;
};

export type BuildShouldItemPassProps = {
  filterScheme: FilterScheme;
  relationOperator?: RelationOperators;
};

export type CreateBooleanFunctionProps = {
  fieldName: string;
  operator: any;
  value: any;
  fn: () => void;
};

export type ExtractNestedValueFromItemProps = {
  item: any;
  fieldName: string;
};

export type BasicCompareOperatorProps = {
  itemValue: any;
  value: any;
};

export type CustomCompareOperatorProps = {
  itemValue: any;
  value: any;
  fn: (itemValue: any, value: any) => boolean;
};

export type SingleItemCompareOperatorProps = {
  itemValue: any;
};

export type KeyExistsProps = {
  key: string;
  item: any;
};
