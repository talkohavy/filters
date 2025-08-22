# Migration Guide: v2.x Breaking Changes

## Overview

This guide helps you migrate from v1.x to v2.x of @talkohavy/filters, covering breaking changes, new features, and updated usage patterns.

## Breaking Changes

- **Operator Registry:** All operators are now managed in a registry. Custom operators must be registered explicitly.
- **TypeScript Types:** All types are stricter; `any` types are removed. Update your code to use the new generic types.
- **Error Handling:** Errors are now thrown as custom classes (`SchemaValidationError`, `OperatorError`, etc.). Catch and handle these in your code.
- **Memoization:** Filtering is now memoized for performance. If you rely on side effects in filter functions, refactor to avoid them.

## New Features

- `notEqual`, `between`, `in`, and `regex` operators
- Utility extraction for value access
- Performance optimizations (memoization, field path caching)
- Benchmarking and performance tests

## Migration Steps

1. **Update Imports:**
   - Use `import { Filterer } from '@talkohavy/filters'`.
2. **Update Filter Schemes:**
   - Use new operators as needed:
     ```ts
     { fieldName: 'type', value: 'customer', operator: 'notEqual' }
     { fieldName: 'total', value: [10, 50], operator: 'between' }
     { fieldName: 'type', value: ['customer', 'worker'], operator: 'in' }
     { fieldName: 'name', value: '^Tr', operator: 'regex' }
     ```
3. **Handle Errors:**
   - Catch custom error classes for better diagnostics.
4. **TypeScript:**
   - Update your code to use the new generic types for `FilterScheme`, etc.
5. **Performance:**
   - Filtering is faster; you may want to benchmark your own use cases.

## Compatibility Matrix

| Feature/Operator  | v1.x | v2.x |
| ----------------- | ---- | ---- |
| `notEqual`        | ❌   | ✅   |
| `between`         | ❌   | ✅   |
| `in`              | ❌   | ✅   |
| `regex`           | ❌   | ✅   |
| Memoization       | ❌   | ✅   |
| Custom Errors     | ❌   | ✅   |
| TypeScript Strict | ❌   | ✅   |

## Example Migration

```ts
// v1.x
const filterer = new Filterer([{ fieldName: 'name', value: 'Dan', operator: 'startsWith' }]);

// v2.x
const filterer = new Filterer([{ fieldName: 'name', value: 'Dan', operator: 'startsWith' }]);
// Now you can use new operators and get better error handling
```

## Questions?

Open an issue on GitHub or contact the maintainer for migration help.
