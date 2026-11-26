import Papa from 'papaparse';

export const REQUIRED_HEADERS = [
  'SYMBOL',
  'AMOUNT',
  'PURCHASE_DATE',
  'PURCHASE_VALUE',
];

const HEADER_ALIASES = {
  symbol: 'SYMBOL',
  amount: 'AMOUNT',
  purchasedate: 'PURCHASE_DATE',
  'purchase date': 'PURCHASE_DATE',
  purchasevalue: 'PURCHASE_VALUE',
  'purchase value': 'PURCHASE_VALUE',
};

export function normalizeHeader(header) {
  const key = String(header).trim().toLowerCase().replace(/[_-]+/g, ' ');
  return HEADER_ALIASES[key] ?? key.toUpperCase();
}

export function parseBrazilianDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  return isValid ? `${day}/${month}/${year}` : null;
}

export function parsePortfolioCsv(text) {
  if (!text || !text.trim()) {
    return { holdings: [], errors: [{ row: 0, messages: ['emptyFile'] }] };
  }

  const result = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    delimiter: '',
  });

  const fields = (result.meta.fields ?? []).map(normalizeHeader);
  const missing = REQUIRED_HEADERS.filter((header) => !fields.includes(header));
  if (missing.length) {
    return {
      holdings: [],
      errors: [
        { row: 0, messages: ['missingHeaders'], params: { headers: missing.join(', ') } },
      ],
    };
  }

  const holdings = [];
  const errors = [];
  const parserErrorRows = new Set(
    result.errors
      .filter((error) => typeof error.row === 'number')
      .map((error) => error.row + 2),
  );

  result.data.forEach((row, index) => {
    if (parserErrorRows.has(index + 2)) return;
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      normalized[normalizeHeader(key)] = value;
    });

    const symbol = String(normalized.SYMBOL ?? '').trim();
    const amount = Number(normalized.AMOUNT);
    const purchaseValue = Number(normalized.PURCHASE_VALUE);
    const purchaseDate = parseBrazilianDate(normalized.PURCHASE_DATE);
    const messages = [];

    if (!symbol) messages.push('invalidSymbol');
    if (!Number.isInteger(amount) || amount <= 0) messages.push('invalidAmount');
    if (!Number.isFinite(purchaseValue) || purchaseValue <= 0) {
      messages.push('invalidPurchaseValue');
    }
    if (!purchaseDate) messages.push('invalidDate');

    if (messages.length) {
      errors.push({ row: index + 2, messages });
      return;
    }

    holdings.push({
      symbol,
      amount,
      purchase_date: purchaseDate,
      purchase_value: purchaseValue,
      ...(normalized.SECTOR ? { SECTOR: String(normalized.SECTOR).trim() } : {}),
    });
  });

  result.errors.forEach((error) => {
    errors.push({
      row: typeof error.row === 'number' ? error.row + 2 : 0,
      messages: ['parseError'],
      params: { message: error.message },
    });
  });

  return { holdings, errors };
}
