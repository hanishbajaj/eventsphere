// utils/currency.js — Centralized INR currency formatting for EventSphere

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const INR_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as INR currency.
 * e.g. 1500 → "₹1,500"
 * e.g. 0    → "Free"
 */
export function formatCurrency(value, { showFree = false } = {}) {
  if (showFree && (value === 0 || value === '0')) return 'Free';
  return INR.format(Number(value) || 0);
}

/**
 * Format with decimals: e.g. 1500.50 → "₹1,500.50"
 */
export function formatCurrencyDecimal(value) {
  return INR_DECIMAL.format(Number(value) || 0);
}

/**
 * Short form for large numbers: e.g. 150000 → "₹1.5L"
 */
export function formatCurrencyShort(value) {
  const num = Number(value) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

/** Just the rupee symbol prefix — for inline use */
export const CURRENCY_SYMBOL = '₹';