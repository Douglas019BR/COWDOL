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
  const [data, setData] = useState([]);

  const handleFileChange = e => {
    const file = e.target.files[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: result => {
        console.log(result.data);
        handleSubmit(result.data);
      },
    });
  };

  const handleSubmit = async parsedCsvData => {
    if (!parsedCsvData || parsedCsvData.length === 0) {
      alert('Por favor, envie um arquivo CSV!');
      return;
    }
    console.log(parsedCsvData);
    try {
      const response = await fetch('http://localhost:8000/profit-calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedCsvData }),
      });

      const results = await response.json();
      console.log(results);

      const formattedData = results.map((item, index) => {
        const {
          balance,
          current_value,
          purchase_total,
          value_difference,
          total_dividends,
          symbol,
          amount,
        } = item;

        let status;
        if (balance > 0) {
          status = 'Profit';
        } else if (balance < 0) {
          status = 'Loss';
        } else {
          status = 'No change';
        }

        return {
          id: index,
          message:
            `${symbol}\n\n Quantity: ${amount}\n Total Purchase Price: $${purchase_total.toFixed(
              2
            )}\n\n` +
            `Total Current Value: $${current_value.toFixed(2)}\n\n` +
            `Dividends Received: $${total_dividends.toFixed(2)}\n\n` +
            `Difference (Current Price - Purchase Price): $${value_difference.toFixed(
              2
            )}\n\n` +
            `Balance (Difference + Dividends): $${balance.toFixed(2)}\n\n` +
            `Status: ${status}\n`,
        };
      });
      setData(formattedData);
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

        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ marginBottom: 3 }}
        >
          Upload file
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>

        <Box sx={{ marginTop: 4 }}>
          <ul>
            {data.map(item => (
              <li key={item.id}>
                <Typography variant="body1" paragraph>
                  {item.message}
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
