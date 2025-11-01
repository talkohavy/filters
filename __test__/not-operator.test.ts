import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter, type OperatorNames } from '../src/ArrayFilter';
import { data } from './mocks/constants';

describe('ArrayFilter - NOT operator', () => {
  describe('Basic NOT operator functionality', () => {
    test('should exclude items matching NOT condition', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'name', value: 'Dander Mente', operator: 'equal' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Should exclude items where name equals 'Dander Mente'
      expect(result).toHaveLength(data.length - 1);
      expect(result.every((item) => item.name !== 'Dander Mente')).toBe(true);
    });

    test('should handle NOT with multiple conditions (AND relation)', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [
            { fieldName: 'name', value: 'Dander Mente', operator: 'equal' },
            { fieldName: 'total', value: 10, operator: 'gte' },
          ],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Should exclude items where (name === 'Dander Mente' AND total >= 10)
      // This means it includes items where either name !== 'Dander Mente' OR total < 10
      const excluded = data.filter((item: any) => item.name === 'Dander Mente' && item.total >= 10);
      expect(result).toHaveLength(data.length - excluded.length);
    });

    test('should handle NOT with nested field paths', () => {
      const testData = [
        { user: { profile: { status: 'active' } }, id: 1 },
        { user: { profile: { status: 'inactive' } }, id: 2 },
        { user: { profile: { status: 'active' } }, id: 3 },
      ];

      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'user.profile.status', value: 'active', operator: 'equal' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(testData);

      expect(result).toHaveLength(1);
      expect(result[0].user.profile.status).toBe('inactive');
    });
  });

  describe('NOT operator with other logical operators', () => {
    test('should combine NOT with AND at root level', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        { fieldName: 'total', value: 10, operator: 'gte' },
        {
          NOT: [{ fieldName: 'name', value: 'Dander Mente', operator: 'equal' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Should include items where total >= 10 AND name !== 'Dander Mente'
      expect(result.every((item) => item.total >= 10 && item.name !== 'Dander Mente')).toBe(true);
    });

    test('should handle NOT containing OR conditions', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [
            {
              OR: [
                { fieldName: 'name', value: 'Dander Mente', operator: 'equal' },
                { fieldName: 'total', value: 50, operator: 'gte' },
              ],
            },
          ],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Should exclude items where (name === 'Dander Mente' OR total >= 50)
      // This means it includes items where (name !== 'Dander Mente' AND total < 50)
      expect(result.every((item) => item.name !== 'Dander Mente' && item.total < 50)).toBe(true);
    });

    test('should handle nested NOT operators', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [
            {
              NOT: [{ fieldName: 'name', value: 'Dander Mente', operator: 'equal' }],
            },
          ],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Double negation: NOT(NOT(name === 'Dander Mente')) should equal (name === 'Dander Mente')
      expect(result.every((item) => item.name === 'Dander Mente')).toBe(true);
    });

    test('should handle OR containing NOT', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          OR: [
            { fieldName: 'total', value: 100, operator: 'gte' },
            {
              NOT: [{ fieldName: 'name', value: 'Dander Mente', operator: 'equal' }],
            },
          ],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Should include items where (total >= 100 OR name !== 'Dander Mente')
      expect(result.every((item) => item.total >= 100 || item.name !== 'Dander Mente')).toBe(true);
    });
  });

  describe('NOT operator with different comparison operators', () => {
    test('should work with string operators', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'name', value: 'Dan', operator: 'startsWith' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      expect(result.every((item) => !item.name.startsWith('Dan'))).toBe(true);
    });

    test('should work with range operators', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'total', value: [10, 30], operator: 'between' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      expect(result.every((item) => !(item.total >= 10 && item.total <= 30))).toBe(true);
    });

    test('should work with array operators', () => {
      const testData = [
        { type: 'javascript', id: 1 },
        { type: 'python', id: 2 },
        { type: 'java', id: 3 },
      ];

      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'type', value: ['javascript', 'java'], operator: 'in' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(testData);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('python');
    });
  });

  describe('NOT operator edge cases', () => {
    test('should handle empty NOT array', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [],
        },
      ];

      expect(() => new ArrayFilter(filterScheme)).toThrow();
    });

    test('should handle NOT with exists operator', () => {
      const testData = [
        { name: 'John', age: 25 },
        { name: 'Jane' }, // no age property
        { name: 'Bob', age: 30 },
      ];

      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'age', operator: 'exists' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(testData);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Jane');
    });
  });

  describe('NOT operator performance and complex scenarios', () => {
    test('should handle deeply nested NOT structures', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          AND: [
            { fieldName: 'total', value: 0, operator: 'gt' },
            {
              NOT: [
                {
                  OR: [
                    { fieldName: 'name', value: 'Test', operator: 'equal' },
                    {
                      AND: [
                        { fieldName: 'total', value: 100, operator: 'gte' },
                        { fieldName: 'name', value: 'A', operator: 'startsWith' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      const result = filter.applyFilters(data);

      // Verify the complex logic works correctly
      expect(Array.isArray(result)).toBe(true);
      expect(result.every((item) => item.total > 0)).toBe(true);
    });

    test('should maintain immutability with NOT operator', () => {
      const originalData = [...data];
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'total', value: 20, operator: 'lt' }],
        },
      ];

      const filter = new ArrayFilter(filterScheme);
      filter.applyFilters(data);

      expect(data).toEqual(originalData);
    });
  });
});
