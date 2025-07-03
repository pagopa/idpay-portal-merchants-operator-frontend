import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};


if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId) {
  throw new Error('Mancano le configurazioni Keycloak richieste');
}

const keycloak = new Keycloak(keycloakConfig as {
  url: string;
  realm: string;
  clientId: string;
});

export default keycloak;