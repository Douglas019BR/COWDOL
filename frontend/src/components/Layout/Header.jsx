import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CurrencyTicker from '../CurrencyTicker';

export default function Header() {
  const { t, i18n } = useTranslation();

  return (
    <Box component="header" sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Typography variant="h6" component="span" color="inherit">
            {t('appName')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {t('tagline')}
          </Typography>
        </div>
        <ButtonGroup
          size="small"
          aria-label={t('language.label')}
          sx={{ '& .MuiButton-root': { color: 'white', borderColor: 'white' } }}
        >
          <Button
            variant={i18n.language.startsWith('en') ? 'contained' : 'outlined'}
            onClick={() => i18n.changeLanguage('en')}
          >
            {t('language.en')}
          </Button>
          <Button
            variant={i18n.language.startsWith('pt') ? 'contained' : 'outlined'}
            onClick={() => i18n.changeLanguage('pt')}
          >
            {t('language.pt')}
          </Button>
        </ButtonGroup>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        <CurrencyTicker />
      </Box>
    </Box>
  );
}
