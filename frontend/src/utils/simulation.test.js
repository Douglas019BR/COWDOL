import { describe, expect, it } from 'vitest';
import {
  MAX_MONTHS,
  simulateCompoundInterest,
  summariseSimulation,
  validateSimulation,
} from './simulation';

const baseParams = {
  initial: 1000,
  monthlyContribution: 0,
  rate: 12,
  ratePeriod: 'annual',
  months: 2,
  interestType: 'compound',
};

describe('simulateCompoundInterest', () => {
  it('compounds an annual rate with monthly contributions', () => {
    const rows = simulateCompoundInterest(baseParams);
    expect(rows).toHaveLength(2);
    expect(rows[0].balance).toBeCloseTo(1010, 5);
    expect(rows[1].balance).toBeCloseTo(1020.1, 5);
    expect(rows[1].month).toBe(2);
  });

  it('accepts a monthly rate', () => {
    const rows = simulateCompoundInterest({
      ...baseParams,
      rate: 1,
      ratePeriod: 'monthly',
    });
    expect(rows[1].balance).toBeCloseTo(1020.1, 5);
  });

  it('computes simple interest on the initial amount only', () => {
    const rows = simulateCompoundInterest({
      ...baseParams,
      interestType: 'simple',
      monthlyContribution: 100,
    });
    expect(rows[1].balance).toBeCloseTo(1220, 5);
  });

  it('returns no rows for zero months', () => {
    expect(simulateCompoundInterest({ ...baseParams, months: 0 })).toEqual([]);
  });
});

describe('validateSimulation', () => {
  it('accepts valid terms', () => {
    expect(validateSimulation(baseParams)).toBeNull();
    expect(validateSimulation({ ...baseParams, months: MAX_MONTHS })).toBeNull();
  });

  it('rejects fractional, negative and excessive terms', () => {
    expect(validateSimulation({ ...baseParams, months: 1.5 })).toBe(
      'invalidMonths',
    );
    expect(validateSimulation({ ...baseParams, months: -1 })).toBe(
      'invalidMonths',
    );
    expect(
      validateSimulation({ ...baseParams, months: MAX_MONTHS + 1 }),
    ).toBe('monthsTooLarge');
  });

  it('rejects invalid rates and amounts', () => {
    expect(validateSimulation({ ...baseParams, rate: -1 })).toBe(
      'invalidRate',
    );
    expect(validateSimulation({ ...baseParams, initial: -1 })).toBe(
      'invalidAmount',
    );
  });
});

describe('summariseSimulation', () => {
  it('computes contributed value, final value and earnings', () => {
    const params = { ...baseParams, rate: 0, monthlyContribution: 100, months: 3 };
    const rows = simulateCompoundInterest(params);
    expect(summariseSimulation(params, rows)).toEqual({
      totalContributed: 1300,
      finalValue: 1300,
      earnings: 0,
    });
  });
});
