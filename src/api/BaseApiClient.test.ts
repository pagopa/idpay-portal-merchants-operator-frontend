import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({
  isAxiosError: vi.fn(),
}));

vi.mock('../store/authStore', () => ({
  authStore: {
    getState: vi.fn(),
  },
}));

describe('BaseApiClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
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
      executeLogout: vi.fn(),
    });

    const { getAuthToken } = await import('./BaseApiClient');

    const token = getAuthToken();

    expect(token).toBe('my_token');
  });

  it('getAuthToken returns null when token is undefined', async () => {
    const { authStore } = await import('../store/authStore');
    (authStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: undefined,
      executeLogout: vi.fn(),
    });

    const { getAuthToken } = await import('./BaseApiClient');

    const token = getAuthToken();

    expect(token).toBeNull();
  });

  it('attachUnauthorizedLogoutInterceptor registers a response interceptor', async () => {
    const { attachUnauthorizedLogoutInterceptor } = await import('./BaseApiClient');
    const use = vi.fn();

    attachUnauthorizedLogoutInterceptor({
      instance: {
        interceptors: {
          response: { use },
        },
      },
    } as never);

    expect(use).toHaveBeenCalledTimes(1);
    expect(use.mock.calls[0][0]).toBeTypeOf('function');
    expect(use.mock.calls[0][1]).toBeTypeOf('function');
  });

  it('response interceptor executes logout on axios 401 errors', async () => {
    const axios = await import('axios');
    const { authStore } = await import('../store/authStore');
    const executeLogout = vi.fn();
    const use = vi.fn();
    const error = { response: { status: 401 } };

    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (authStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'my_token',
      executeLogout,
    });

    const { attachUnauthorizedLogoutInterceptor } = await import('./BaseApiClient');

    attachUnauthorizedLogoutInterceptor({
      instance: {
        interceptors: {
          response: { use },
        },
      },
    } as never);

    const errorHandler = use.mock.calls[0][1];

    await expect(errorHandler(error)).rejects.toBe(error);
    expect(executeLogout).toHaveBeenCalledTimes(1);
  });

  it('response interceptor does not logout on non-401 errors', async () => {
    const axios = await import('axios');
    const { authStore } = await import('../store/authStore');
    const executeLogout = vi.fn();
    const use = vi.fn();
    const error = { response: { status: 500 } };

    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (authStore.getState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      token: 'my_token',
      executeLogout,
    });

    const { attachUnauthorizedLogoutInterceptor } = await import('./BaseApiClient');

    attachUnauthorizedLogoutInterceptor({
      instance: {
        interceptors: {
          response: { use },
        },
      },
    } as never);

    const errorHandler = use.mock.calls[0][1];

    await expect(errorHandler(error)).rejects.toBe(error);
    expect(executeLogout).not.toHaveBeenCalled();
  });
});
