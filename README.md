# @talkohavy/filters

Easy & intuitive way to apply complex filters.

[![NPM Version][npm-version-image]][npm-url]

## Features

This package exposes the class object of `Filter`.  
`Filter` holds 2 powerful methods for you to utilize:

- `applyFilters`
- `changeSchema`

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

```js
import { Filterer } from '@talkohavy/filters';

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

/** @type {Filter} */
const filterScheme = [
  { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
  { fieldName: 'total', value: 13.8, operator: 'gte' },
];

const filterer = new Filterer({ filterScheme });
const filteredData = filterer.applyFilters({ data: dummyData });

console.log(filteredData);

// --- New Operator Examples ---

// notEqual
const notEqualScheme = [
  { fieldName: 'type', value: 'customer', operator: 'notEqual' },
];
console.log(new Filterer(notEqualScheme).applyFilters({ data: dummyData }));

// between
const betweenScheme = [
  { fieldName: 'total', value: [10, 50], operator: 'between' },
];
console.log(new Filterer(betweenScheme).applyFilters({ data: dummyData }));

// in
const inScheme = [
  { fieldName: 'type', value: ['customer', 'worker'], operator: 'in' },
];
console.log(new Filterer(inScheme).applyFilters({ data: dummyData }));

// regex
const regexScheme = [
  { fieldName: 'name', value: '^Tr', operator: 'regex' },
];
console.log(new Filterer(regexScheme).applyFilters({ data: dummyData }));
```

## License

[MIT](LICENSE)

[npm-url]: https://npmjs.com/package/@talkohavy/filters
[npm-version-image]: https://badge.fury.io/js/@talkohavy%2Ffilters.svg
