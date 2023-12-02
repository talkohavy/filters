export const data = [
  {
    id: 1,
    name: 'Dander Mente',
    type: 'customer',
    orders: {
      amount: 10,
    },
    address: 'NY USA',
    order: 'A4BC',
    tax: 145.2,
    total: 13.9,
  },
  {
    id: 2,
    name: 'Tracey Bill',
    type: 'customer',
    orders: {
      amount: 10,
      isVIP: null,
    },
    address: 'NJ USA',
    order: 'A8O7X',
    tax: 1.2,
    total: 93.46,
  },
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

// Questions:
// Design the filters parameter so you can filter the data by customer, tax, address, etc..
// For example: customer name starts with “Dan” and tax is >= 10
// Implement the  [[FILTER MECHANISM]] inside filterBy
