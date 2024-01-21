type AndOperator = { AND?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

type OrOperator = { OR?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

type FilterChild = { fieldName: string; value: any; operator: any; key: string; NOT: boolean };

export type Filter = Array<Partial<FilterChild> & AndOperator & OrOperator>;

export class Filterer {
  constructor(props: { filterScheme: Filter });

  applyFilters(props: { data: Array<any> }): Array<any>;

  changeSchema(props: { filterScheme: Filter }): void;
}
