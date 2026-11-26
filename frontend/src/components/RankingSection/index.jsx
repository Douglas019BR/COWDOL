import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CurrencyText from '../common/CurrencyText';
import { holdingReturn, rankHoldings } from '../../utils/ranking';

export default function RankingSection({ holdings }) {
  const { t } = useTranslation();
  const { best, worst } = rankHoldings(holdings);

  if (!holdings.length) return null;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {[
        ['best', best],
        ['worst', worst],
      ].map(([kind, items]) => (
        <Paper key={kind} sx={{ p: 2, flex: 1, minWidth: 280 }}>
          <Typography variant="h6" gutterBottom>
            {t(`ranking.${kind}`)}
          </Typography>
          <List dense>
            {items.map((holding, index) => {
              const rate = holdingReturn(holding) * 100;
              return (
                <ListItem key={`${holding.symbol}-${index}`} divider>
                  <ListItemText
                    primary={holding.symbol}
                    secondary={
                      <CurrencyText
                        value={holding.balance}
                        currency={holding.currency}
                      />
                    }
                  />
                  <Typography
                    variant="body2"
                    color={rate >= 0 ? 'success.main' : 'error.main'}
                  >
                    {rate.toFixed(2)}%
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      ))}
    </Box>
  );
}
