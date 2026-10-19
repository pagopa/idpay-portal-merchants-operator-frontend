import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import mixpanel from 'mixpanel-browser';
import { store } from '../redux/store';
import { currentInitiativeIdSelector, currentInitiativeSelector } from '../redux/slices/initiativesSlice';
import { pathCleaner, extractNameMP } from '../utils/helpers';

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
  },
}));

vi.mock('../redux/store', () => ({
  store: {
    getState: vi.fn(),
  },
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
  currentInitiativeIdSelector: vi.fn(),
  currentInitiativeSelector: vi.fn(),
}));

vi.mock('../utils/helpers', () => ({
  pathCleaner: vi.fn((path: string) => `/cleaned${path}`),
  extractNameMP: vi.fn((classes?: string) => (classes ? 'extracted-element-name' : undefined)),
}));

vi.mock('../routes', () => ({
  default: {
    HOME: '/home',
    INITIATIVE: '/initiative/:id',
  },
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
    it('should not initialize if VITE_MIXPANEL_ENABLED is not "true"', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'false');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mixpanel.init).not.toHaveBeenCalled();
    });

    it('should log a warning and stop if VITE_MIXPANEL_TOKEN is missing', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', '');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(consoleWarnMock).toHaveBeenCalledWith(
        '[Mixpanel] Missing VITE_MIXPANEL_TOKEN: analytics initialization skipped.'
      );
      expect(mixpanel.init).not.toHaveBeenCalled();
    });

    it('should initialize mixpanel with default api host if not provided', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mixpanel.init).toHaveBeenCalledWith(
        'test-token',
        expect.objectContaining({
          api_host: 'https://api-eu.mixpanel.com',
          persistence: 'localStorage',
          persistence_name: 'idpay-merchants-operator-analytics',
          opt_out_tracking_cookie_prefix: '__mp_idpay_merchants_operator_analytics_',
          ip: false,
          record_sessions_percent: 0,
          record_heatmap_data: false,
        }),
        'analytics'
      );
    });

    it('should initialize mixpanel with custom api host and debug flag', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      vi.stubEnv('VITE_MIXPANEL_API_HOST', 'https://custom-host.mixpanel.com');
      vi.stubEnv('VITE_MIXPANEL_DEBUG', 'true');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mixpanel.init).toHaveBeenCalledWith(
        'test-token',
        expect.objectContaining({
          api_host: 'https://custom-host.mixpanel.com',
          debug: true,
        }),
        'analytics'
      );
    });

    it('should resume tracking if user previously opted out', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');
      mockMixpanelInstance.has_opted_out_tracking.mockReturnValue(true);

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      expect(mockMixpanelInstance.clear_opt_in_out_tracking).toHaveBeenCalled();
      expect(mockMixpanelInstance.set_config).toHaveBeenCalledWith(
        expect.objectContaining({
          autocapture: expect.any(Object),
        })
      );
    });

    it('should not re-initialize mixpanel if instance already exists', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();
      initAnalytics();

      expect(mixpanel.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('disableAnalytics', () => {
    it('should call opt_out_tracking if active', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const { initAnalytics, disableAnalytics } = await loadAnalyticsModule();
      initAnalytics();
      disableAnalytics();

      expect(mockMixpanelInstance.opt_out_tracking).toHaveBeenCalled();
    });

    it('should not call opt_out_tracking if analytics was not active', async () => {
      const { disableAnalytics } = await loadAnalyticsModule();
      disableAnalytics();

      expect(mockMixpanelInstance.opt_out_tracking).not.toHaveBeenCalled();
    });
  });

  describe('trackAnalytics', () => {
    it('should not track when mixpanel is disabled', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'false');

      const { trackAnalytics } = await loadAnalyticsModule();
      trackAnalytics('couponAcceptanceUXStartFlow');

      expect(mockMixpanelInstance.track).not.toHaveBeenCalled();
    });

    it('should track mapped events with passed properties', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const { initAnalytics, trackAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      const props = { amount: 100 };
      trackAnalytics('couponPaymentUXSuccess', props);

      expect(mockMixpanelInstance.track).toHaveBeenCalledWith(
        'IDPAY_COUPON_PAYMENT_UX_SUCCESS',
        props
      );
    });
  });

  describe('Autocapture Configuration', () => {
    it('should validate allowed elements in allow_element_callback', async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      const configCallArgs = (mixpanel.init as Mock).mock.calls[0][1];
      const allowCallback = configCallArgs.autocapture.allow_element_callback;

      const mockValidElement = {
        closest: vi.fn().mockReturnValue(document.createElement('button')),
      };
      const mockInvalidElement = {
        closest: vi.fn().mockReturnValue(null),
      };

      expect(allowCallback(mockValidElement as any)).toBe(true);
      expect(allowCallback(mockInvalidElement as any)).toBe(false);
    });
  });

  describe('Mixpanel Config Hooks (before_send_events)', () => {
    const setupHook = async () => {
      vi.stubEnv('VITE_MIXPANEL_ENABLED', 'true');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'test-token');

      const mockState = { initiative: 'state' };
      (store.getState as Mock).mockReturnValue(mockState);
      (currentInitiativeIdSelector as Mock).mockReturnValue('init-123');
      (currentInitiativeSelector as Mock).mockReturnValue({ initiativeName: 'Initiative Alpha' });

      const { initAnalytics } = await loadAnalyticsModule();
      initAnalytics();

      const configCallArgs = (mixpanel.init as Mock).mock.calls[0][1];
      return configCallArgs.hooks.before_send_events;
    };

    it('should enrich event with Redux initiative state and cleaned path from target element', async () => {
      const beforeSendHook = await setupHook();

      const inputEvent = {
        event: '$mp_click',
        properties: {
          current_url_path: '/path/123',
          $pathname: '/path/123',$target: {
            $tag_name: 'button',$classes: 'btn-primary',
          },
          $el_text: 'Click Me',
          unrelatedProp: 'keep_me',
        },
      } as any;

      const result = beforeSendHook(inputEvent);

      expect(pathCleaner).toHaveBeenCalledWith('/path/123', expect.arrayContaining(['esercente', 'init-123']));
      expect(extractNameMP).toHaveBeenCalledWith('btn-primary');

      expect(result).toEqual({
        event: '$mp_click',
        properties: {
          unrelatedProp: 'keep_me',
          current_url_path: '/cleaned/path/123',
          $pathname: '/cleaned/path/123',
          $el_name: 'extracted-element-name',$el_text: 'Click Me',
          initiative_id: 'init-123',
          initiative_name: 'Initiative Alpha',
        },
      });
    });

    it('should resolve target from $elements if$target is not a valid element', async () => {
      const beforeSendHook = await setupHook();

      const inputEvent = {
        event: '$mp_click',
        properties: {
          $target: {$tag_name: 'div',
          },
          $elements: [
            { $tag_name: 'span' },
            { $tag_name: 'a',$classes: 'link-class' },
          ],
          $el_text: 'Link Text',
        },
      } as any;

      const result = beforeSendHook(inputEvent);

      expect(result.properties.$el_name).toBe('extracted-element-name');
      expect(result.properties.$el_text).toBe('Link Text');
    });

    it('should handle option elements by changing event name and using aria-label if present', async () => {
      const beforeSendHook = await setupHook();

      const inputEvent = {
        event: '$mp_click',
        properties: {
          $target: {
            '$attr-role': 'option',
            '$attr-aria-label': 'Option Label',
          },
          $el_text: 'Option Text',
        },
      } as any;

      const result = beforeSendHook(inputEvent);

      expect(result.event).toBe('$mp_input_change');
      expect(result.properties.$el_text).toBe('Option Label');
    });

    it('should fallback to tag_name when extractNameMP returns undefined', async () => {
      (extractNameMP as Mock).mockReturnValueOnce(undefined);
      const beforeSendHook = await setupHook();

      const inputEvent = {
        event: '$mp_click',
        properties: {
          $target: {$tag_name: 'button',
          },
        },
      } as any;

      const result = beforeSendHook(inputEvent);

      expect(result.properties.$el_name).toBe('button');
    });
  });
});