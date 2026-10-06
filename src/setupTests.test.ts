import { afterEach, describe, expect, it, vi } from 'vitest';

const originalLocalStorage = window.localStorage;
const originalSessionStorage = window.sessionStorage;

const importSetupTestsFresh = async () => {
  vi.resetModules();
  await import('./setupTests.ts');
};

describe('setupTests', () => {
  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      configurable: true,
    });
  });

  it('installs in-memory storage fallbacks when browser storage is missing', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: undefined,
      configurable: true,
    });

    await importSetupTestsFresh();

    window.localStorage.setItem('setup-tests-key', 'value-1');
    expect(window.localStorage.getItem('setup-tests-key')).toBe('value-1');

    window.sessionStorage.setItem('setup-tests-session-key', 'value-2');
    expect(window.sessionStorage.getItem('setup-tests-session-key')).toBe('value-2');
  });

  it('keeps the existing storage objects when they are already available', async () => {
    const localStorageSpy = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    const sessionStorageSpy = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageSpy,
      configurable: true,
    });

    await importSetupTestsFresh();

    expect(window.localStorage).toBe(localStorageSpy);
    expect(window.sessionStorage).toBe(sessionStorageSpy);
  });
});