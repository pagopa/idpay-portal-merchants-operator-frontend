import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initAnalytics, disableAnalytics } from './services/analyticsService';

declare global {
  interface Window {
    OnetrustActiveGroups?: string;
    OneTrust?: {
      OnConsentChanged?: (callback: () => void) => void;
    };
    OptanonWrapper?: () => void;
  }
}

vi.mock('./services/analyticsService', () => ({
  initAnalytics: vi.fn(),
  disableAnalytics: vi.fn(),
}));

describe('Analytics Consent Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    delete window.OnetrustActiveGroups;
    delete window.OneTrust;
    delete window.OptanonWrapper;
  });

  const loadConsentModule = async () => {
    return await import('./consentAndAnalyticsConfiguration');
  };

  describe('synchronizeAnalyticsConsent', () => {
    it('should call initAnalytics if C0001 is in OnetrustActiveGroups', async () => {
      window.OnetrustActiveGroups = ',C0001,C0003,';
      const { synchronizeAnalyticsConsent } = await loadConsentModule();
      
      synchronizeAnalyticsConsent();
      
      expect(initAnalytics).toHaveBeenCalled();
      expect(disableAnalytics).not.toHaveBeenCalled();
    });

    it('should call disableAnalytics if C0001 is not in OnetrustActiveGroups', async () => {
      window.OnetrustActiveGroups = ',C0002,C0003,';
      const { synchronizeAnalyticsConsent } = await loadConsentModule();
      
      synchronizeAnalyticsConsent();
      
      expect(disableAnalytics).toHaveBeenCalled();
      expect(initAnalytics).not.toHaveBeenCalled();
    });

    it('should call disableAnalytics if OnetrustActiveGroups is undefined', async () => {
      window.OnetrustActiveGroups = undefined;
      const { synchronizeAnalyticsConsent } = await loadConsentModule();
      
      synchronizeAnalyticsConsent();
      
      expect(disableAnalytics).toHaveBeenCalled();
    });
  });

  describe('configureAnalyticsConsent', () => {
    it('should wrap existing OptanonWrapper and execute the previous one', async () => {
      const previousWrapper = vi.fn();
      window.OptanonWrapper = previousWrapper;
      
      const { configureAnalyticsConsent } = await loadConsentModule();
      configureAnalyticsConsent();
      
      expect(window.OptanonWrapper).not.toBe(previousWrapper);
      
      if (window.OptanonWrapper) {
        window.OptanonWrapper();
      }
      
      expect(previousWrapper).toHaveBeenCalled();
    });

    it('should synchronize consent and register listener when wrapper is executed', async () => {
      window.OnetrustActiveGroups = 'C0001';
      window.OneTrust = { OnConsentChanged: vi.fn() };
      
      const { configureAnalyticsConsent } = await loadConsentModule();
      configureAnalyticsConsent();
      
      if (window.OptanonWrapper) {
        window.OptanonWrapper();
      }
      
      expect(initAnalytics).toHaveBeenCalled();
      expect(window.OneTrust.OnConsentChanged).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should register listener immediately if OneTrust is already available', async () => {
      window.OneTrust = { OnConsentChanged: vi.fn() };
      
      const { configureAnalyticsConsent } = await loadConsentModule();
      configureAnalyticsConsent();
      
      expect(window.OneTrust.OnConsentChanged).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not configure the wrapper more than once', async () => {
      window.OptanonWrapper = vi.fn();
      
      const { configureAnalyticsConsent } = await loadConsentModule();
      
      configureAnalyticsConsent();
      const firstWrapper = window.OptanonWrapper;
      
      configureAnalyticsConsent();
      const secondWrapper = window.OptanonWrapper;
      
      expect(firstWrapper).toBe(secondWrapper);
    });

    it('should not register the consent listener more than once', async () => {
      window.OneTrust = { OnConsentChanged: vi.fn() };
      
      const { configureAnalyticsConsent } = await loadConsentModule();
      
      configureAnalyticsConsent();
      configureAnalyticsConsent();
      
      expect(window.OneTrust.OnConsentChanged).toHaveBeenCalledTimes(1);
    });
  });
});