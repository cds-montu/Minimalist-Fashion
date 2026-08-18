import {
  formatCurrency,
  formatDate,
  formatPercentage,
  truncateText,
  formatNumber,
  formatStockStatus,
  formatWeight,
  formatDimensions,
} from 'utils/formatters';

describe('formatCurrency', () => {
  it('formats numbers with two fraction digits by default', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('supports other currencies', () => {
    expect(formatCurrency(10, 'EUR')).toBe('€10.00');
  });

  it('allows overriding Intl options', () => {
    expect(formatCurrency(10.567, 'USD', { maximumFractionDigits: 1, minimumFractionDigits: 1 })).toBe('$10.6');
  });

  it('returns an empty string for non-numeric input', () => {
    expect(formatCurrency('10')).toBe('');
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats a Date instance', () => {
    expect(formatDate(new Date('2024-03-15T12:00:00Z'))).toBe('Mar 15, 2024');
  });

  it('formats date strings and timestamps', () => {
    expect(formatDate('2024-03-15T12:00:00Z')).toBe('Mar 15, 2024');
    expect(formatDate(Date.UTC(2024, 2, 15, 12))).toBe('Mar 15, 2024');
  });

  it('honours custom options', () => {
    expect(formatDate('2024-03-15T12:00:00Z', { month: 'long', day: undefined })).toBe('March 2024');
  });

  it('returns an empty string for falsy dates', () => {
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDate(0)).toBe('');
  });
});

describe('formatPercentage', () => {
  it('converts a ratio to a percentage', () => {
    expect(formatPercentage(0.25)).toBe('25%');
  });

  it('respects the decimals argument', () => {
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
  });

  it('falls back to 0% for non-numeric input', () => {
    expect(formatPercentage('0.5')).toBe('0%');
    expect(formatPercentage(null)).toBe('0%');
  });
});

describe('truncateText', () => {
  it('returns the text unchanged when short enough', () => {
    expect(truncateText('short', 10)).toBe('short');
    expect(truncateText('exact', 5)).toBe('exact');
  });

  it('truncates and appends the ellipsis', () => {
    expect(truncateText('abcdefghij', 4)).toBe('abcd...');
  });

  it('supports a custom ellipsis', () => {
    expect(truncateText('abcdefghij', 3, '…')).toBe('abc…');
  });

  it('returns an empty string for non-string input', () => {
    expect(truncateText(42)).toBe('');
    expect(truncateText(null)).toBe('');
  });

  it('defaults to an empty string with no arguments', () => {
    expect(truncateText()).toBe('');
  });
});

describe('formatNumber', () => {
  it('adds thousand separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('accepts numeric strings', () => {
    expect(formatNumber('1234')).toBe('1,234');
  });

  it('returns "0" for null or undefined', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
  });
});

describe('formatStockStatus', () => {
  it.each([
    ['in_stock', 'In Stock', 'success'],
    ['out_of_stock', 'Out of Stock', 'error'],
    ['pre_order', 'Pre-order', 'info'],
    ['backorder', 'Backorder', 'warning'],
    ['discontinued', 'Discontinued', 'default'],
  ])('maps %s', (status, text, color) => {
    expect(formatStockStatus(status)).toEqual({ text, color });
  });

  it('echoes unknown statuses with the default color', () => {
    expect(formatStockStatus('unknown')).toEqual({ text: 'unknown', color: 'default' });
    expect(formatStockStatus(undefined)).toEqual({ text: undefined, color: 'default' });
  });
});

describe('formatWeight', () => {
  it('defaults to grams', () => {
    expect(formatWeight(500)).toBe('500 g');
  });

  it('supports known units', () => {
    expect(formatWeight(2, 'kg')).toBe('2 kg');
    expect(formatWeight(2, 'lb')).toBe('2 lb');
  });

  it('passes through unknown units', () => {
    expect(formatWeight(2, 'ton')).toBe('2 ton');
  });

  it('returns an empty string for non-numeric weights', () => {
    expect(formatWeight('500')).toBe('');
    expect(formatWeight(undefined)).toBe('');
  });
});

describe('formatDimensions', () => {
  it('formats complete dimensions', () => {
    expect(formatDimensions({ length: 10, width: 5, height: 2 })).toBe('10 × 5 × 2 cm');
  });

  it('supports a custom unit', () => {
    expect(formatDimensions({ length: 1, width: 2, height: 3 }, 'in')).toBe('1 × 2 × 3 in');
  });

  it('returns an empty string when a dimension is missing or zero', () => {
    expect(formatDimensions({ length: 10, width: 5 })).toBe('');
    expect(formatDimensions({ length: 10, width: 0, height: 2 })).toBe('');
    expect(formatDimensions()).toBe('');
  });
});
