import type {
  ChildFilter,
  CustomPredicateFilterChild,
  ExistsFilterChild,
  FilterScheme,
  OperatorFilterChild,
} from '../FilterScheme/types';
import type { BuildPredicateFromFilterSchemeProps } from './ArrayFilter.interface';
import { RelationOperators } from '../common/constants';
import { OperatorError } from '../common/errors';
import { filterValidator, type FilterValidator } from '../FilterScheme/filter-validator';
import { operators, type IOperators } from '../Operators';
import { validateFieldPath } from './utils/validateFieldPath';

/**
 * Filterer class for applying complex filter schemes to data arrays.
 * Supports nested AND/OR logic, custom operators, and memoization for performance.
 *
 * @example
 * const filterScheme = [
 *   { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
 *   { fieldName: 'total', value: 13.8, operator: 'gte' },
 * ];
 * const filterer = new Filterer(filterScheme);
 * const filteredData = filterer.applyFilters({ data });
 *
 * @example
 * // Nested logic
 * const filterScheme = [
 *   {
 *     AND: [
 *       { fieldName: 'total', operator: 'gt', value: 30 },
 *       { fieldName: 'total', operator: 'lt', value: 30.2 },
 *     ],
 *   },
 * ];
 * const filterer = new Filterer(filterScheme);
 * const filteredData = filterer.applyFilters({ data });
 */
export class ArrayFilter {
  private predicate: (item: any) => boolean;
  private readonly compareOperators: IOperators;
  private readonly filterValidator: FilterValidator;
  /**
   * Extracts a nested value from an object using a dot-separated field path.
   * Uses a static cache for field path splits to optimize repeated extraction.
   * Returns the value, the last traversed object, and the last key.
   * Throws FieldPathError for invalid paths.
   */
  private fieldPathCache = new Map<string, string[]>();

  /**
   * Creates a new Filterer instance with a filter scheme.
   * @param filterScheme - Array of filter conditions and logical groupings
   */
  constructor(filterScheme: FilterScheme) {
    this.filterValidator = filterValidator;
    this.compareOperators = operators;

    this.filterValidator.validateFilterSchema(filterScheme);
    this.predicate = this.buildPredicateFromFilterScheme({ filterScheme });
  }

  /**
   * Filters the provided data array using the filter scheme.
   * @param props - Object containing the data array to filter
   * @returns Filtered array of items
   */
  applyFilters<T = any>(data: Array<T>): Array<T> {
    const filteredData = data.filter(this.predicate);

    return filteredData;
  }

  /**
   * Changes the filter scheme for this Filterer instance.
   * @param filterScheme - New filter scheme to apply
   */
  changeSchema(filterScheme: FilterScheme): void {
    this.filterValidator.validateFilterSchema(filterScheme);

    this.predicate = this.buildPredicateFromFilterScheme({ filterScheme });
  }

  private buildPredicateFromFilterScheme(props: BuildPredicateFromFilterSchemeProps) {
    const { filterScheme: filterSchemeRaw, relationOperator = RelationOperators.AND } = props;

    const filterScheme = Array.isArray(filterSchemeRaw) ? filterSchemeRaw : [filterSchemeRaw];

    // Step 1: create a booleanFunc for each node at the current tree level
    const filterFunctions: Array<any> = filterScheme.map((filter) => {
      if (this.getIsLeafNode(filter)) {
        const booleanFunc = this.createBooleanFunction(filter as any);

        return 'NOT' in filter ? this.applyNot(booleanFunc) : booleanFunc;
      }

      // This node is a relationOperation! 1. Attach a relation operation to it. 2. Keep going down further and get the array of nested filters.
      const hasLogicalAND = RelationOperators.AND in filter && Array.isArray(filter[RelationOperators.AND]);
      const hasLogicalOR = RelationOperators.OR in filter && Array.isArray(filter[RelationOperators.OR]);
      const hasLogicalNOT = RelationOperators.NOT in filter && Array.isArray(filter[RelationOperators.NOT]);

      const relationOperator = hasLogicalAND
        ? RelationOperators.AND
        : hasLogicalOR
          ? RelationOperators.OR
          : hasLogicalNOT
            ? RelationOperators.NOT
            : RelationOperators.AND; // fallback, though this shouldn't happen
      return this.buildPredicateFromFilterScheme({
        filterScheme: (filter as any)[relationOperator],
        relationOperator,
      });
    });

    // Step 2: apply the relation operator on all nodes on this floor level
    if (relationOperator === RelationOperators.OR) {
      return (item: any) => filterFunctions.some((filter) => filter(item));
    }

    if (relationOperator === RelationOperators.NOT) {
      // NOT operator: negate the result of all filters combined with AND logic
      return (item: any) => !filterFunctions.every((filter) => filter(item));
    }

    return (item: any) => filterFunctions.every((filter) => filter(item));
  }

  private createBooleanFunction(filter: ChildFilter) {
    if ('fn' in filter) {
      return this.getCustomPredicateBooleanFunction(filter);
    }

    return this.getOperatorBooleanFunction(filter);
  }

  private getIsLeafNode(filter: any): boolean {
    // Check if this is a logical operator (contains array)
    const hasLogicalAND = RelationOperators.AND in filter && Array.isArray(filter[RelationOperators.AND]);
    const hasLogicalOR = RelationOperators.OR in filter && Array.isArray(filter[RelationOperators.OR]);
    const hasLogicalNOT = RelationOperators.NOT in filter && Array.isArray(filter[RelationOperators.NOT]);

    return !hasLogicalAND && !hasLogicalOR && !hasLogicalNOT;
  }

  private getCustomPredicateBooleanFunction(filter: CustomPredicateFilterChild) {
    const { fieldName, value } = filter;

    return (item: any) => {
      const { itemValue } = this.extractNestedValueFromItem(item, fieldName);

      try {
        return filter.fn!(itemValue, value);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new OperatorError(`Custom function for field '${fieldName}' failed: ${errorMessage}`, {
          fieldName,
          itemValue,
          filterValue: value,
          originalError: errorMessage,
        });
      }
    };
  }

  private getOperatorBooleanFunction<T>(filter: OperatorFilterChild | ExistsFilterChild) {
    const { operator, fieldName } = filter;
    const value = 'value' in filter ? filter.value : undefined;

    return (item: T) => {
      const { itemValue, lastItem, lastKey } = this.extractNestedValueFromItem(item, fieldName);

      try {
        const selectedOperator = this.compareOperators[operator].bind(this.compareOperators);

        return selectedOperator({ itemValue, value, item: lastItem, key: lastKey });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new OperatorError(`Operator '${operator}' failed: ${errorMessage}`, {
          operator,
          fieldName,
          itemValue,
          filterValue: value,
          originalError: errorMessage,
        });
      }
    };
  }

  private applyNot(booleanFunc: (item: any) => boolean) {
    return (item: any) => !booleanFunc(item);
  }

  private extractNestedValueFromItem(item: any, fieldName: string) {
    validateFieldPath(fieldName);

    let fieldParts = this.fieldPathCache.get(fieldName);

    if (!fieldParts) {
      fieldParts = fieldName.split('.');
      this.fieldPathCache.set(fieldName, fieldParts);
    }

    const lastKey = fieldParts.at(-1);
    let itemValue: any = item;
    let lastItem: any = item;

    try {
      for (const subKeyPart of fieldParts) {
        lastItem = itemValue;
        itemValue = itemValue[subKeyPart];
      }
    } catch {
      console.warn('Warning: Failed to extract nested value for field path:', fieldName);
    }

    return { itemValue, lastItem, lastKey };
  }
}
