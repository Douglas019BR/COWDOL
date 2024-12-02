import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StockPortfolio from './pages/StockPortfolio';
import HelloWorldPage from './pages/HelloWorldPage'; 
import Layout from './components/Layout/index';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <StockPortfolio />,
      },
      {
        path: "hello",
        element: <HelloWorldPage />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
