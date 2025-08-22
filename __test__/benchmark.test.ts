import { Filterer } from '../src/index';
import { data } from './mocks/constants';
import type { FilterScheme } from '../src/types';

function generateLargeDataset(size: number) {
  const base = data[0];
  const arr: any[] = [];
  for (let i = 0; i < size; i++) {
    arr.push({ ...base, id: i, total: Math.random() * 100 });
  }
  return arr;
}

describe('Filterer Performance Benchmarks', () => {
  it('should filter 100,000 items efficiently (timing output)', () => {
    const largeData = generateLargeDataset(100_000);
    const filterScheme: FilterScheme = [
      { fieldName: 'total', value: [10, 90], operator: 'between' },
      { fieldName: 'id', value: 50000, operator: 'gte' },
    ];
    const filterer = new Filterer(filterScheme);
    const iterations = 5;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      filterer.applyFilters({ data: largeData });
    }
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    // Output timing info in test results
    console.log(`Large dataset filter: ${duration}ms for ${iterations} iterations on ${largeData.length} items`);
    expect(duration).toBeDefined();
  });
  // Add more benchmarks for different operators or filter schemes here
});
