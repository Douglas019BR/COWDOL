export const RETURN_WEIGHT = 0.6;
export const DIVIDEND_WEIGHT = 0.4;

export function scoreFund(holding) {
  const invested = holding.purchase_total || 1;
  const returnRate = holding.balance / invested;
  const dividendYield = holding.total_dividends / invested;
  return RETURN_WEIGHT * returnRate + DIVIDEND_WEIGHT * dividendYield;
}

export function recommendFunds(holdings, limit = 3) {
  return [...holdings]
    .filter((holding) => !holding.error)
    .sort((a, b) => scoreFund(b) - scoreFund(a))
    .slice(0, limit)
    .map((holding) => ({
      symbol: holding.symbol,
      score: scoreFund(holding),
      reason: scoreFund(holding) >= 0 ? 'strong' : 'review',
    }));
}
