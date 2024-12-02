import { styled } from '@mui/joy/styles';
import { keyframes } from '@emotion/react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';

const slideLeft = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

export const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  gap: theme.spacing(1),
  height: '40px',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 0, 
  left: 0, 
  backgroundColor: 'transparent',
  overflow: 'hidden', 
}));

export const CarouselCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  marginRight: theme.spacing(1),
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  boxShadow: 'none',
  border: 'none',
  backgroundColor: 'transparent',
  animation: `${slideLeft} 10s linear infinite`, 
  whiteSpace: 'nowrap',
}));