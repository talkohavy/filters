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

  describe('Individual Comparison Operators', () => {
    describe('Equality Operators', () => {
      it('should filter using "equal" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'id', value: 1, operator: 'equal' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].id, 1);
      });

      it('should filter using "equals" operator (alias)', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'type', value: 'worker', operator: 'equals' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Gina Doe');
      });

      it('should filter using "softEqual" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'id', value: '1', operator: 'softEqual' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].id, 1);
      });
    });

    describe('Numeric Operators', () => {
      it('should filter using "gt" (greater than) operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'total', value: 20, operator: 'gt' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.total > 20));
      });

      it('should filter using "gte" (greater than or equal) operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'total', value: 30.1, operator: 'gte' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.total >= 30.1));
      });

      it('should filter using "lt" (less than) operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'total', value: 50, operator: 'lt' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.total < 50));
      });

      it('should filter using "lte" (less than or equal) operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'tax', value: 75.6, operator: 'lte' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.tax <= 75.6));
      });
    });

    describe('String Operators', () => {
      it('should filter using "startsWith" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: 'Dan', operator: 'startsWith' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Dander Mente');
      });

      it('should filter using "endsWith" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: 'Doe', operator: 'endsWith' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Gina Doe');
      });

      it('should filter using "includes" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'address', value: 'USA', operator: 'includes' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 3);
        assert(actual.every((item) => item.address.includes('USA')));
      });

      it('should filter using "includesCaseInsensitive" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'name', value: 'BILL', operator: 'includesCaseInsensitive' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Tracey Bill');
      });
    });

    describe('Special Value Operators', () => {
      it('should filter using "isEmptyString" operator', () => {
        const testData = [...data, { id: 4, name: '', type: 'test', address: 'Test', tax: 0, total: 0 }];
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'name', value: '', operator: 'isEmptyString' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(testData);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, '');
      });

      it('should filter using "isNull" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'orders.isVIP', value: null, operator: 'isNull' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Tracey Bill');
      });

      it('should filter using "isNullish" operator for null values', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'orders.isVIP', value: null, operator: 'isNullish' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        // isNullish should find both null and undefined values
        // Item 2 (Tracey Bill) has orders.isVIP: null
        // Item 1 (Dander Mente) has no isVIP property (undefined)
        // Item 3 (Gina Doe) has no orders property (orders.isVIP is undefined)
        assert.strictEqual(actual.length, 3);
        const names = actual.map((item) => item.name).sort();
        assert.deepStrictEqual(names, ['Dander Mente', 'Gina Doe', 'Tracey Bill']);
      });

      it('should filter using "isNullish" operator for undefined values', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'orders', value: undefined, operator: 'isNullish' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].name, 'Gina Doe');
      });

      it('should filter using "isTruthy" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'orders.amount', value: true, operator: 'isTruthy' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.orders?.amount));
      });

      it('should filter using "exists" operator (alias for isTruthy)', () => {
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'orders', operator: 'exists' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => item.orders));
      });

      it('should filter using "isFalsy" operator', () => {
        const testData = [...data, { id: 4, name: 'Test', type: 'test', address: '', tax: 0, total: 0 }];
        const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'address', value: false, operator: 'isFalsy' }];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(testData);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].address, '');
      });
    });

    describe('Complex Operators', () => {
      it('should filter using "keyExists" operator', () => {
        const filterScheme: FilterScheme<OperatorNames> = [
          { fieldName: 'orders', value: 'amount', operator: 'keyExists' },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 2);
        assert(actual.every((item) => 'amount' in (item.orders || {})));
      });

      it('should filter using "applyNot" operator', () => {
        // applyNot is a higher-order function, not used directly in filter schemes
        // Instead, use the NOT property for negation
        const filterScheme: FilterScheme<OperatorNames> = [
          {
            fieldName: 'type',
            value: 'customer',
            operator: 'equal',
            NOT: true,
          },
        ];
        const filterer = new ArrayFilter(filterScheme);
        const actual = filterer.applyFilters(data);

        assert.strictEqual(actual.length, 1);
        assert.strictEqual(actual[0].type, 'worker');
      });
    });
  });

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

  describe('Edge Cases and Error Handling', () => {
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

    it('should handle null/undefined filter values appropriately', () => {
      const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'orders.isVIP', value: null, operator: 'equal' }];
      const filterer = new ArrayFilter(filterScheme);
      const actual = filterer.applyFilters(data);

      assert.strictEqual(actual.length, 1);
      assert.strictEqual((actual as any)[0].orders.isVIP, null);
    });
  });
});
