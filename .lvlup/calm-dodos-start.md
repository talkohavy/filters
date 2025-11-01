---
"@talkohavy/filters": major
---

Major Release! 🎉 (breaking changes)

- Renamed types: ChildFilter --> LeafFilter
- Renamed Constants: RelationOperators --> LogicalOperators

New Features:

- Main type `FilterScheme` can now accept T as its operators enum list. Defaults to string.
- Added 5 utility functions you can import: `isLeafFilter`, `isGroupFilter`, `isAndFilter`, `isOrFilter`, `isNotFilter`.
- Better support in excluding keys. i.e. `NOT` & `AND` cannot co-exists at the same level of the same filter - now an appropriate error will be raised by the TS compiler.
