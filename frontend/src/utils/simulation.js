export const MAX_MONTHS = 600;

export function validateSimulation(params) {
  if (!Number.isInteger(params.months) || params.months < 0) {
    return 'invalidMonths';
  }
  if (params.months > MAX_MONTHS) return 'monthsTooLarge';
  if (!Number.isFinite(params.rate) || params.rate < 0) return 'invalidRate';
  if (params.initial < 0 || params.monthlyContribution < 0) {
    return 'invalidAmount';
  }
  return null;
}

export function simulateCompoundInterest({
  initial,
  monthlyContribution,
  rate,
  ratePeriod = 'annual',
  months,
  interestType = 'compound',
}) {
  const monthlyRate =
    ratePeriod === 'monthly' ? rate / 100 : rate / 100 / 12;
  let balance = initial;
  return Array.from({ length: months }, (_, index) => {
    const month = index + 1;
    if (interestType === 'simple') {
      balance =
        initial +
        initial * monthlyRate * month +
        monthlyContribution * month;
    } else {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    return { month, balance };
  });
}

export function summariseSimulation(
  { initial, monthlyContribution, months },
  rows,
) {
  const totalContributed = initial + monthlyContribution * months;
  const finalValue = rows.at(-1)?.balance ?? initial;
  return {
    totalContributed,
    finalValue,
    earnings: finalValue - totalContributed,
  };
}
