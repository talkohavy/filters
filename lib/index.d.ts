declare type AndOperator = { AND?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

declare type OrOperator = { OR?: Array<Partial<FilterChild> & AndOperator & OrOperator> };

declare type FilterChild = { fieldName: string; value: any; operator: any; key: string };

declare type Filter = Array<Partial<FilterChild> & AndOperator & OrOperator>;

export { Filter };
