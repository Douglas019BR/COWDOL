import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import { Container, Typography, Box } from '@mui/material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function App() {
  const [csvData, setCsvData] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = e => {
    const file = e.target.files[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: result => {
        console.log(result.data);
        setCsvData(result.data);
      },
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!csvData) {
      alert('Por favor, envie um arquivo CSV!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/profit-calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: csvData }),
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h2" gutterBottom>
          Stock Portfolio Analyzer
        </Typography>

        <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ marginBottom: 3 }} // Espaçamento entre o botão e o título
          >
            Upload file
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
        </form>

        {data && (
          <div style={{ marginTop: '20px' }}>
            <h2>Resultados:</h2>
            <table border="1">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Amount</th>
                  <th>Purchase Value</th>
                  <th>Current Price</th>
                  <th>Total Dividends</th>
                  <th>Value Difference</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.symbol}</td>
                    <td>{item.amount}</td>
                    <td>{item.purchase_value}</td>
                    <td>{item.current_price}</td>
                    <td>{item.total_dividends}</td>
                    <td>{item.value_difference}</td>
                    <td>{item.balance}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </Container>
  );
}

export default App;
