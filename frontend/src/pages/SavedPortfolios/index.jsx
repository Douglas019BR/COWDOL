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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { deletePortfolio, listPortfolios, loadPortfolio } from '../../services/api';

export default function SavedPortfolios() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const latestRefresh = useRef(0);
  const latestLoad = useRef(0);

  function refresh() {
    const requestId = ++latestRefresh.current;
    listPortfolios()
      .then((data) => {
        if (requestId === latestRefresh.current) {
          setItems(data);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (requestId === latestRefresh.current) {
          setError(requestError.message);
        }
      });
  }

  useEffect(() => {
    refresh();
    return () => {
      latestRefresh.current += 1;
      latestLoad.current += 1;
    };
  }, []);

  async function handleDelete(id) {
    setError(null);
    try {
      await deletePortfolio(id);
      refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleLoad(id) {
    const requestId = ++latestLoad.current;
    setError(null);
    try {
      const saved = await loadPortfolio(id);
      if (requestId === latestLoad.current) {
        navigate('/portfolio', { state: { saved } });
      }
    } catch (requestError) {
      if (requestId === latestLoad.current) {
        setError(requestError.message);
      }
    }
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
