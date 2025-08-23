export const RelationOperators = {
  AND: 'AND',
  OR: 'OR',
} as const;

type RelationOperatorsType = typeof RelationOperators;
type RelationOperatorsKeys = keyof RelationOperatorsType;
export type RelationOperatorsValues = RelationOperatorsType[RelationOperatorsKeys];
