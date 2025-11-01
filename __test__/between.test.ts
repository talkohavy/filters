import assert from 'assert/strict';
import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter } from '../src/index';
import { data } from './mocks/constants';

describe('between operator', () => {
  it('should filter items where value is between two bounds (inclusive)', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'total', value: [30, 100], operator: 'between' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    const expected = data.filter((item: any) => item.total >= 30 && item.total <= 100);

    assert.deepStrictEqual(actual, expected);
  });

  it('should return no items if no values are in range', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'total', value: [1000, 2000], operator: 'between' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    assert.deepStrictEqual(actual, []);
  });

  it('should handle reversed bounds', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'total', value: [100, 30], operator: 'between' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    // Should return no items, as min > max
    assert.deepStrictEqual(actual, []);
  });

  it('should handle non-array value gracefully', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'total', value: 50, operator: 'between' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    // Should return no items, as value is not an array
    assert.deepStrictEqual(actual, []);
  });
});
