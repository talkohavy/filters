import { data } from './dummyData.js';
import { Filterer } from './Filterer.js';

/** @typedef {import('./types/index.js').Filter} Filter */

/** @type {Filter} */
const filterScheme1 = [
  { fieldName: 'name', value: 'Tr', operator: 'startsWith' },
  { fieldName: 'total', value: 50, operator: 'gt' },
  // Same result as:
  // {
  //   AND: [
  //     { fieldName: 'name', operator: 'startsWith', value: 'Tr' },
  //     { fieldName: 'total', operator: 'gt', value: 50 },
  //   ],
  // },
];

/** @type {Filter} */
const filterScheme2 = [
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

/** @type {Filter} */
const filterScheme0 = [{ fieldName: 'name', value: 'Gi', operator: 'startsWith' }];

console.log('data is:', data);

const filterer = new Filterer({ filterScheme: filterScheme0 });
const filteredData = filterer.applyFilters({ data });
console.log('filteredData after filter 1:', filteredData);

filterer.changeSchema({ filterScheme: filterScheme2 });
const filteredDataAfterSchemeChange = filterer.applyFilters({ data });
console.log('filteredData after filter 2:', filteredDataAfterSchemeChange);
