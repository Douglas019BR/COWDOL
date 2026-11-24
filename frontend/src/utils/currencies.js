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

export function formatBid(bid) {
  if (bid !== 0 && Math.abs(bid) < 0.01) return bid.toFixed(4);
  return bid.toFixed(2);
}

export function parseCurrencyResponse(data) {
  return CURRENCY_PAIRS.flatMap((code) => {
    const quote = data?.[`${code}BRL`];
    const rawBid = quote?.bid;
    if (rawBid === null || rawBid === undefined || String(rawBid).trim() === '') {
      return [];
    }
    const bid = Number(rawBid);
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
