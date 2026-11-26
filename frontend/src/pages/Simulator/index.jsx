import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import CurrencyText from '../../components/common/CurrencyText';
import {
  simulateCompoundInterest,
  summariseSimulation,
  validateSimulation,
} from '../../utils/simulation';

export default function Simulator() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    initial: 1000,
    monthlyContribution: 100,
    rate: 10,
    ratePeriod: 'annual',
    months: 12,
    interestType: 'compound',
  });

  const validationError = validateSimulation(form);
  const rows = useMemo(
    () =>
      validationError ? [] : simulateCompoundInterest(form),
    [form, validationError],
  );
  const summary = summariseSimulation(form, rows);

  function updateNumber(field) {
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
            ['rate', 'simulator.rate'],
            ['months', 'simulator.months'],
          ].map(([field, label]) => (
            <TextField
              key={field}
              label={t(label)}
              type="number"
              value={form[field]}
              onChange={updateNumber(field)}
              inputProps={{ min: 0 }}
            />
          ))}
          <FormControl>
            <InputLabel>{t('simulator.ratePeriod')}</InputLabel>
            <Select
              value={form.ratePeriod}
              label={t('simulator.ratePeriod')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ratePeriod: event.target.value,
                }))
              }
            >
              <MenuItem value="annual">{t('simulator.annual')}</MenuItem>
              <MenuItem value="monthly">{t('simulator.monthlyRate')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>{t('simulator.interestType')}</InputLabel>
            <Select
              value={form.interestType}
              label={t('simulator.interestType')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  interestType: event.target.value,
                }))
              }
            >
              <MenuItem value="compound">
                {t('simulator.compound')}
              </MenuItem>
              <MenuItem value="simple">{t('simulator.simple')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t(`simulator.${validationError}`)}
          </Alert>
        )}

        {!validationError && (
          <>
            <Typography sx={{ mt: 2 }}>
              {t('simulator.contributed')}:{' '}
              <CurrencyText value={summary.totalContributed} />
            </Typography>
            <Typography>
              {t('simulator.finalValue')}:{' '}
              <CurrencyText value={summary.finalValue} />
            </Typography>
            <Typography>
              {t('simulator.earnings')}:{' '}
              <CurrencyText value={summary.earnings} />
            </Typography>
          </>
        )}
      </Paper>

      {!validationError && (
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
                    <CurrencyText value={row.balance} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
