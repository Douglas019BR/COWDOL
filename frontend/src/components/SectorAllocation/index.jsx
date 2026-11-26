import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/portfolio';
import { groupBySector } from '../../utils/sectors';

export default function SectorAllocation({ holdings, partial = false }) {
  const { t } = useTranslation();
  const groups = groupBySector(holdings);

  if (!groups.length) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('sectors.title')}
      </Typography>
      {partial && (
        <Typography variant="caption" color="text.secondary">
          {t('sectors.partial')}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}
      >
        {groups.map((group) => (
          <Box key={group.sector}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 1,
              }}
            >
              <Typography variant="subtitle2">
                {t(`sectors.${group.sector}`, { defaultValue: group.sector })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(group.allocation * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={group.allocation * 100}
              sx={{ my: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {t('sectors.count', { count: group.count })}
            </Typography>
            <Typography variant="body2">
              {formatCurrency(group.invested)}
            </Typography>
            <Typography
              variant="body2"
              color={group.balance < 0 ? 'error.main' : 'text.secondary'}
            >
              {t('sectors.balance')}: {formatCurrency(group.balance)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
