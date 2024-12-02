import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { styled } from '@mui/joy/styles';
import { keyframes } from '@emotion/react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const currencyData = [
  { code: 'USD', name: 'Dólar', emoji: '🇺🇸' },
  { code: 'EUR', name: 'Euro', emoji: '🇪🇺' },
  { code: 'BTC', name: 'Bitcoin', emoji: '₿' },
  { code: 'GBP', name: 'Libra', emoji: '🇬🇧' },
  { code: 'ARS', name: 'Peso Argentino', emoji: '🇦🇷' },
  { code: 'CLP', name: 'Peso Chileno', emoji: '🇨🇱' },
  { code: 'JPY', name: 'Iene', emoji: '🇯🇵' }
];

const slideAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-16%);
  }
`;

const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  height: '40px',
}));

const CarouselTrack = styled(Box)({
  display: 'inline-flex',
  animation: `${slideAnimation} 30s linear infinite`,
  width: '300%',
});

const CarouselCard = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  width: 'auto',
  minWidth: '250px',
  marginRight: theme.spacing(2),
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  whiteSpace: 'nowrap',
}));

export default function CurrencyCarousel() {
  const [currencyRates, setCurrencyRates] = useState([]);

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL,ARS-BRL,CLP-BRL,JPY-BRL');
        const data = await response.json();
    
        const formattedRates = currencyData.map(currency => {
          const key = `${currency.code}BRL`;
          const currencyInfo = data[key];
          
          return {
            ...currency,
            price: parseFloat(currencyInfo.bid),
            variation: parseFloat(currencyInfo.pctChange)
          };
        });
    
        setCurrencyRates(formattedRates);
      } catch (error) {
        console.error('Erro ao buscar cotações:', error);
      }
    };

    fetchCurrencyRates();
    
    const intervalId = setInterval(fetchCurrencyRates, 30 * 60 * 1000);  // 30 minutos

    return () => clearInterval(intervalId);
  }, []);

  // Triplica os rates para criar loop infinito
  const repeatedRates = [...currencyRates, ...currencyRates, ...currencyRates];

  return (
    <CarouselContainer>
      <CarouselTrack>
        {repeatedRates.map((currency, index) => (
          <CarouselCard key={`${currency.code}-${index}`}>
            <Box display="flex" alignItems="center" justifyContent="space-around" sx={{ padding: '10px' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{currency.emoji}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {currency.price.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL', 
                    minimumFractionDigits: currency.price <= 0.01 ? 4 : 2, 
                    maximumFractionDigits: currency.price <= 0.01 ? 4 : 2 
                  })}
                </Typography>
                {currency.variation !== 0 && (
                  <Box display="flex" alignItems="center" color={currency.variation > 0 ? 'green' : 'red'}>
                    {currency.variation > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {Math.abs(currency.variation)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </CarouselCard>
        ))}
      </CarouselTrack>
    </CarouselContainer>
  );
}