import { describe, expect, it } from 'vitest';
import { formatBid, parseCurrencyResponse } from './currencies';

describe('parseCurrencyResponse', () => {
  it('returns only valid quotes', () => {
    const response = {
      USDBRL: { bid: '5.12', pctChange: '0.5' },
      EURBRL: { bid: '5.90', pctChange: '-0.3' },
      BTCBRL: { bid: 'not-a-number', pctChange: '1' },
    };
    expect(parseCurrencyResponse(response)).toEqual([
      { code: 'USD', bid: 5.12, variation: 0.5 },
      { code: 'EUR', bid: 5.9, variation: -0.3 },
    ]);
  });

  it('handles missing or empty responses', () => {
    expect(parseCurrencyResponse(null)).toEqual([]);
    expect(parseCurrencyResponse({})).toEqual([]);
  });

  it('rejects null and blank bids', () => {
    expect(
      parseCurrencyResponse({
        USDBRL: { bid: null, pctChange: '1' },
        EURBRL: { bid: '   ', pctChange: '1' },
        GBPBRL: { bid: '5.00', pctChange: '0' },
      }),
    ).toEqual([{ code: 'GBP', bid: 5, variation: 0 }]);
  });
});

describe('formatBid', () => {
  it('keeps precision for sub-cent quotes', () => {
    expect(formatBid(0.0035)).toBe('0.0035');
    expect(formatBid(5.1234)).toBe('5.12');
  });
});
