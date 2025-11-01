export const LogicalOperators = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
} as const;

type LogicalOperatorsType = typeof LogicalOperators;
type LogicalOperatorKeys = keyof LogicalOperatorsType;
export type LogicalOperatorsValues = LogicalOperatorsType[LogicalOperatorKeys];

export const FIELD_NAME_KEY = 'fieldName';
export const OPERATOR_KEY = 'operator';
