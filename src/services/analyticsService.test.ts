import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import mixpanel from 'mixpanel-browser';
import { store } from '../redux/store';
import { currentInitiativeIdSelector, currentInitiativeSelector } from '../redux/slices/initiativesSlice';

const mockMixpanelInstance = {
  has_opted_out_tracking: vi.fn(),
  clear_opt_in_out_tracking: vi.fn(),
  set_config: vi.fn(),
  opt_out_tracking: vi.fn(),
  track: vi.fn(),
};

vi.mock('mixpanel-browser', () => ({
  default: {
    init: vi.fn(() => mockMixpanelInstance),
  }
}));

vi.mock('../redux/store', () => ({
  store: {
    getState: vi.fn(),
  }
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
  currentInitiativeIdSelector: vi.fn(),
  currentInitiativeSelector: vi.fn(),
}));

describe('Analytics Setup', () => {
  let consoleWarnMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockMixpanelInstance.has_opted_out_tracking.mockReturnValue(false);
  });

  afterEach(() => {
    consoleWarnMock.mockRestore();
    vi.unstubAllEnvs();
  });

  const loadAnalyticsModule = async () => {
    return await import('./analyticsService'); 
  };

  describe('initAnalytics', () => {
    it('should not initialize if VITE_MIXPANEL_ENABLE is not "true"', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'false');
      
      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mixpanel.init).not.toHaveBeenCalled();
    });

    it('should log a warning and stop if VITE_MIXPANEL_TOKEN is missing', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', '');
      
      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(consoleWarnMock).toHaveBeenCalledWith(
        '[Mixpanel] Missing VITE_MIXPANEL_TOKEN: analytics initialization skipped.'
      );
      expect(mixpanel.init).not.toHaveBeenCalled();
    });

    it('should initialize mixpanel correctly', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      
      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mixpanel.init).toHaveBeenCalledWith(
        'test-token', 
        expect.any(Object), 
        'analytics'
      );
    });

    it('should resume tracking if the user had opted out', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      mockMixpanelInstance.has_opted_out_tracking.mockReturnValue(true);
      
      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mockMixpanelInstance.clear_opt_in_out_tracking).toHaveBeenCalled();
      expect(mockMixpanelInstance.set_config).toHaveBeenCalled();
    });
  });

  describe('disableAnalytics', () => {
    it('should call opt_out_tracking if instantiated and active', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      
      const { initAnalytics, disableAnalytics } = await loadAnalyticsModule();
      initAnalytics(); 
      disableAnalytics(); 

      expect(mockMixpanelInstance.opt_out_tracking).toHaveBeenCalled();
    });
  });

  describe('trackAnalytics', () => {
    it('should not track anything if mixpanel is not enabled or initialized', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'false');
      
      const { trackAnalytics } = await loadAnalyticsModule();
      trackAnalytics('couponAcceptanceUXStartFlow');

      expect(mockMixpanelInstance.track).not.toHaveBeenCalled();
    });

    it('should track the mapped event with correct props if active', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      
      const { initAnalytics, trackAnalytics } = await loadAnalyticsModule();
      initAnalytics(); 
      
      const testProps = { testData: 123 };
      trackAnalytics('couponInvalidCodeError', testProps);

      expect(mockMixpanelInstance.track).toHaveBeenCalledWith(
        'IDPAY_COUPON_INVALID_CODE_ERROR', 
        testProps
      );
    });
  });

  describe('Mixpanel Config Hooks (before_send_events)', () => {
    it('should enrich event properties with Redux state', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLE', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      
      const mockState = { some: 'state' };
      (store.getState as Mock).mockReturnValue(mockState);
      (currentInitiativeIdSelector as Mock).mockReturnValue('init-123');
      (currentInitiativeSelector as Mock).mockReturnValue({ initiativeName: 'Initiative Alpha' });

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      const configCallArgs = (mixpanel.init as Mock).mock.calls[0][1];
      const beforeSendHook = configCallArgs.hooks.before_send_events;

      const baseEvent = {
        event: 'Test Event',
        properties: { baseProp: 'value' }
      } as any; 

      const enrichedEvent = beforeSendHook(baseEvent);

      expect(store.getState).toHaveBeenCalled();
      expect(currentInitiativeIdSelector).toHaveBeenCalledWith(mockState);
      expect(currentInitiativeSelector).toHaveBeenCalledWith(mockState, 'init-123');

      expect(enrichedEvent.properties).toEqual({
        baseProp: 'value',
        initiative_id: 'init-123',
        initiative_name: 'Initiative Alpha'
      });
    });
  });
});