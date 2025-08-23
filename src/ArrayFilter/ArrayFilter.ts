import { RelationOperators } from '../constants';
import { extractNestedValueFromItem } from './utils/extractNestedValueFromItem';
import { memoizeFilter } from './utils/memoize';
import { FieldPathError, OperatorError } from '../common/errors';
import { operators, type IOperators } from '../Operators';
import type { BuildPredicateFromFilterSchemeProps } from './ArrayFilter.interface';
import type {
  ChildFilter,
  CustomPredicateFilterChild,
  ExistsFilterChild,
  FilterScheme,
  OperatorFilterChild,
} from '../FilterScheme/types';
import { filterValidator, type FilterValidator } from '../FilterScheme/filter-validator';

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
export class Filterer {
  private predicate: (item: any) => boolean;
  private readonly compareOperators: IOperators;
  private readonly filterValidator: FilterValidator;

  /**
   * Creates a new Filterer instance with a filter scheme.
   * @param filterScheme - Array of filter conditions and logical groupings
   */
  constructor(filterScheme: FilterScheme) {
    this.filterValidator = filterValidator;
    this.compareOperators = operators;

    this.filterValidator.validateFilterSchema(filterScheme);
    this.predicate = memoizeFilter(this.buildPredicateFromFilterScheme({ filterScheme }));
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

    this.predicate = memoizeFilter(this.buildPredicateFromFilterScheme({ filterScheme }));
  }

  private buildPredicateFromFilterScheme(props: BuildPredicateFromFilterSchemeProps) {
    const { filterScheme, relationOperator = RelationOperators.AND } = props;

    // Step 1: create a booleanFunc for each node at the current tree level
    const filterFunctions: Array<any> = filterScheme.map((filter) => {
      if (this.getIsLeafNode(filter)) {
        const booleanFunc = this.createBooleanFunction(filter as any);

        return 'NOT' in filter ? this.applyNot(booleanFunc) : booleanFunc;
      }

      // This node is a relationOperation! 1. Attach a relation operation to it. 2. Keep going down further and get the array of nested filters.
      const relationOperator = RelationOperators.AND in filter ? RelationOperators.AND : RelationOperators.OR;
      return this.buildPredicateFromFilterScheme({
        filterScheme: (filter as any)[relationOperator],
        relationOperator,
      });
    });

    // Step 2: apply the relation operator on all nodes on this floor level
    if (relationOperator === RelationOperators.OR) {
      return (item: any) => filterFunctions.some((filter) => filter(item));
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
    return !(RelationOperators.AND in filter) && !(RelationOperators.OR in filter);
  }

  private getNestedValue(item: any, fieldName: string): { itemValue: any; lastItem: any; lastKey: string | undefined } {
    try {
      const result = extractNestedValueFromItem({ item, fieldName });
      return result;
    } catch (error) {
      if (error instanceof FieldPathError) return {} as any;

      throw error;
    }
  }

  private getCustomPredicateBooleanFunction(filter: CustomPredicateFilterChild) {
    const { fieldName, value } = filter;

    return (item: any) => {
      const { itemValue } = this.getNestedValue(item, fieldName);

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
      const { itemValue, lastItem, lastKey } = this.getNestedValue(item, fieldName);

      try {
        const selectedOperator = this.compareOperators[operator];

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
}
