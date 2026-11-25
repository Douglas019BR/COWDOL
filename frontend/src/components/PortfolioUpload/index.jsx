import { Alert, Button, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parsePortfolioCsv } from '../../utils/csv';

const MAX_FILE_BYTES = 1024 * 1024;

export default function PortfolioUpload({ onParsed }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [fileError, setFileError] = useState(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
        setFileError('invalidFileType');
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError('fileTooLarge');
        return;
      }
      setFileError(null);
      onParsed(parsePortfolioCsv(await file.text()));
    } catch {
      setFileError('fileReadFailed');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <Stack spacing={1} alignItems="flex-start">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        data-testid="csv-file-input"
        hidden
      />
      <Button variant="contained" onClick={() => inputRef.current?.click()}>
        {t('portfolio.upload')}
      </Button>
      <Typography variant="caption" color="text.secondary">
        {t('portfolio.uploadHint')}
      </Typography>
      {fileError && <Alert severity="error">{t(`errors.${fileError}`)}</Alert>}
    </Stack>
  );
}
