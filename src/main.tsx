import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak/keycloak';


createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={keycloak}  initOptions={{ onLoad: 'login-required', checkLoginIframe: false,
        redirectUri: 'http://localhost:5173' }}  >
    <App />
    </ReactKeycloakProvider>
)
