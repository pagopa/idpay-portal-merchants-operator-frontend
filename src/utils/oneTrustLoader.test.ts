import { __resetCookieStateForTests, initializeCookieOneTrust } from './oneTrustLoader';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.stubEnv('VITE_ONE_TRUST_BASE_URL', 'https://cdn.onetrust.com');
vi.stubEnv('VITE_ONE_TRUST_DOMAIN_ID', 'test-domain-id');

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  __resetCookieStateForTests();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.stubEnv('BASE_URL', '/esercente/');
});

describe('initializeCookieOneTrust', () => {
  it('should create and append the script to document.head', async () => {
    const promise = initializeCookieOneTrust();

    const script = document.head.querySelector('script');
    expect(script).toBeTruthy();
    expect(script?.src).toBe('https://cdn.onetrust.com/scripttemplates/otSDKStub.js');
    expect(script?.getAttribute('data-domain-script')).toBe('test-domain-id');

    script?.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('should reject when the script fails to load', async () => {
    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load OneTrust SDK');
  });

  it('should not add a new script if one already exists', async () => {
    const firstPromise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await firstPromise;

    const secondPromise = initializeCookieOneTrust();
    expect(document.head.querySelectorAll('script')).toHaveLength(1);

    await expect(secondPromise).resolves.toBeUndefined();
  });

  it('should not add another script while initialization is in progress', async () => {
    const firstPromise = initializeCookieOneTrust();
    const secondPromise = initializeCookieOneTrust();

    expect(firstPromise).toBe(secondPromise);
  });

  it('should fix all supported OneTrust links under the /esercente path', async () => {
    document.body.innerHTML = `
      <div id="onetrust-consent-sdk">
        <a
          class="ot-cookie-policy-link"
          href="https://example.com/privacy-policy/"
          target="_blank"
          rel="noopener noreferrer"
        >Privacy</a>
        <a class="privacy-notice-link" href="/informativa-privacy">Privacy notice</a>
        <a class="privacy-notice-link" href="https://example.com/terms-of-service/">Terms</a>
        <a class="privacy-notice-link" href="https://example.com/unsupported">Other</a>
        <a class="privacy-notice-link">Without href</a>
      </div>
    `;

    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await promise;

    vi.advanceTimersByTime(1000);

    const links = document.querySelectorAll<HTMLAnchorElement>('a');
    expect(links[0].href).toBe(`${window.location.origin}/esercente/privacy-policy`);
    expect(links[0].hasAttribute('target')).toBe(false);
    expect(links[0].hasAttribute('rel')).toBe(false);
    expect(links[1].href).toBe(`${window.location.origin}/esercente/privacy-policy`);
    expect(links[2].href).toBe(`${window.location.origin}/esercente/terms-of-service`);
    expect(links[3].href).toBe('https://example.com/unsupported');
    expect(links[4].hasAttribute('href')).toBe(false);
  });

  it('should use /esercente as fallback when BASE_URL is empty', async () => {
    vi.stubEnv('BASE_URL', '');
    document.body.innerHTML = `
      <a class="privacy-notice-link" href="/privacy-policy">Privacy</a>
    `;

    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await promise;

    vi.advanceTimersByTime(1000);

    const link = document.querySelector<HTMLAnchorElement>('.privacy-notice-link');
    expect(link?.href).toBe(`${window.location.origin}/esercente/privacy-policy`);
  });

  it('should not change a link with an invalid URL', async () => {
    document.body.innerHTML = `
      <a class="privacy-notice-link" href="http://[">Invalid link</a>
    `;

    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await promise;

    vi.advanceTimersByTime(1000);

    const link = document.querySelector<HTMLAnchorElement>('.privacy-notice-link');
    expect(link?.getAttribute('href')).toBe('http://[');
  });

  it('should fix links added later through MutationObserver', async () => {
    let observerCallback: MutationCallback | undefined;
    const observe = vi.fn();

    class MutationObserverMock {
      constructor(callback: MutationCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    vi.stubGlobal('MutationObserver', MutationObserverMock);
    document.body.innerHTML = '<div id="onetrust-consent-sdk"></div>';

    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await promise;

    vi.advanceTimersByTime(1000);

    const bannerContainer = document.querySelector('#onetrust-consent-sdk');
    expect(observe).toHaveBeenCalledWith(bannerContainer, {
      childList: true,
      subtree: true,
    });

    bannerContainer!.innerHTML = `
      <a class="ot-cookie-policy-link" href="/terms-of-service">Terms</a>
    `;
    observerCallback?.([], {} as MutationObserver);

    const link = document.querySelector<HTMLAnchorElement>('.ot-cookie-policy-link');
    expect(link?.href).toBe(`${window.location.origin}/esercente/terms-of-service`);
  });
});
