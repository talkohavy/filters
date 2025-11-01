import assert from 'assert/strict';
import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter, type OperatorNames } from '../src/index';
import { data } from './mocks/constants';

describe('ArrayFilter Class', () => {
  it('Simple single filter should pass', () => {
    const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: 'Tr', operator: 'startsWith' }];

    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    const expectedResult = [
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
    ];

    assert.deepStrictEqual(actual, expectedResult);
  });

  it('The implicit AND form filter should pass', () => {
    const filterScheme: FilterScheme<OperatorNames> = [
      { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
      { fieldName: 'total', value: 13.8, operator: 'gte' },
    ];

    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = [
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
    ];

    assert.deepStrictEqual(actual, expected);
  });

  it('The explicit AND form filter should pass', () => {
    const filterScheme: FilterScheme<OperatorNames> = [
      {
        AND: [
          { fieldName: 'total', operator: 'gt', value: 30 },
          { fieldName: 'total', operator: 'lt', value: 30.2 },
        ],
      },
    ];

    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = [
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

    assert.deepStrictEqual(actual, expected);
  });

  it('Complex filter with AND & OR', () => {
    const filterScheme: FilterScheme<OperatorNames> = [
      {
        AND: [
          { fieldName: 'total', operator: 'gt', value: 50 },
          {
            OR: [
              { fieldName: 'name', operator: 'startsWith', value: 'Da' },
              {
                AND: [
                  { fieldName: 'name', operator: 'startsWith', value: 'Tr' },
                  { fieldName: 'id', operator: 'equal', value: 2 },
                  { fieldName: 'orders.isVIP', operator: 'keyExists' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = [
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
    ];

    assert.deepStrictEqual(actual, expected);
  });

  it('Changing schema should pass', () => {
    const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: 'Tr', operator: 'startsWith' }];

    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = [
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
    ];

    assert.deepStrictEqual(actual, expected);

    const filterScheme2: FilterScheme<OperatorNames> = [
      { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
      { fieldName: 'total', value: 13.8, operator: 'gte' },
    ];

    const expected2 = [
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
    ];

    filterer.changeSchema(filterScheme2);
    const actual2 = filterer.applyFilters(data);

    assert.deepStrictEqual(actual2, expected2);
  });

  // Note: Individual operator tests moved to specialized files (between.test.ts, in.test.ts, etc.)
  // This keeps ArrayFilter.test.ts focused on core functionality and logical combinations

  describe('Nested Field Path Tests', () => {
    it('should filter on nested object properties', () => {
      const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'orders.amount', value: 10, operator: 'equal' }];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 2);
      assert(actual.every((item) => item.orders?.amount === 10));
    });

    it('should handle deeply nested paths', () => {
      const testData = [
        { id: 1, user: { profile: { settings: { theme: 'dark' } } } },
        { id: 2, user: { profile: { settings: { theme: 'light' } } } },
        { id: 3, user: { profile: { settings: { theme: 'dark' } } } },
      ];

      const filterScheme: FilterScheme<OperatorNames> = [
        { fieldName: 'user.profile.settings.theme', value: 'dark', operator: 'equal' },
      ];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(testData);

      assert.strictEqual(actual.length, 2);
      assert(actual.every((item) => item.user.profile.settings.theme === 'dark'));
    });

    it('should handle missing nested properties gracefully', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        { fieldName: 'nonexistent.property', value: 'test', operator: 'equal' },
      ];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 0);
    });
  });

  describe('Complex Logical Combinations', () => {
    it('should handle nested AND groups', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          AND: [
            { fieldName: 'type', value: 'customer', operator: 'equal' },
            {
              AND: [
                { fieldName: 'total', value: 50, operator: 'gte' },
                { fieldName: 'tax', value: 100, operator: 'lte' },
              ],
            },
          ],
        },
      ];

      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 1);
      assert.strictEqual(actual[0].name, 'Tracey Bill');
    });

    it('should handle nested OR groups', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          OR: [
            { fieldName: 'name', value: 'Gina', operator: 'startsWith' },
            {
              OR: [
                { fieldName: 'total', value: 100, operator: 'gte' },
                { fieldName: 'tax', value: 10, operator: 'lte' },
              ],
            },
          ],
        },
      ];

      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 2);
    });

    it('should handle mixed AND/OR with multiple levels', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          AND: [
            {
              OR: [
                { fieldName: 'type', value: 'customer', operator: 'equal' },
                { fieldName: 'type', value: 'worker', operator: 'equal' },
              ],
            },
            {
              AND: [
                { fieldName: 'total', value: 10, operator: 'gte' },
                { fieldName: 'id', value: 3, operator: 'lte' },
              ],
            },
          ],
        },
      ];

      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 3);
    });

    it('should handle NOT operator', () => {
      const filterScheme: FilterScheme<OperatorNames> = [
        {
          NOT: [{ fieldName: 'type', value: 'customer', operator: 'equal' }],
        },
      ];

      const filterer = new ArrayFilter(filterScheme);

      const actualResult = filterer.applyFilters(data);
      const expectedResult = [
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

      assert.deepEqual(actualResult, expectedResult);
    });
  });

  describe('Essential Edge Cases', () => {
    it('should handle empty filter scheme', () => {
      const filterScheme: FilterScheme<OperatorNames> = [];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.deepStrictEqual(actual, data);
    });

    it('should handle empty data array', () => {
      const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: 'test', operator: 'equal' }];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters([]);

      assert.deepStrictEqual(actual, []);
    });
  });
});
