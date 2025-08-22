import { RelationOperators } from './constants';
import type { ApplyFiltersProps, BuildShouldItemPassProps, CreateBooleanFunctionProps, FilterScheme } from './types';
import { extractNestedValueFromItem } from './utils';
import { memoizeFilter } from './memoize';
import { validateFilterSchema } from './validation';
import { FieldPathError, OperatorError } from './errors';
import * as operators from './operators';

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
class Filterer {
  /**
   * Creates a new Filterer instance with a filter scheme.
   * @param filterScheme - Array of filter conditions and logical groupings
   */
  #compareOperators: any;
  #shouldItemPass;

  constructor(filterScheme: FilterScheme) {
    // Validate the filter schema before processing
    validateFilterSchema(filterScheme);

    this.#compareOperators = this.#buildCompareOperators();
    this.#shouldItemPass = memoizeFilter(this.#buildShouldItemPass({ filterScheme }));
  }

  applyFilters(props: ApplyFiltersProps): Array<any> {
    /**
     * Filters the provided data array using the filter scheme.
     * @param props - Object containing the data array to filter
     * @returns Filtered array of items
     */
    const { data } = props;

    const filteredData = data.filter(this.#shouldItemPass);

    return filteredData;
  }

  changeSchema(filterScheme: FilterScheme): void {
    /**
     * Changes the filter scheme for this Filterer instance.
     * @param filterScheme - New filter scheme to apply
     */
    // Validate the new filter schema before applying
    validateFilterSchema(filterScheme);

    this.#shouldItemPass = memoizeFilter(this.#buildShouldItemPass({ filterScheme }));
  }

  #buildShouldItemPass(props: BuildShouldItemPassProps) {
    const { filterScheme, relationOperator = RelationOperators.AND } = props;

    // Step 1: create a booleanFunc for each node at the current tree level
    const filterFunctions: Array<any> = filterScheme.map((filter) => {
      if (RelationOperators.AND in filter || RelationOperators.OR in filter) {
        // This node is a relationOperation! 1. Attach a relation operation to it. 2. Keep going down further and get the array of nested filters.
        const relationOperator = RelationOperators.AND in filter ? RelationOperators.AND : RelationOperators.OR;
        return this.#buildShouldItemPass({ filterScheme: (filter as any)[relationOperator], relationOperator });
      }
      // This node is a leaf/filter! Attach a Boolean function to it.
      const booleanFunc = this.#createBooleanFunction(filter as any);

      return 'NOT' in filter ? this.#compareOperators.applyNot(booleanFunc) : booleanFunc;
    });

    // Step 2: apply the relation operator on all nodes on this floor level
    if (relationOperator === RelationOperators.OR) {
      return (item: any) => filterFunctions.some((filter) => filter(item));
    }

    return (item: any) => filterFunctions.every((filter) => filter(item));
  }

  #createBooleanFunction(filter: CreateBooleanFunctionProps) {
    const { fieldName, operator, value, fn: customFunction } = filter;

    // Edge case 1: decide true or false only based on 'value'
    const isValueBased = !('fieldName' in filter);
    if (isValueBased) return () => this.#compareOperators[operator]({ itemValue: value, fn: customFunction });

    // Normal case: decide true or false based on extracted field value
    return (item: any) => {
      try {
        var { itemValue, lastItem, lastKey } = extractNestedValueFromItem({ item, fieldName });
      } catch (error) {
        if (error instanceof FieldPathError) {
          return false;
        }
        throw error;
      }
      try {
        return this.#compareOperators[operator]({ itemValue, value, fn: customFunction, item: lastItem, key: lastKey });
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

  // ...existing code...

  #buildCompareOperators() {
    return {
      equal: operators.equal,
      equals: operators.equals,
      notEqual: operators.notEqual,
      softEqual: operators.softEqual,
      gt: operators.gt,
      gte: operators.gte,
      lt: operators.lt,
      lte: operators.lte,
      between: operators.between,
      in: operators.inOperator,
      regex: operators.regex,
      startsWith: operators.startsWith,
      endsWith: operators.endsWith,
      includes: operators.includes,
      includesCaseInsensitive: operators.includesCaseInsensitive,
      custom: operators.custom,
      isEmptyString: operators.isEmptyString,
      isNull: operators.isNull,
      isNullish: operators.isNullish,
      isFalsy: operators.isFalsy,
      isTruthy: operators.isTruthy,
      exists: operators.exists,
      keyExists: operators.keyExists,
      applyNot: operators.applyNot,
    };
  }
}

export { Filterer };
