const ROUTES = {
  HOME: '/',
  INITIATIVES_LIST: '/iniziative',
  ACCEPT_DISCOUNT: '/:initiativeId/accetta-buono-sconto',
  ACCEPT_DISCOUNT_SUMMARY: '/:initiativeId/accetta-buono-sconto/riepilogo',
  TOS: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  PRODUCTS: '/:initiativeId/prodotti',
  BUY_MANAGEMENT: '/:initiativeId/gestione-acquisti',
  REFUNDS_MANAGEMENT: '/:initiativeId/gestione-rimborsi',
  PROFILE: '/profilo',
  REVERSE: '/:initiativeId/storna-transazione/:trxId',
  REFUND: '/:initiativeId/richiedi-rimborso/:trxId',
  MODIFY_DOCUMENT: '/:initiativeId/modifica-documento/:trxId/:fileDocNumber',
};

export default ROUTES;
