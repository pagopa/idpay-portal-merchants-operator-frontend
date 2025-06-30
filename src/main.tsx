import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx';
import { KeycloakProvider } from "keycloak-react-web";
import { keycloak } from './keycloak/keycloak.ts';



createRoot(document.getElementById('root')!).render(
    <>
    <KeycloakProvider client={keycloak}  initOptions={{ onLoad: 'login-required', checkLoginIframe: false,
        redirectUri: 'http://localhost:5173' }}  >
    <App />
    </KeycloakProvider>
 </>
);