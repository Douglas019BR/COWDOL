import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.100', py: 3, mt: 'auto' }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </Typography>
    </Box>
  );
}
