import assert from 'assert/strict';
import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter, type OperatorNames } from '../src/index';
import { data } from './mocks/constants';

describe('notEqual operator', () => {
  it('should filter items where field is not equal to value', () => {
    const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'type', value: 'customer', operator: 'notEqual' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    // All items except those with type === 'customer'

    const expected = data.filter((item: any) => item.type !== 'customer');

    assert.deepStrictEqual(actual, expected);
  });

  it('should handle strict inequality for numbers', () => {
    const filterScheme: FilterScheme<OperatorNames> = [{ fieldName: 'id', value: 1, operator: 'notEqual' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = data.filter((item: any) => item.id !== 1);

    assert.deepStrictEqual(actual, expected);
  });

  it('should handle strict inequality for null values', () => {
    const filterScheme: FilterScheme<OperatorNames> = [
      { fieldName: 'orders.isVIP', value: null, operator: 'notEqual' },
    ];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = data.filter((item: any) => item.orders?.isVIP !== null);

    assert.deepStrictEqual(actual, expected);
  });
});
