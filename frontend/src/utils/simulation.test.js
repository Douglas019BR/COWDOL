import { describe, expect, it } from 'vitest';
import {
  simulateCompoundInterest,
  summariseSimulation,
} from './simulation';

describe('simulateCompoundInterest', () => {
  it('compounds the initial amount and adds monthly contributions', () => {
    const rows = simulateCompoundInterest({
      initial: 1000,
      monthlyContribution: 0,
      annualRate: 12,
      months: 2,
    });
    expect(rows).toHaveLength(2);
    expect(rows[0].balance).toBeCloseTo(1010, 5);
    expect(rows[1].balance).toBeCloseTo(1020.1, 5);
    expect(rows[1].month).toBe(2);
  });

  it('returns no rows for zero months', () => {
    expect(
      simulateCompoundInterest({
        initial: 100,
        monthlyContribution: 10,
        annualRate: 5,
        months: 0,
      }),
    ).toEqual([]);
  });
});

describe('summariseSimulation', () => {
  it('computes contributed value, final value and earnings', () => {
    const params = {
      initial: 1000,
      monthlyContribution: 100,
      annualRate: 0,
      months: 3,
    };
    const rows = simulateCompoundInterest(params);
    expect(summariseSimulation(params, rows)).toEqual({
      totalContributed: 1300,
      finalValue: 1300,
      earnings: 0,
    });
  });
});
