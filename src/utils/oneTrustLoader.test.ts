import { __resetCookieStateForTests, initializeCookieOneTrust } from "./oneTrustLoader";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.stubEnv('VITE_ONE_TRUST_BASE_URL', 'https://cdn.onetrust.com');
vi.stubEnv('VITE_ONE_TRUST_DOMAIN_ID', 'test-domain-id');

beforeEach(() => {
  vi.resetModules();
  __resetCookieStateForTests()
  document.head.innerHTML = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('initializeCookieOneTrust', () => {
  it('dovrebbe creare e appendere lo script al document.head', async () => {
    const promise = initializeCookieOneTrust();

    const script = document.head.querySelector('script');
    expect(script).toBeTruthy();
    expect(script?.src).toBe('https://cdn.onetrust.com/scripttemplates/otSDKStub.js');
    expect(script?.getAttribute('data-domain-script')).toBe('test-domain-id');

    script?.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('should throw error', async () => {
    const promise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load OneTrust SDK');
  });

  it("shouldn't add a new script if one already exist", async () => {
    const firstPromise = initializeCookieOneTrust();
    const script = document.head.querySelector('script');
    script?.dispatchEvent(new Event('load'));
    await firstPromise;

    const secondPromise = initializeCookieOneTrust();
    expect(document.head.querySelectorAll('script')).toHaveLength(1);

    await expect(secondPromise).resolves.toBeUndefined();
  });

  it("shouldn't add script while initialization", async () => {
    const firstPromise = initializeCookieOneTrust();
    const secondPromise = initializeCookieOneTrust();

    expect(firstPromise).toBe(secondPromise);
  });
});
