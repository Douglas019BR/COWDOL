import { describe, expect, it } from 'vitest';
import { parseCurrencyResponse } from './currencies';

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
});
