# @talkohavy/filters

Easy & intuitive way to apply complex array filters with TypeScript support.

[![NPM Version][npm-version-image]][npm-url]

## Features

- 🔍 **Powerful filtering** - Support for simple and complex filtering scenarios
- 🧠 **Logical operators** - Advanced AND, OR, NOT combinations
- 🎯 **Type-safe** - Full TypeScript support with generic types
- 🚀 **Performance optimized** - Efficient filtering algorithms
- 🛡️ **Robust validation** - Comprehensive input validation and error handling
- 🔧 **Extensible** - Support for custom predicates and nested field paths
- 📦 **Zero dependencies** - Lightweight and self-contained

The package exposes the `ArrayFilter` class for flexible, type-safe array filtering, along with comprehensive TypeScript types and logical operators for building complex filter schemes.

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

## Quick Start

### Basic Filtering

```ts
import { ArrayFilter, type FilterScheme, type OperatorNames } from '@talkohavy/filters';

const data = [
  { id: 1, name: 'John Doe', age: 30, department: 'Engineering' },
  { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing' },
  { id: 3, name: 'Bob Johnson', age: 35, department: 'Engineering' }
];

// Simple filter: Find engineers
const filterScheme: FilterScheme<OperatorNames> = [
  { fieldName: 'department', value: 'Engineering', operator: 'equal' }
];

const filter = new ArrayFilter(filterScheme);
const result = filter.applyFilters(data);
// Result: [{ id: 1, name: 'John Doe', ... }, { id: 3, name: 'Bob Johnson', ... }]
```

### Advanced Logical Operations

```ts
// Complex filter with AND/OR logic
const complexFilter: FilterScheme<OperatorNames> = [
  {
    OR: [
      { fieldName: 'department', value: 'Engineering', operator: 'equal' },
      {
        AND: [
          { fieldName: 'age', value: 30, operator: 'gte' },
          { fieldName: 'name', value: 'Jane', operator: 'startsWith' }
        ]
      }
    ]
  }
];

const complexResult = new ArrayFilter(complexFilter).applyFilters(data);
```

### NOT Operations

```ts
// Find non-engineers under 30
const notFilter: FilterScheme<OperatorNames> = [
  {
    NOT: [
      { fieldName: 'department', value: 'Engineering', operator: 'equal' }
    ]
  },
  { fieldName: 'age', value: 30, operator: 'lt' }
];

const notResult = new ArrayFilter(notFilter).applyFilters(data);
```

### Supported Operators

```ts
// Comparison operators
{ fieldName: 'age', value: 25, operator: 'gt' }         // greater than
{ fieldName: 'age', value: 30, operator: 'gte' }        // greater than or equal
{ fieldName: 'age', value: 35, operator: 'lt' }         // less than
{ fieldName: 'age', value: 40, operator: 'lte' }        // less than or equal
{ fieldName: 'name', value: 'John', operator: 'equal' }  // strict equality
{ fieldName: 'id', value: '1', operator: 'softEqual' }  // type-coerced equality

// String operators
{ fieldName: 'name', value: 'John', operator: 'startsWith' }
{ fieldName: 'name', value: 'Doe', operator: 'endsWith' }
{ fieldName: 'name', value: 'oh', operator: 'includes' }
{ fieldName: 'name', value: 'JOHN', operator: 'includesCaseInsensitive' }
{ fieldName: 'name', value: '^J.*n$', operator: 'regex' }

// Array and range operators
{ fieldName: 'age', value: [25, 35], operator: 'between' }
{ fieldName: 'department', value: ['Engineering', 'Marketing'], operator: 'in' }

// Existence and null checks
{ fieldName: 'email', operator: 'exists' }
{ fieldName: 'middleName', value: null, operator: 'isNull' }
{ fieldName: 'optionalField', value: null, operator: 'isNullish' }  // null or undefined
{ fieldName: 'active', value: true, operator: 'isTruthy' }
{ fieldName: 'disabled', value: false, operator: 'isFalsy' }

// Custom predicates
{
  fieldName: 'user',
  fn: (item) => item.user.permissions.includes('admin')
}
```

### Nested Field Paths

```ts
const nestedData = [
  { user: { profile: { name: 'John', settings: { theme: 'dark' } } } },
  { user: { profile: { name: 'Jane', settings: { theme: 'light' } } } }
];

// Access deeply nested properties
const nestedFilter: FilterScheme<OperatorNames> = [
  { fieldName: 'user.profile.settings.theme', value: 'dark', operator: 'equal' }
];
```

### Dynamic Schema Changes

```ts
const filter = new ArrayFilter(initialScheme);
const result1 = filter.applyFilters(data);

// Change the filter criteria dynamically
filter.changeSchema(newScheme);
const result2 = filter.applyFilters(data);
```

## API Reference

### Classes

#### `ArrayFilter<T>`

Main filtering class with full TypeScript generics support.

```ts
// Constructor
constructor(filterScheme: FilterScheme<OperatorNames>)

// Methods
applyFilters<T>(data: T[]): T[]           // Apply filters to data array
changeSchema(newScheme: FilterScheme): void  // Update filter criteria dynamically
```

### Types

#### Core Filter Types

```ts
FilterScheme<T>              // Main filter schema type
LeafFilter<T>               // Individual filter condition
OperatorLeafFilter<T>       // Operator-based filter with value
ExistsLeafFilter<T>         // Existence check filter
CustomPredicateLeafFilter<T> // Custom function-based filter
```

#### Logical Operation Types

```ts
AndFilter<T>    // AND logical operation
OrFilter<T>     // OR logical operation
NotFilter<T>    // NOT logical operation
```

#### Operator Types

```ts
OperatorNames            // All supported operator names union type
LogicalOperatorsValues   // 'AND' | 'OR' | 'NOT'
```

### Constants

#### `LogicalOperators`

```ts
{
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT'
} as const
```

### Error Classes

The library provides specific error types for better error handling:

```ts
SchemaValidationError  // Invalid filter schema
OperatorError         // Unknown or invalid operator
ParameterError        // Invalid parameter values
FieldPathError        // Invalid field path format
FilterError           // General filter errors
```

## Performance

The library is optimized for performance with:

- **Lazy evaluation** - Filters are only applied when needed
- **Efficient algorithms** - Optimized for large datasets
- **Memory efficient** - No unnecessary data copying
- **Benchmark tested** - Continuously tested against large datasets (100k+ items)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

[MIT](LICENSE)

[npm-url]: https://npmjs.com/package/@talkohavy/filters
[npm-version-image]: https://badge.fury.io/js/@talkohavy%2Ffilters.svg
