import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

function Metric({ label, value, negative }) {
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 160 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" color={negative ? 'error.main' : 'text.primary'}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function RiskSection({ risk, error, loading }) {
  const { t } = useTranslation();

  if (!risk && !error && !loading) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('risk.title')}
      </Typography>
      {loading && <Typography>{t('risk.analysing')}</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {risk && (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Metric
              label={t('risk.volatility')}
              value={`${(risk.volatility * 100).toFixed(2)}%`}
            />
            <Metric
              label={t('risk.maxDrawdown')}
              value={`${(risk.max_drawdown * 100).toFixed(2)}%`}
              negative={risk.max_drawdown < 0}
            />
            <Metric
              label={t('risk.diversification')}
              value={`${(risk.diversification * 100).toFixed(1)}%`}
            />
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('risk.symbol')}</TableCell>
                <TableCell align="right">{t('risk.volatility')}</TableCell>
                <TableCell align="right">{t('risk.maxDrawdown')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risk.assets.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell>{asset.symbol}</TableCell>
                  <TableCell align="right">
                    {(asset.volatility * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: asset.max_drawdown < 0 ? 'error.main' : 'inherit',
                    }}
                  >
                    {(asset.max_drawdown * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
}
