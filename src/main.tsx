import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import keycloak from './keycloak/keycloak';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { KeycloakProvider } from "keycloak-react-web";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <KeycloakProvider client={keycloak} initOptions={{
    onLoad: 'login-required', checkLoginIframe: false,
    redirectUri: import.meta.env.VITE_REDIRECT_URI
  }}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </KeycloakProvider>)

