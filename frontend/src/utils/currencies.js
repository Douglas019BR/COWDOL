export const CURRENCY_PAIRS = [
  'USD',
  'EUR',
  'BTC',
  'GBP',
  'ARS',
  'CLP',
  'JPY',
];

export const CURRENCY_URL = `https://economia.awesomeapi.com.br/last/${CURRENCY_PAIRS.map((code) => `${code}BRL`).join(',')}`;

export function parseCurrencyResponse(data) {
  return CURRENCY_PAIRS.flatMap((code) => {
    const quote = data?.[`${code}BRL`];
    if (!quote) return [];
    const bid = Number(quote.bid);
    if (!Number.isFinite(bid)) return [];
    return [
      {
        code,
        bid,
        variation: Number(quote.pctChange) || 0,
      },
    ];
  });
}
