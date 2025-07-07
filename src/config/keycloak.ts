import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://api-mcshared.dev.cstar.pagopa.it/auth-itn', // URL del tuo server Keycloak
  realm: 'merchant-operator',     // Nome del tuo realm
  clientId: 'frontend',    // ID del tuo client
});

export default keycloak;