import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../store/authStore', () => ({
  authStore: {
    getState: vi.fn(),
  },
}));

describe('BaseApiClient', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('createApiConfig sets baseURL from env and returns securityWorker', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.local');

    const { createApiConfig } = await import('./BaseApiClient');

    const config = createApiConfig();

    expect(config.baseURL).toBe('https://api.test.local');
    expect(typeof config.securityWorker).toBe('function');
  });

  it('securityWorker returns empty object when token is null', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.local');

    const { createApiConfig } = await import('./BaseApiClient');
    const { securityWorker } = createApiConfig();

    const result = await securityWorker!(null);

    expect(result).toEqual({});
  });

  it('securityWorker returns Authorization header when token is provided', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.local');

    const { createApiConfig } = await import('./BaseApiClient');
    const { securityWorker } = createApiConfig();

    const result = await securityWorker!('abc123');

    expect(result).toEqual({
      headers: {
        Authorization: 'Bearer abc123',
      },
    });
  });

  it('getAuthToken returns token from authStore', async () => {
    const { authStore } = await import('../store/authStore');
    (authStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'my_token',
    });

    const { getAuthToken } = await import('./BaseApiClient');

    const token = getAuthToken();

    expect(token).toBe('my_token');
  });

  it('getAuthToken returns null when token is undefined', async () => {
    const { authStore } = await import('../store/authStore');
    (authStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: undefined,
    });

    const { getAuthToken } = await import('./BaseApiClient');

    const token = getAuthToken();

    expect(token).toBeNull();
  });
});
