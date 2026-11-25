import {
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { recommendFunds } from '../../utils/recommendations';

export default function RecommendationSection({ holdings }) {
  const { t } = useTranslation();
  const recommendations = recommendFunds(holdings);

  if (!recommendations.length) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('recommendations.title')}
      </Typography>
      <List dense>
        {recommendations.map((item) => (
          <ListItem key={item.symbol} divider>
            <ListItemText
              primary={item.symbol}
              secondary={`${(item.score * 100).toFixed(2)}%`}
            />
            <Chip
              size="small"
              label={t(`recommendations.${item.reason}`)}
              color={item.reason === 'strong' ? 'success' : 'warning'}
            />
          </ListItem>
        ))}
      </List>
      <Alert severity="info" sx={{ mt: 2 }}>
        {t('recommendations.disclaimer')}
      </Alert>
    </Paper>
  );
}
