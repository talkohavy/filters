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
  RELATION_OPERATORS = { AND: 'AND', OR: 'OR' };
  #compareOperators;
  #shouldItemPass;

  constructor({ filterScheme }) {
    this.#compareOperators = this.#buildCompareOperators();
    this.#shouldItemPass = this.#buildShouldItemPass({ filterScheme });
  }

  /**
   * @param {{ data: Array }} props
   * @returns { Array } Returns the data filtered according to a filters' schema.
   */
  applyFilters({ data }) {
    const filteredData = data.filter(this.#shouldItemPass);

    return filteredData;
  }

  changeSchema({ filterScheme }) {
    this.#shouldItemPass = this.#buildShouldItemPass({ filterScheme });
  }

  #buildShouldItemPass({ filterScheme, relationOperator = this.RELATION_OPERATORS.AND }) {
    // Step 1: create a booleanFunc for each node at the current tree level
    const filterFunctions = filterScheme.map((filter) => {
      if (filter.AND ?? filter.OR) {
        // This node is a relationOperation! 1. Attach a relation operation to it. 2. Keep going down further and get the array of nested filters.
        const relationOperator = filter.AND ? this.RELATION_OPERATORS.AND : this.RELATION_OPERATORS.OR;
        return this.#buildShouldItemPass({ filterScheme: filter[relationOperator], relationOperator });
      }
      // This node is a leaf/filter! Attach a Boolean function to it.
      const booleanFunc = this.#createBooleanFunction(filter);

      return filter.NOT ? this.#compareOperators.applyNot(booleanFunc) : booleanFunc;
    });

    // Step 2: apply the relation operator on all nodes on this floor level
    if (relationOperator === this.RELATION_OPERATORS.OR) {
      return (item) => filterFunctions.some((filter) => filter(item));
    }

    return (item) => filterFunctions.every((filter) => filter(item));
  }

  #createBooleanFunction(filter) {
    const { fieldName, operator, value, fn: customFunction } = filter;

    // Edge case 1: decide true or false only based on 'value'
    const isValueBased = !('fieldName' in filter);
    if (isValueBased) return () => this.#compareOperators[operator]({ itemValue: value, fn: customFunction });

    // Normal case: decide true or false only based on 'value'
    return (item) => {
      try {
        // biome-ignore lint: I need this var
        var { itemValue, lastItem, lastKey } = this.#extractNestedValueFromItem({ item, fieldName });
      } catch (_error) {
        return false;
      }

      return this.#compareOperators[operator]({ itemValue, value, fn: customFunction, item: lastItem, key: lastKey });
    };
  }

  #extractNestedValueFromItem({ item, fieldName }) {
    const fieldParts = fieldName?.split('.');
    const lastKey = fieldParts.at(-1);
    let itemValue = item;
    let lastItem = item;

    fieldParts.forEach((subKeyPart) => {
      lastItem = itemValue;
      itemValue = itemValue[subKeyPart];
    });

    return { itemValue, lastItem, lastKey };
  }

  #buildCompareOperators() {
    // Two-values comparison:
    const equal = ({ itemValue, value }) => itemValue === value;
    // biome-ignore lint: I need this soft equal
    const softEqual = ({ itemValue, value }) => itemValue == value;
    const gt = ({ itemValue, value }) => itemValue > value;
    const gte = ({ itemValue, value }) => itemValue >= value;
    const lt = ({ itemValue, value }) => itemValue < value;
    const lte = ({ itemValue, value }) => itemValue <= value;
    const startsWith = ({ itemValue, value }) => itemValue.startsWith(value);
    const endsWith = ({ itemValue, value }) => itemValue.endsWith(value);
    const includes = ({ itemValue, value }) => itemValue.includes(value);
    const includesCaseInsensitive = ({ itemValue, value }) =>
      itemValue?.toLowerCase()?.includes?.(value?.toLowerCase());
    const custom = ({ itemValue, value, fn }) => fn(itemValue, value);
    // One-value Comparison:
    const isEmptyString = ({ itemValue }) => itemValue === '';
    const isNull = ({ itemValue }) => itemValue === null;
    const isNullish = ({ itemValue }) => itemValue == null;
    const isFalsy = ({ itemValue }) => !itemValue;
    const isTruthy = ({ itemValue }) => itemValue;
    const keyExists = ({ key, item }) => key in item;
    const applyNot = (fn) => (item) => !fn(item);
    // Aliases:
    const exists = isTruthy;
    const equals = equal;

    return {
      equal,
      equals,
      softEqual,
      gt,
      gte,
      lt,
      lte,
      startsWith,
      endsWith,
      includes,
      includesCaseInsensitive,
      custom,
      isEmptyString,
      isNull,
      isNullish,
      isFalsy,
      isTruthy,
      exists,
      keyExists,
      applyNot,
    };
  }
}

export { Filterer };
