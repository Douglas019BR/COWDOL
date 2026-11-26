import { describe, expect, it } from 'vitest';
import { groupBySector } from './sectors';

const holding = (sector, invested, balance) => ({
  sector,
  purchase_total: invested,
  current_value: invested,
  total_dividends: 0,
  balance,
});

describe('groupBySector', () => {
  it('groups holdings and computes allocation by invested value', () => {
    const groups = groupBySector([
      holding('energy', 300, 30),
      holding('financial', 100, -10),
      holding('energy', 100, 20),
    ]);
    expect(groups.map((group) => group.sector)).toEqual([
      'energy',
      'financial',
    ]);
    expect(groups[0].invested).toBe(400);
    expect(groups[0].count).toBe(2);
    expect(groups[0].allocation).toBeCloseTo(0.8);
    expect(groups[1].allocation).toBeCloseTo(0.2);
  });

  it('uses the other bucket for missing sectors and handles empty input', () => {
    expect(groupBySector([holding(undefined, 100, 0)])[0].sector).toBe('other');
    expect(groupBySector([])).toEqual([]);
  });

  it('reports zero allocation when nothing was invested', () => {
    expect(groupBySector([holding('other', 0, 0)])[0].allocation).toBe(0);
  });
});
