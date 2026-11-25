import { describe, expect, it } from 'vitest';
import {
  recommendFunds,
  scoreFund,
} from './recommendations';

const fund = (symbol, balance, dividends) => ({
  symbol,
  purchase_total: 1000,
  balance,
  total_dividends: dividends,
});

describe('scoreFund', () => {
  it('weights return at 60% and dividends at 40%', () => {
    expect(scoreFund(fund('A', 100, 50))).toBeCloseTo(0.6 * 0.1 + 0.4 * 0.05);
  });

  it('handles zero invested value', () => {
    expect(scoreFund({ purchase_total: 0, balance: 10, total_dividends: 0 })).toBe(6);
  });
});

describe('recommendFunds', () => {
  it('ranks funds by score and labels weak ones for review', () => {
    const holdings = [
      fund('A', 100, 50),
      fund('B', -100, 0),
      fund('C', 0, 100),
      { symbol: 'X', error: 'failed', purchase_total: 0, balance: 0, total_dividends: 0 },
    ];
    const result = recommendFunds(holdings, 3);
    expect(result.map((item) => item.symbol)).toEqual(['A', 'C', 'B']);
    expect(result[2].reason).toBe('review');
  });

  it('aggregates repeated symbols before applying the limit', () => {
    const holdings = [
      fund('A', 100, 50),
      fund('A', 100, 50),
      fund('A', 100, 50),
      fund('B', 100, 10),
      fund('C', 100, -10),
    ];
    const result = recommendFunds(holdings, 3);
    expect(result.map((item) => item.symbol)).toEqual(['A', 'B', 'C']);
    expect(result[0].score).toBeCloseTo(0.08);
  });

  it('returns an empty list when no holdings are provided', () => {
    expect(recommendFunds([])).toEqual([]);
  });
});
