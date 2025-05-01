import React, { useState } from 'react';
import { Container, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, CircularProgress } from '@mui/material';
import Papa from 'papaparse';

import DataTable from '../../components/common/Table';
import FileUpload from '../../components/common/FileUploadButton';
import { calculateProfit } from '../../services/stockService';
import { formatStockData } from '../../utils/formatter';
import { stockTableColumns } from '../../constants/tableColumns';

function StockPortfolio() {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: result => handleSubmit(result.data),
    });
  };

  const handleSubmit = async parsedCsvData => {
    if (!parsedCsvData?.length) {
      alert('Por favor, envie um arquivo CSV!');
      return;
    }

    try {
      setLoading(true);
      const results = await calculateProfit(parsedCsvData);

      const validResults = [];
      const errorResults = [];

      results.forEach(item => {
        if (item.error) {
          errorResults.push(item);
        } else {
          validResults.push(item);
        }
      });

      const formattedData = validResults.map(formatStockData);
      setData(formattedData);

      if (errorResults.length > 0) {
        setErrors(errorResults);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 4
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Stock Portfolio Analyzer
        </Typography>

        <FileUpload
          onFileSelect={handleFileChange}
          accept=".csv"
        />

        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Processando arquivo, por favor aguarde...
            </Typography>
          </Box>
        )}

        {!loading && data.length > 0 && (
          <DataTable
            columns={stockTableColumns}
            data={data}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        )}

        {/* Error Dialog */}
        <Dialog open={showErrorDialog} onClose={handleCloseErrorDialog}>
          <DialogTitle>Warming</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              The following errors occurred while processing the file:
            </Typography>
            <List>
              {errors.map((error, index) => (
                <ListItem key={index}>
                  <Typography color="error">
                    {error.symbol || "Ativo desconhecido"}: {error.error?.message || "Erro desconhecido"}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseErrorDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default StockPortfolio;