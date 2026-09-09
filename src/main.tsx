import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import './locale';
import { initializeCookieOneTrust } from './utils/oneTrustLoader.ts';
import { logger } from './utils/logger';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import { configureAnalyticsConsent } from './consentAndAnalyticsConfiguration.ts';

configureAnalyticsConsent();
initializeCookieOneTrust().catch((err) => {
  logger.error('Failed to initialize Cookie OneTrust:', err);
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
createRoot(rootElement).render(
  <AuthProvider>
    <Provider store={store}>
      <BrowserRouter basename="/esercente">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </AuthProvider>
);
