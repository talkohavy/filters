---
"@talkohavy/filters": major
---

Major Version! New release with breaking changes.
- **Renamed main class**: Main class is now called `ArrayFilter` (renamed from Filterer)
- **Full TypeScript Support**! 🚀 A helper type called `FilterScheme` will help you build the filter you want
- **Filter validation**: we now have inner validation to make sure the provided filter scheme is correct
- **Error handling**: the package now has inner error handling with clear messages
- **Operators**: are now extracted to their own class. We gave you `OperatorNames` type to use when choosing an operator.
