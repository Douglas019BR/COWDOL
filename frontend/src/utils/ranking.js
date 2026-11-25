export function holdingReturn(holding) {
  if (!holding.purchase_total) return 0;
  return holding.balance / holding.purchase_total;
}

export function rankHoldings(holdings, limit = 5) {
  const ranked = [...holdings]
    .filter((holding) => !holding.error)
    .sort((a, b) => holdingReturn(b) - holdingReturn(a));

  return {
    best: ranked.slice(0, limit),
    worst: ranked.slice(-limit).reverse(),
  };
}
