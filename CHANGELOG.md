# @talkohavy/filters

## 3.0.0

### Major Changes

- Major Release! 🎉 (breaking changes)
  
- Renamed types: ChildFilter --> LeafFilter
- Renamed Constants: RelationOperators --> LogicalOperators

New Features:

- Main type `FilterScheme` can now accept T as its operators enum list. Defaults to string.
- Added 5 utility functions you can import: `isLeafFilter`, `isGroupFilter`, `isAndFilter`, `isOrFilter`, `isNotFilter`.
- Better support in excluding keys. i.e. `NOT` & `AND` cannot co-exists at the same level of the same filter - now an appropriate error will be raised by the TS compiler.

### Patch Changes

- FilterScheme now accepts a T for its operators names. Fallback type is string. You can pass here operator enum values for better type safety.

## 2.0.2

### Patch Changes

- Export 3 more types: NotFilter, AndFilter, & OrFilter.

## 2.0.1

### Patch Changes

- Renamed RecursiveFilter to just Filter.
- Filters now support NOT.
- Now exporting the type Filter, which is more specific than FilterScheme. Useful for when wanting to define the type of an item inside a FilterScheme array.

## 2.0.0

### Major Changes

- Major Version! New release with breaking changes.
  - **Renamed main class**: Main class is now called `ArrayFilter` (renamed from Filterer)
- **Full TypeScript Support**! 🚀 A helper type called `FilterScheme` will help you build the filter you want
- **Filter validation**: we now have inner validation to make sure the provided filter scheme is correct
- **Error handling**: the package now has inner error handling with clear messages
- **Operators**: are now extracted to their own class. We gave you `OperatorNames` type to use when choosing an operator.

### Patch Changes

- Changed the Filterer construcor.

## 1.0.34

### Patch Changes

- project is ready to be published as typescript with lvlup

## 1.0.33

### Patch Changes

- added lvlup to the project

## 1.0.32

### Patch Changes

- added lvlup to the project

## 1.0.31

### Patch Changes

- a5fbe3d: fixed issue with types

## 1.0.30

### Patch Changes

- d9ba0b7: using changesets/cli now

## 1.0.29

### Patch Changes

- 69147a5: forgot to add .changeset directory to npmignore

## 1.0.28

### Patch Changes

- 7d24def: using changesets now to handle versioning
