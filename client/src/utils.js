// Change this to your currency code, e.g. 'INR', 'EUR', 'GBP'
export const CURRENCY = 'USD';

export const money = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY }).format(n || 0);

export const number = (n) => new Intl.NumberFormat().format(n || 0);

// 'in' | 'low' | 'out'
export const statusOf = (p) => (p.quantity === 0 ? 'out' : p.quantity <= p.lowStockThreshold ? 'low' : 'in');
