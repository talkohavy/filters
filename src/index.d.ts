type AndOperator = { AND?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

type OrOperator = { OR?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

type FilterChild = { fieldName: string; value: any; operator: CompareOperators; key: string; NOT: boolean };

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

export type Filter = Array<Partial<FilterChild> & AndOperator & OrOperator>;

export class Filterer implements IFilterer {
  constructor(props: { filterScheme: Filter });

  applyFilters(props: { data: Array<any> }): Array<any>;

  changeSchema(props: { filterScheme: Filter }): void;
}

export interface IFilterer {
  applyFilters(props: { data: Array<any> }): Array<any>;

  changeSchema(props: { filterScheme: Filter }): void;
}
