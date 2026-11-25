export const RETURN_WEIGHT = 0.6;
export const DIVIDEND_WEIGHT = 0.4;

export function scoreFund(holding) {
  const invested = holding.purchase_total || 1;
  const returnRate = holding.balance / invested;
  const dividendYield = holding.total_dividends / invested;
  return RETURN_WEIGHT * returnRate + DIVIDEND_WEIGHT * dividendYield;
}

export function aggregateBySymbol(holdings) {
  const funds = new Map();
  holdings
    .filter((holding) => !holding.error)
    .forEach((holding) => {
      const current = funds.get(holding.symbol) ?? {
        symbol: holding.symbol,
        purchase_total: 0,
        balance: 0,
        total_dividends: 0,
      };
      current.purchase_total += holding.purchase_total || 0;
      current.balance += holding.balance || 0;
      current.total_dividends += holding.total_dividends || 0;
      funds.set(holding.symbol, current);
    });
  return [...funds.values()];
}

export function recommendFunds(holdings, limit = 3) {
  return aggregateBySymbol(holdings)
    .sort((a, b) => scoreFund(b) - scoreFund(a))
    .slice(0, limit)
    .map((holding) => ({
      symbol: holding.symbol,
      score: scoreFund(holding),
      reason: scoreFund(holding) >= 0 ? 'strong' : 'review',
    }));
}
