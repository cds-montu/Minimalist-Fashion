// Single source of truth for how prices are rendered in the UI.
export const PRICE_PLACEHOLDER = '-';

export function formatPrice(amount, { fallback = PRICE_PLACEHOLDER } = {}) {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return `$${value.toFixed(2)}`;
}

export function formatLineTotal(price, qty = 1, options) {
  const value = Number(price) * Number(qty);
  return formatPrice(Number.isFinite(value) ? value : null, options);
}
