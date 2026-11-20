import {
  Alert,
  AlertTitle,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioUpload from '../../components/PortfolioUpload';

export default function Portfolio() {
  const { t } = useTranslation();
  const [parsed, setParsed] = useState(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('portfolio.title')}
        </Typography>
        <PortfolioUpload onParsed={setParsed} />
      </Paper>

      {parsed?.errors?.length > 0 && (
        <Alert severity="warning">
          <AlertTitle>{t('errors.validationTitle')}</AlertTitle>
          {parsed.errors.map((error, index) => (
            <Typography key={`${error.row}-${index}`} variant="body2">
              {error.row > 0 ? `${t('errors.row')} ${error.row}: ` : ''}
              {error.messages
                .map((message) =>
                  t(`errors.${message}`, error.params ?? {}),
                )
                .join(' ')}
            </Typography>
          ))}
        </Alert>
      )}

      {parsed?.holdings?.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('portfolio.preview', { count: parsed.holdings.length })}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('table.symbol')}</TableCell>
                <TableCell align="right">{t('table.quantity')}</TableCell>
                <TableCell>{t('table.purchaseDate')}</TableCell>
                <TableCell align="right">
                  {t('table.purchasePrice')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsed.holdings.map((holding, index) => (
                <TableRow key={`${holding.symbol}-${index}`}>
                  <TableCell>{holding.symbol}</TableCell>
                  <TableCell align="right">{holding.amount}</TableCell>
                  <TableCell>{holding.purchase_date}</TableCell>
                  <TableCell align="right">
                    {holding.purchase_value.toFixed(2)}
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
