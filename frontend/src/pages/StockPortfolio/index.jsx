import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import Papa from 'papaparse';

import DataTable from '../../components/common/Table';
import FileUpload from '../../components/common/FileUploadButton';
import { calculateProfit } from '../../services/stockService';
import { formatStockData } from '../../utils/formatter';
import { stockTableColumns } from '../../constants/tableColumns';

function StockPortfolio() {
  const [data, setData] = useState([]);

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
      const results = await calculateProfit(parsedCsvData);
      const formattedData = results.map(formatStockData);
      setData(formattedData);
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
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

        {data.length > 0 && (
          <DataTable 
            columns={stockTableColumns}
            data={data}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        )}
      </Box>
    </Container>
  );
}

export default StockPortfolio;