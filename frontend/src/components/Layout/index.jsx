import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/index';
import Footer from './Footer/index';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <Box>
      <Header />
      <Box sx={{ minHeight: '80vh' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;