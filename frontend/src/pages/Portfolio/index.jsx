import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CurrencyText from '../../components/common/CurrencyText';
import PortfolioUpload from '../../components/PortfolioUpload';
import RankingSection from '../../components/RankingSection';
import RecommendationSection from '../../components/RecommendationSection';
import { calculateProfit } from '../../services/api';
import { calculateTotals } from '../../utils/portfolio';

function SummaryCard({ label, value, positive }) {
  const color = positive === undefined ? 'text.primary' : positive ? 'success.main' : 'error.main';
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 160 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" color={color}>
        <CurrencyText value={value} />
      </Typography>
    </Paper>
  );
}

export default function Portfolio() {
  const { t } = useTranslation();
  const [parsed, setParsed] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const requestId = useRef(0);

  function handleParsed(result) {
    requestId.current += 1;
    setParsed(result);
    setHoldings([]);
    setApiError(null);
  }

  async function handleAnalyse() {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setApiError(null);
    setHoldings([]);
    try {
      const response = await calculateProfit(parsed.holdings);
      if (currentRequest === requestId.current) {
        setHoldings(response.holdings ?? []);
      }
    } catch (error) {
      if (currentRequest === requestId.current) {
        setApiError(error.message);
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }

  const successful = holdings.filter((holding) => !holding.error);
  const failed = holdings.filter((holding) => holding.error);
  const totals = calculateTotals(successful);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('portfolio.title')}
        </Typography>
        <PortfolioUpload onParsed={handleParsed} />
        {parsed?.holdings?.length > 0 && (
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleAnalyse}
            disabled={loading}
          >
            {t('portfolio.analyse')}
          </Button>
        )}
      </Paper>

      {parsed?.errors?.length > 0 && (
        <Alert severity="warning">
          <AlertTitle>{t('errors.validationTitle')}</AlertTitle>
          {parsed.errors.map((error, index) => (
            <Typography key={`${error.row}-${index}`} variant="body2">
              {error.row > 0 ? `${t('errors.row')} ${error.row}: ` : ''}
              {error.messages
                .map((message) => t(`errors.${message}`, error.params ?? {}))
                .join(' ')}
            </Typography>
          ))}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>{t('portfolio.analysing')}</Typography>
        </Box>
      )}

      {apiError && <Alert severity="error">{apiError}</Alert>}

      {failed.length > 0 && (
        <Alert severity="warning">
          <AlertTitle>{t('errors.processingTitle')}</AlertTitle>
          {failed.map((holding) => (
            <Typography key={holding.symbol} variant="body2">
              {holding.symbol}: {holding.error}
            </Typography>
          ))}
        </Alert>
      )}

      {successful.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <SummaryCard label={t('totals.invested')} value={totals.invested} />
            <SummaryCard label={t('totals.current')} value={totals.current} />
            <SummaryCard
              label={t('totals.dividends')}
              value={totals.dividends}
              positive={totals.dividends >= 0}
            />
            <SummaryCard
              label={t('totals.profitLoss')}
              value={totals.profitLoss}
              positive={totals.profitLoss >= 0}
            />
          </Box>

          <Paper sx={{ p: 3, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.symbol')}</TableCell>
                  <TableCell align="right">{t('table.quantity')}</TableCell>
                  <TableCell align="right">
                    {t('table.purchaseTotal')}
                  </TableCell>
                  <TableCell align="right">{t('table.currentValue')}</TableCell>
                  <TableCell align="right">{t('table.dividends')}</TableCell>
                  <TableCell align="right">{t('table.difference')}</TableCell>
                  <TableCell align="right">{t('table.balance')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {successful.map((holding, index) => (
                  <TableRow key={`${holding.symbol}-${index}`}>
                    <TableCell>{holding.symbol}</TableCell>
                    <TableCell align="right">{holding.amount}</TableCell>
                    <TableCell align="right">
                      <CurrencyText
                        value={holding.purchase_total}
                        currency={holding.currency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <CurrencyText
                        value={holding.current_value}
                        currency={holding.currency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <CurrencyText
                        value={holding.total_dividends}
                        currency={holding.currency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <CurrencyText
                        value={holding.value_difference}
                        currency={holding.currency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <CurrencyText
                        value={holding.balance}
                        currency={holding.currency}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <RankingSection holdings={successful} />
          <RecommendationSection holdings={successful} />
        </>
      )}
    </Box>
  );
}
