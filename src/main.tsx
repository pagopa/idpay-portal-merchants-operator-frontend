import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from "./contexts/AuthContext";
import './locale';
import { initializeCookieOneTrust } from './utils/oneTrustLoader.ts';

initializeCookieOneTrust().catch(err => {
  console.log('Failed to initialize Cookie OneTrust: ', err);
})

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
createRoot(rootElement).render(  
  <AuthProvider>
    <BrowserRouter basename='/esercente'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </AuthProvider>
);