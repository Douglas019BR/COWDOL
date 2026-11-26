import { describe, expect, it } from 'vitest';
import { arcPath, pieSegments } from './sectorChart';

describe('pieSegments', () => {
  it('computes cumulative angles and stable colours', () => {
    const segments = pieSegments([
      { sector: 'energy', allocation: 0.5 },
      { sector: 'financial', allocation: 0.25 },
      { sector: 'unknown', allocation: 0.25 },
    ]);
    expect(segments.map((segment) => segment.startAngle)).toEqual([0, 180, 270]);
    expect(segments[2].endAngle).toBe(360);
    expect(segments[0].percentage).toBe(50);
    expect(segments[2].color).toBe('#9e9e9e');
  });
});

describe('arcPath', () => {
  it('builds an SVG path from the centre for a segment', () => {
    const path = arcPath(100, 100, 80, 0, 90);
    expect(path).toMatch(/^M 100 100 L /);
    expect(path).toContain('A 80 80 0 0 0');
    expect(path).toMatch(/ Z$/);
  });
});
