import { describe, expect, it } from 'vitest';
import { calculateTotals, formatCurrency } from './portfolio';

describe('calculateTotals', () => {
  it('sums all portfolio values', () => {
    const holdings = [
      {
        purchase_total: 100,
        current_value: 120,
        total_dividends: 10,
        balance: 30,
      },
      {
        purchase_total: 50,
        current_value: 40,
        total_dividends: 2,
        balance: -8,
      },
    ];
    expect(calculateTotals(holdings)).toEqual({
      invested: 150,
      current: 160,
      dividends: 12,
      profitLoss: 22,
    });
  });

  it('returns zeros for an empty portfolio', () => {
    expect(calculateTotals([])).toEqual({
      invested: 0,
      current: 0,
      dividends: 0,
      profitLoss: 0,
    });
  });
});

describe('formatCurrency', () => {
  it('formats values as Brazilian reais', () => {
    expect(formatCurrency(1234.5)).toContain('R$');
    expect(formatCurrency(1234.5)).toContain('1.234,50');
  });
});
