import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOneTrustNotice } from './useOneTrustNotice';

type NoticeApi = {
  Initialized?: Promise<void>;
  LoadNotices: (urls: string[], forceReload: boolean) => Promise<void>;
};

type OneTrustWindow = Window & {
  OneTrust?: {
    NoticeApi?: NoticeApi;
  };
};

const getOneTrustWindow = () => window as OneTrustWindow;

describe('useOneTrustNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    delete getOneTrustWindow().OneTrust;
    vi.stubEnv('VITE_ONE_TRUST_OTNOTICE_CDN_URL', 'https://cdn.example.com/notice.js');
    vi.stubEnv('VITE_ONE_TRUST_OTNOTICE_CDN_SETTINGS', 'notice-settings');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('loads the notice script and calls LoadNotices after the SDK is initialized', async () => {
    const initialized = Promise.resolve();
    const loadNotices = vi.fn().mockResolvedValue(undefined);
    getOneTrustWindow().OneTrust = {
      NoticeApi: { Initialized: initialized, LoadNotices: loadNotices },
    };
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice(
        'https://example.com/privacy.json',
        false,
        setContentLoaded,
        '/privacy-policy'
      )
    );

    const script = document.getElementById(
      'otprivacy-notice-script'
    ) as HTMLScriptElement | null;
    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(script?.src).toBe('https://cdn.example.com/notice.js');
    expect(script?.type).toBe('text/javascript');
    expect(script?.charset).toBe('UTF-8');
    expect(script?.text).toBe('settings="notice-settings"');

    await act(async () => {
      script?.dispatchEvent(new Event('load'));
      await initialized;
    });

    expect(loadNotices).toHaveBeenCalledWith(
      ['https://example.com/privacy.json'],
      false
    );
    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('reuses an existing script and its initialized promise', async () => {
    const script = document.createElement('script');
    script.id = 'otprivacy-notice-script';
    document.head.appendChild(script);

    const loadNotices = vi.fn().mockResolvedValue(undefined);
    const initialized = Promise.resolve();
    getOneTrustWindow().OneTrust = {
      NoticeApi: { Initialized: initialized, LoadNotices: loadNotices },
    };
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );

    await act(async () => {
      await initialized;
    });

    expect(document.querySelectorAll('#otprivacy-notice-script')).toHaveLength(1);
    expect(loadNotices).toHaveBeenCalledWith(['notice.json'], false);
    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('completes loading when the existing script has no OneTrust object', async () => {
    const script = document.createElement('script');
    script.id = 'otprivacy-notice-script';
    document.head.appendChild(script);
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('completes loading when NoticeApi is unavailable', async () => {
    const script = document.createElement('script');
    script.id = 'otprivacy-notice-script';
    document.head.appendChild(script);
    getOneTrustWindow().OneTrust = {};
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('uses a resolved fallback when Initialized is undefined', async () => {
    const script = document.createElement('script');
    script.id = 'otprivacy-notice-script';
    document.head.appendChild(script);
    getOneTrustWindow().OneTrust = {
      NoticeApi: { LoadNotices: vi.fn().mockResolvedValue(undefined) },
    };
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('handles a script load error', async () => {
    const setContentLoaded = vi.fn();

    renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );

    const script = document.getElementById('otprivacy-notice-script');

    await act(async () => {
      script?.dispatchEvent(new Event('error'));
      await Promise.resolve();
    });

    expect(setContentLoaded).toHaveBeenCalledWith(true);
  });

  it('does not update contentLoaded after unmount', async () => {
    let resolveInitialized!: () => void;
    const initialized = new Promise<void>((resolve) => {
      resolveInitialized = resolve;
    });
    const loadNotices = vi.fn().mockResolvedValue(undefined);
    getOneTrustWindow().OneTrust = {
      NoticeApi: { Initialized: initialized, LoadNotices: loadNotices },
    };
    const setContentLoaded = vi.fn();

    const { unmount } = renderHook(() =>
      useOneTrustNotice('notice.json', false, setContentLoaded, 'privacy')
    );
    const script = document.getElementById('otprivacy-notice-script');

    await act(async () => {
      script?.dispatchEvent(new Event('load'));
    });
    unmount();

    await act(async () => {
      resolveInitialized();
      await initialized;
    });

    expect(setContentLoaded).not.toHaveBeenCalled();
  });

  it('normalizes internal links and sets the notice sidebar height', () => {
    const internalLink = document.createElement('a');
    internalLink.href = '#details';
    const externalLink = document.createElement('a');
    externalLink.href = 'https://example.com';
    const linkWithoutHref = document.createElement('a');
    const content = document.createElement('div');
    content.className = 'otnotice-content';
    content.append(internalLink, externalLink, linkWithoutHref);
    const sidebar = document.createElement('div');
    sidebar.className = 'otnotice-menu';
    document.body.append(content, sidebar);

    renderHook(() =>
      useOneTrustNotice('notice.json', true, vi.fn(), '/privacy-policy/')
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(internalLink.getAttribute('href')).toBe(
      '/esercente/privacy-policy#details'
    );
    expect(externalLink.getAttribute('href')).toBe('https://example.com');
    expect(linkWithoutHref.hasAttribute('href')).toBe(false);
    expect(sidebar.style.maxHeight).toBe('65%');
  });

  it('does nothing in the layout effect while content is not loaded', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

    renderHook(() =>
      useOneTrustNotice('notice.json', false, vi.fn(), 'privacy-policy')
    );

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it('clears the layout timer when unmounted', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = renderHook(() =>
      useOneTrustNotice('notice.json', true, vi.fn(), 'privacy-policy')
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('handles the absence of a notice sidebar', () => {
    renderHook(() =>
      useOneTrustNotice('notice.json', true, vi.fn(), 'privacy-policy')
    );

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
  });
});
