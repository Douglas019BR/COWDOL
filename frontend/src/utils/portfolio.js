export function calculateTotals(holdings) {
  return holdings.reduce(
    (totals, holding) => ({
      invested: totals.invested + holding.purchase_total,
      current: totals.current + holding.current_value,
      dividends: totals.dividends + holding.total_dividends,
      profitLoss: totals.profitLoss + holding.balance,
    }),
    { invested: 0, current: 0, dividends: 0, profitLoss: 0 },
  );
}

export function formatCurrency(value, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}
