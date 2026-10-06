import { disableAnalytics, initAnalytics } from './services/analyticsService';

// const ANALYTICS_COOKIE_GROUP = 'C0002';
const ANALYTICS_COOKIE_GROUP = 'C0001'; // test

let consentListenerRegistered = false;
let consentWrapperConfigured = false;

const hasAnalyticsConsent = () =>
  (window.OnetrustActiveGroups ?? '')
    .split(',')
    .map((group) => group.trim())
    .includes(ANALYTICS_COOKIE_GROUP);

export const synchronizeAnalyticsConsent = () => {
  if (hasAnalyticsConsent()) {
    initAnalytics();
  } else {
    disableAnalytics();
  }
};

const registerConsentListener = () => {
  synchronizeAnalyticsConsent();

  if (!consentListenerRegistered && window.OneTrust?.OnConsentChanged) {
    window.OneTrust.OnConsentChanged(synchronizeAnalyticsConsent);
    consentListenerRegistered = true;
  }
};

export const configureAnalyticsConsent = () => {
  if (!consentWrapperConfigured) {
    const previousOptanonWrapper = window.OptanonWrapper;

    window.OptanonWrapper = () => {
      previousOptanonWrapper?.();
      registerConsentListener();
    };
    consentWrapperConfigured = true;
  }

  if (window.OneTrust?.OnConsentChanged) {
    registerConsentListener();
  }
};
