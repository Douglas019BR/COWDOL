// Header.styles.js
import { styled } from '@mui/material/styles';

export const StyledHeader = styled('header')(({ theme }) => ({
  width: '100%', 
  height: '10%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', 
  backgroundColor: 'transparent',
  position: 'fixed', // fixa no topo
  top: 0,
  left: 0,
  zIndex: 100, // garante que fique acima de outros elementos
  padding: 0,
  margin: 0,
}));

export const CarouselContainer = styled('div')(({ theme }) => ({
  width: '100%', // ocupa toda a largura disponível
  height: '100%', // altura total do header
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden', // esconde qualquer conteúdo que estourar
}));