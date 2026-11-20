export function simulateCompoundInterest({
  initial,
  monthlyContribution,
  annualRate,
  months,
}) {
  const monthlyRate = annualRate / 100 / 12;
  let balance = initial;
  return Array.from({ length: months }, (_, index) => {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    return { month: index + 1, balance };
  });
}

export function summariseSimulation({ initial, monthlyContribution, months }, rows) {
  const totalContributed = initial + monthlyContribution * months;
  const finalValue = rows.at(-1)?.balance ?? initial;
  return { totalContributed, finalValue, earnings: finalValue - totalContributed };
}
