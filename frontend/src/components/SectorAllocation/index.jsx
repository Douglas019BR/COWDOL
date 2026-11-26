import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/portfolio';
import { groupBySector } from '../../utils/sectors';
import { arcPath, pieSegments } from '../../utils/sectorChart';

const SIZE = 220;
const RADIUS = 100;

export default function SectorAllocation({ holdings, partial = false }) {
  const { t } = useTranslation();
  const groups = groupBySector(holdings);
  const segments = pieSegments(groups);

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
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={t('sectors.title')}
        >
          {segments.map((segment) =>
            segment.percentage >= 99.99 ? (
              <circle
                key={segment.sector}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill={segment.color}
              />
            ) : (
              <path
                key={segment.sector}
                d={arcPath(
                  SIZE / 2,
                  SIZE / 2,
                  RADIUS,
                  segment.startAngle,
                  segment.endAngle,
                )}
                fill={segment.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ),
          )}
        </svg>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          {groups.map((group, index) => (
            <Box key={group.sector} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: segments[index].color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {t(`sectors.${group.sector}`, {
                    defaultValue: group.sector,
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {segments[index].percentage.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ pl: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('sectors.count', { count: group.count })} ·{' '}
                  {formatCurrency(group.invested)}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color={group.balance < 0 ? 'error.main' : 'text.secondary'}
                >
                  {t('sectors.balance')}: {formatCurrency(group.balance)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
