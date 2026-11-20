import { Box, Button, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 4 } }} elevation={2}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t('home.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('home.description')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button component={Link} to="/portfolio" variant="contained">
            {t('home.openPortfolio')}
          </Button>
          <Button component={Link} to="/simulator" variant="outlined">
            {t('home.openSimulator')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
