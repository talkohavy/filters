import assert from 'assert/strict';
import { ArrayFilter } from '../src/index';
import { data } from './mocks/constants';
import type { FilterScheme } from '../src/FilterScheme/types';

describe('regex operator', () => {
  it('should filter items where string matches regex pattern (RegExp)', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'name', value: /^Tr/, operator: 'regex' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    const expected = data.filter((item: any) => /^Tr/.test(item.name));
    assert.deepStrictEqual(actual, expected);
  });

  it('should filter items where string matches regex pattern (string)', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'name', value: '^Tr', operator: 'regex' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    const expected = data.filter((item: any) => /^Tr/.test(item.name));
    assert.deepStrictEqual(actual, expected);
  });

  it('should return no items if no match', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'name', value: 'ZZZ$', operator: 'regex' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    assert.deepStrictEqual(actual, []);
  });

  it('should handle non-string itemValue gracefully', () => {
    const filterScheme: FilterScheme = [{ fieldName: 'id', value: '^1', operator: 'regex' }];
    const filterer = new ArrayFilter(filterScheme);
    const actual = filterer.applyFilters(data);
    // Should return no items, as id is not a string
    assert.deepStrictEqual(actual, []);
  });
});
