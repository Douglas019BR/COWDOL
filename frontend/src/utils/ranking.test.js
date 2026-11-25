import { describe, expect, it } from 'vitest';
import { holdingReturn, rankHoldings } from './ranking';

const holding = (symbol, purchaseTotal, balance) => ({
  symbol,
  purchase_total: purchaseTotal,
  balance,
});

describe('holdingReturn', () => {
  it('computes return as balance over invested value', () => {
    expect(holdingReturn(holding('A', 100, 25))).toBe(0.25);
    expect(holdingReturn(holding('A', 0, 25))).toBe(0);
  });
});

describe('rankHoldings', () => {
  it('returns the five best and five worst by return rate', () => {
    const holdings = Array.from({ length: 8 }, (_, index) =>
      holding(`A${index}`, 100, (index - 3) * 10),
    );
    const { best, worst } = rankHoldings(holdings);
    expect(best).toHaveLength(5);
    expect(worst).toHaveLength(5);
    expect(best[0].symbol).toBe('A7');
    expect(worst[0].symbol).toBe('A0');
  });

  it('handles fewer than five holdings and skips errors', () => {
    const holdings = [
      holding('A', 100, 10),
      holding('B', 100, -10),
      { symbol: 'C', error: 'failed', purchase_total: 0, balance: 0 },
    ];
    const { best, worst } = rankHoldings(holdings);
    expect(best.map((item) => item.symbol)).toEqual(['A', 'B']);
    expect(worst.map((item) => item.symbol)).toEqual(['B', 'A']);
  });

  it('returns empty lists for an empty portfolio', () => {
    expect(rankHoldings([])).toEqual({ best: [], worst: [] });
  });
});
