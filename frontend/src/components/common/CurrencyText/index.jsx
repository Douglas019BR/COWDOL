import { Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/portfolio';

export default function CurrencyText({ value, currency = 'BRL' }) {
  const negative = value < 0;
  return (
    <Typography
      component="span"
      variant="inherit"
      data-negative={negative}
      sx={{ color: negative ? 'error.main' : undefined }}
    >
      {formatCurrency(value, currency)}
    </Typography>
  );
}
