import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StockPortfolio from './pages/StockPortfolio';
import HelloWorldPage from './pages/HelloWorldPage'; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <StockPortfolio />,
    children: [
      {
        path: "hello",
        element: <HelloWorldPage />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;