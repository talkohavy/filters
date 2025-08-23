# @talkohavy/filters

Easy & intuitive way to apply complex array filters.

[![NPM Version][npm-version-image]][npm-url]

## Features

This package exposes the `ArrayFilter` class for flexible, type-safe array filtering, as well as supporting types and constants for building filter schemes.

## Installation

Using npm:

```bash
npm install @talkohavy/filters
```

Using pnpm:

```bash
pnpm add @talkohavy/filters
```

Using yarn:

```bash
yarn add @talkohavy/filters
```

## How to use

Here's a code example of how to use the package:

```ts
import { ArrayFilter, FilterScheme, RelationOperators } from '@talkohavy/filters';

const dummyData = [
  {
    id: 1,
    name: 'Dander Mente',
    type: 'customer',
    orders: { amount: 10 },
    address: 'NY USA',
    order: 'A4BC',
    tax: 145.2,
    total: 13.9,
  },
  {
    id: 2,
    name: 'Tracey Bill',
    type: 'customer',
    orders: { amount: 10, isVIP: null },
    address: 'NJ USA',
    order: 'A8O7X',
    tax: 1.2,
    total: 93.46,
  },
  {
    id: 3,
    name: 'Gina Doe',
    type: 'worker',
    address: 'CA USA',
    order: 'B3KL',
    tax: 75.6,
    total: 30.1,
  },
];

const filterScheme: FilterScheme = [
  { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
  { fieldName: 'total', value: 13.8, operator: 'gte' },
];


const arrayFilter = new ArrayFilter(filterScheme);
const filteredData = arrayFilter.applyFilters(dummyData);
console.log(filteredData);

// --- Operator Examples ---

const notEqualScheme: FilterScheme = [
  { fieldName: 'type', value: 'customer', operator: 'notEqual' },
];
console.log(new ArrayFilter(notEqualScheme).applyFilters(dummyData));


const betweenScheme: FilterScheme = [
  { fieldName: 'total', value: [10, 50], operator: 'between' },
];
console.log(new ArrayFilter(betweenScheme).applyFilters(dummyData));


const inScheme: FilterScheme = [
  { fieldName: 'type', value: ['customer', 'worker'], operator: 'in' },
];
console.log(new ArrayFilter(inScheme).applyFilters(dummyData));


const regexScheme: FilterScheme = [
  { fieldName: 'name', value: '^Tr', operator: 'regex' },
];
console.log(new ArrayFilter(regexScheme).applyFilters(dummyData));
```

## API

### Main Export

- `ArrayFilter`: The main function for filtering arrays using filter schemes. Call as `new ArrayFilter(filterScheme)`.

### Types

- `FilterScheme`, `ChildFilter`, `CustomPredicateFilterChild`, `ExistsFilterChild`, `OperatorFilterChild`: Types for building filter schemes.
- `OperatorNames`: All supported operator names.
- `RelationOperatorsValues`: All supported relation operator values.

### Constants

- `RelationOperators`: Object containing all supported relation operators.

---

## License

[MIT](LICENSE)

[npm-url]: https://npmjs.com/package/@talkohavy/filters
[npm-version-image]: https://badge.fury.io/js/@talkohavy%2Ffilters.svg
