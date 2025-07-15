import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
createRoot(rootElement).render(  
  <AuthProvider>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>
);