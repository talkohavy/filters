import { RelationOperators } from './constants';
import type { ApplyFiltersProps, BuildShouldItemPassProps, CreateBooleanFunctionProps, FilterScheme } from './types';
import { extractNestedValueFromItem } from './utils';
import { validateFilterSchema } from './validation';
import { FieldPathError, OperatorError } from './errors';
import * as operators from './operators';

/**
 * @description
 * Imagine a tree, with multiple levels (at least 1), where the root is at the top.
 * A tree is built from nodes and arcs.
 * Each Node can hold 1 of 2 things:
 * 1. A relation operation (AND || OR)
 * 2. A boolean function ( (item) => Boolean )
 * You start from the top, and begin to go down, DFS style.
 * For every node in the tree, you mark whether it's a relation node, or a Boolean function node.
 * If it's a Boolean function node, it's a leaf!
 * If it's a relation node, it's a parent node! You keep going down to its children.
 * You are done when all nodes are marked, and you've basically created a schema tree to run an item on.
 * An item running on a schema tree with Boolean functions will basically have many boolean values propagating upwards,
 * until reaching the root node. Which ever value that reaches the node is essentially the result value for shouldItemPass.
 * @example
 * // And the filterScheme looks like this:
 * const filterScheme = [
 *  {
 *    AND: [
 *      {
 *        OR: [
 *          { fieldName: 'name', value: 'Da', operator: 'startsWith' },
 *          {
 *            AND: [
 *              { fieldName: 'name', value: 'Tr', operator: 'startsWith' },
 *              { fieldName: 'id', value: 2, operator: 'equal' },
 *            ],
 *          },
 *        ],
 *      },
 *      { fieldName: 'total', value: 50, operator: 'gt' },
 *    ],
 *  },
 * ];
 * @example
 * // Step 1: create a filters schema
 * const filtersScheme = [
 *   { fieldName: 'customer', value: 'T', operator: 'startsWith' },
 *   { fieldName: 'id', value: 3, operator: 'equal' },
 * ];
 *
 * // Step 2: create a Filterer class instance, and pass filtersScheme to it
 * const filterer = new Filterer({ filtersScheme });
 *
 * // Step 3: use the applyFilters method to filter the data
 * const filteredData = filterer.applyFilters({ data });
 * console.log('filteredData is:', filteredData);
 */
class Filterer {
  #compareOperators: any;
  #shouldItemPass;

  constructor(filterScheme: FilterScheme) {
    // Validate the filter schema before processing
    validateFilterSchema(filterScheme);

    this.#compareOperators = this.#buildCompareOperators();
    this.#shouldItemPass = this.#buildShouldItemPass({ filterScheme });
  }

  applyFilters(props: ApplyFiltersProps): Array<any> {
    const { data } = props;

    const filteredData = data.filter(this.#shouldItemPass);

    return filteredData;
  }

  changeSchema(filterScheme: FilterScheme): void {
    // Validate the new filter schema before applying
    validateFilterSchema(filterScheme);

    this.#shouldItemPass = this.#buildShouldItemPass({ filterScheme });
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
