import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#00897b' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  shape: { borderRadius: 8 },
});

export default theme;
