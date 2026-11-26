export function groupBySector(holdings) {
  const groups = new Map();
  holdings.forEach((holding) => {
    const sector = holding.sector || 'other';
    const group = groups.get(sector) ?? {
      sector,
      count: 0,
      invested: 0,
      current: 0,
      dividends: 0,
      balance: 0,
    };
    group.count += 1;
    group.invested += holding.purchase_total || 0;
    group.current += holding.current_value || 0;
    group.dividends += holding.total_dividends || 0;
    group.balance += holding.balance || 0;
    groups.set(sector, group);
  });

  const totalInvested = [...groups.values()].reduce(
    (sum, group) => sum + group.invested,
    0,
  );
  return [...groups.values()]
    .sort((a, b) => b.invested - a.invested)
    .map((group) => ({
      ...group,
      allocation: totalInvested > 0 ? group.invested / totalInvested : 0,
    }));
}
