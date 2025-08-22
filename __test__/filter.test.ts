import assert from 'assert/strict';
import { Filterer } from '../src/index';
import { data } from './mocks/constants';
import type { FilterScheme } from '../src/types';

describe('Filterer Class', () => {
  it('Simple single filter should pass', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'name', value: 'Tr', operator: 'startsWith' }];

    const filterer = new Filterer(filterScheme);
    const actual = filterer.applyFilters({ data });

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

  it('The implicit AND form filter should pass', () => {
    const filterScheme: FilterScheme = [
      { fieldName: 'name', value: 'Dan', operator: 'startsWith' },
      { fieldName: 'total', value: 13.8, operator: 'gte' },
    ];

    const filterer = new Filterer(filterScheme);
    const actual = filterer.applyFilters({ data });

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
    const filterScheme: FilterScheme = [
      {
        AND: [
          { fieldName: 'total', operator: 'gt', value: 30 },
          { fieldName: 'total', operator: 'lt', value: 30.2 },
        ],
      },
    ];

    const filterer = new Filterer(filterScheme);
    const actual = filterer.applyFilters({ data });

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
    const filterScheme: FilterScheme = [
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
                  { fieldName: 'orders', operator: 'exists', key: 'isVIP' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const filterer = new Filterer(filterScheme);
    const actual = filterer.applyFilters({ data });

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
    const filterScheme: FilterScheme = [{ fieldName: 'name', value: 'Tr', operator: 'startsWith' }];

    const filterer = new Filterer(filterScheme);
    const actual = filterer.applyFilters({ data });

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

    const filterScheme2: FilterScheme = [
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
    const actual2 = filterer.applyFilters({ data });

    assert.deepStrictEqual(actual2, expected2);
  });
});
