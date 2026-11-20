import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/portfolio';
import {
  simulateCompoundInterest,
  summariseSimulation,
} from '../../utils/simulation';

export default function Simulator() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    initial: 1000,
    monthlyContribution: 100,
    annualRate: 10,
    months: 12,
  });

  const rows = useMemo(() => simulateCompoundInterest(form), [form]);
  const summary = summariseSimulation(form, rows);

  function update(field) {
    return (event) =>
      setForm((current) => ({
        ...current,
        [field]: Number(event.target.value) || 0,
      }));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('simulator.title')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {[
            ['initial', 'simulator.initial'],
            ['monthlyContribution', 'simulator.monthly'],
            ['annualRate', 'simulator.rate'],
            ['months', 'simulator.months'],
          ].map(([field, label]) => (
            <TextField
              key={field}
              label={t(label)}
              type="number"
              value={form[field]}
              onChange={update(field)}
              inputProps={{ min: 0 }}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 2 }}>
          {t('simulator.contributed')}:{' '}
          {formatCurrency(summary.totalContributed)}
        </Typography>
        <Typography>
          {t('simulator.finalValue')}: {formatCurrency(summary.finalValue)}
        </Typography>
        <Typography>
          {t('simulator.earnings')}: {formatCurrency(summary.earnings)}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('simulator.month')}</TableCell>
              <TableCell align="right">{t('simulator.balance')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell align="right">
                  {formatCurrency(row.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
