import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import keycloak from './keycloak/keycloak';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider authClient={keycloak} initOptions={{
    onLoad: 'login-required', checkLoginIframe: false
  }}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </ReactKeycloakProvider>)

