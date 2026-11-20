import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CURRENCY_URL, parseCurrencyResponse } from '../../utils/currencies';

const REFRESH_MS = 30 * 60 * 1000;

export default function CurrencyTicker() {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(CURRENCY_URL, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        setQuotes(parseCurrencyResponse(await response.json()));
      } catch (error) {
        if (error.name !== 'AbortError') setQuotes([]);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  if (!quotes.length) return null;

  return (
    <Box
      role="list"
      aria-label={t('currency.label')}
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        mt: 2,
        pt: 1,
        borderTop: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {quotes.map((quote) => (
        <Box role="listitem" key={quote.code} sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {quote.code}/BRL
          </Typography>{' '}
          <Typography variant="body2" component="span">
            {quote.bid.toFixed(2)}
          </Typography>{' '}
          <Typography
            variant="caption"
            component="span"
            color={quote.variation >= 0 ? 'lime' : 'warning.main'}
          >
            {quote.variation.toFixed(2)}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
