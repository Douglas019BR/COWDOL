import { describe, expect, it } from 'vitest';
import { normalizeHeader, parseBrazilianDate, parsePortfolioCsv } from './csv';

describe('normalizeHeader', () => {
  it('maps legacy and spaced headers to canonical names', () => {
    expect(normalizeHeader(' symbol ')).toBe('SYMBOL');
    expect(normalizeHeader('Purchase Date')).toBe('PURCHASE_DATE');
    expect(normalizeHeader('purchase_value')).toBe('PURCHASE_VALUE');
  });
});

describe('parseBrazilianDate', () => {
  it('accepts real dates and rejects invalid ones', () => {
    expect(parseBrazilianDate('01/10/2023')).toBe('01/10/2023');
    expect(parseBrazilianDate('31/02/2023')).toBeNull();
    expect(parseBrazilianDate('2023-10-01')).toBeNull();
  });
});

describe('parsePortfolioCsv', () => {
  it('parses comma-separated holdings with lowercase headers', () => {
    const csv =
      'symbol,amount,purchase_date,purchase_value\nBBSE3.sa,11,01/10/2023,31.46\n';
    const { holdings, errors } = parsePortfolioCsv(csv);
    expect(errors).toEqual([]);
    expect(holdings).toEqual([
      {
        symbol: 'BBSE3.sa',
        amount: 11,
        purchase_date: '01/10/2023',
        purchase_value: 31.46,
      },
    ]);
  });

  it('parses the legacy semicolon-separated format', () => {
    const csv =
      'SYMBOL;AMOUNT;PURCHASE_DATE;PURCHASE_VALUE\nBBSE3.sa;11;01/10/2023;31.46\nPETR4.sa;10;01/04/2024;37.58\n';
    const { holdings, errors } = parsePortfolioCsv(csv);
    expect(errors).toEqual([]);
    expect(holdings).toHaveLength(2);
  });

  it('reports missing headers', () => {
    const { holdings, errors } = parsePortfolioCsv('SYMBOL,AMOUNT\nBBSE3,10');
    expect(holdings).toEqual([]);
    expect(errors[0].messages).toContain('missingHeaders');
  });

  it('reports invalid rows without discarding valid ones', () => {
    const csv = [
      'SYMBOL,AMOUNT,PURCHASE_DATE,PURCHASE_VALUE',
      'BBSE3.sa,11,01/10/2023,31.46',
      'BAD,0,31/02/2023,-5',
      '',
    ].join('\n');
    const { holdings, errors } = parsePortfolioCsv(csv);
    expect(holdings).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(3);
    expect(errors[0].messages).toEqual([
      'invalidAmount',
      'invalidPurchaseValue',
      'invalidDate',
    ]);
  });

  it('reports empty files', () => {
    const { holdings, errors } = parsePortfolioCsv('   ');
    expect(holdings).toEqual([]);
    expect(errors[0].messages).toEqual(['emptyFile']);
  });
});
