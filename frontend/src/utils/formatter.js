export const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

export const formatStockData = (item) => {
  const status = item.balance > 0 ? 'Profit' : item.balance < 0 ? 'Loss' : 'No change';
  
  return {
    symbol: item.symbol,
    quantity: item.amount,
    purchasePrice: formatCurrency(item.purchase_total),
    currentValue: formatCurrency(item.current_value),
    dividends: formatCurrency(item.total_dividends),
    difference: formatCurrency(item.value_difference),
    balance: formatCurrency(item.balance),
    status: status
  };
};