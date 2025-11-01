import assert from 'assert/strict';
import type { FilterScheme } from '../src/FilterScheme/types';
import { ArrayFilter } from '../src/index';
import { data } from './mocks/constants';

describe('in operator', () => {
  it('should filter items where value is in array', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'type', value: ['customer', 'worker'], operator: 'in' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = data.filter((item: any) => ['customer', 'worker'].includes(item.type));

    assert.deepStrictEqual(actual, expected);
  });

  it('should return no items if value array is empty', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'type', value: [], operator: 'in' }];
    const filterer = new ArrayFilter(filterScheme);

    const actual = filterer.applyFilters(data);

    assert.deepStrictEqual(actual, []);
  });

  it('should handle non-array value gracefully', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'type', value: 'customer', operator: 'in' }];
    const filterer = new ArrayFilter(filterScheme);

    const actual = filterer.applyFilters(data);

    // Should return no items, as value is not an array
    assert.deepStrictEqual(actual, []);
  });

  it('should work for numbers', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'id', value: [1, 3], operator: 'in' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);

    const expected = data.filter((item: any) => [1, 3].includes(item.id));

    assert.deepStrictEqual(actual, expected);
  });
});
