import mixpanel, {
  type AutocaptureConfig,
  type Config,
  type Mixpanel,
} from 'mixpanel-browser';

const mixpanelEnabled = import.meta.env.VITE_MIXPANEL_ENABLE === 'true';
const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

const AUTOCAPTURE_CONFIG: AutocaptureConfig = {
  pageview: 'url-with-path',
  click: true,
  input: true,
  submit: true,
  dead_click: true,
  rage_click: true,
  scroll: false,
  capture_text_content: false,
  block_selectors: ['.mp-no-track'],
};

const MIXPANEL_CONFIG: Partial<Config> = {
  api_host: import.meta.env.VITE_MIXPANEL_API_HOST || 'https://api-eu.mixpanel.com',
  persistence: 'localStorage',
  persistence_name: 'idpay-merchants-operator-analytics',
  opt_out_tracking_cookie_prefix: '__mp_idpay_merchants_operator_analytics_',
  debug: import.meta.env.VITE_MIXPANEL_DEBUG === 'true',
  autocapture: AUTOCAPTURE_CONFIG,
  ip: false,
  property_blacklist: [
    '$current_url',
    '$initial_referrer',
    '$referrer',
    'current_url_search',
  ],
  record_sessions_percent: 0,
  record_heatmap_data: false,
};

let analyticsInstance: Mixpanel | undefined;
let analyticsActive = false;

const resumeAnalytics = (instance: Mixpanel) => {
  if (instance.has_opted_out_tracking()) {
    instance.clear_opt_in_out_tracking();
    instance.set_config({ autocapture: AUTOCAPTURE_CONFIG });
  }
  analyticsActive = true;
};

export const initAnalytics = () => {
  if (!mixpanelEnabled) {
    return;
  }

  if (analyticsInstance) {
    if (!analyticsActive) {
      resumeAnalytics(analyticsInstance);
    }
    return;
  }

  if (!mixpanelToken) {
    console.warn(
      '[Mixpanel] Missing VITE_MIXPANEL_TOKEN: analytics initialization skipped.'
    );
    return;
  }

  analyticsInstance = mixpanel.init(mixpanelToken, MIXPANEL_CONFIG, 'analytics');
  resumeAnalytics(analyticsInstance);
};

export const disableAnalytics = () => {
  if (analyticsInstance && analyticsActive) {
    analyticsInstance.opt_out_tracking();
    analyticsActive = false;
  }
};
