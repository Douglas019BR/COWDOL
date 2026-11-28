import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { deletePortfolio, listPortfolios, loadPortfolio } from '../../services/api';

export default function SavedPortfolios() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  function refresh() {
    listPortfolios()
      .then(setItems)
      .catch((requestError) => setError(requestError.message));
  }

  useEffect(refresh, []);

  async function handleDelete(id) {
    await deletePortfolio(id);
    refresh();
  }

  async function handleLoad(id) {
    const saved = await loadPortfolio(id);
    navigate('/portfolio', { state: { saved } });
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('saved.title')}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {items.length === 0 && !error && (
        <Typography color="text.secondary">{t('saved.empty')}</Typography>
      )}
      {items.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('saved.name')}</TableCell>
                <TableCell>{t('saved.createdAt')}</TableCell>
                <TableCell align="right">{t('saved.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleLoad(item.id)}>
                      {t('saved.load')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      {t('saved.delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}
