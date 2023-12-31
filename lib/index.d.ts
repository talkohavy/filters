declare type AndOperator = { AND?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

declare type OrOperator = { OR?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

declare type FilterChild = { fieldName: string; value: any; operator: any; key: string; NOT: boolean };

declare type Filter = Array<Partial<FilterChild> & AndOperator & OrOperator>;

class Filterer {
  constructor({ filterScheme }: { filterScheme: Filter });

  /**
   * @returns {Array<any>} Returns the data filtered according to a filters' schema.
   */
  applyFilters({ data }: { data: Array<any> }): Array<any>;

  changeSchema({ filterScheme }: { filterScheme: Filter }): void;
}

export { Filter, Filterer };

export default Filterer;
