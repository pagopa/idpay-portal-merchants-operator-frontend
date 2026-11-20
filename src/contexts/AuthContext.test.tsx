import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';
import keycloak from '../config/keycloak';
import { authStore } from '../store/authStore';
import { getAuthToken } from '../api/BaseApiClient';
import useTCAgreement from '../hooks/useTCAgreement';
import { getPortalConsent } from '../services/rolePermissionService';

vi.mock('../config/keycloak', () => ({
  default: {
    authenticated: true,
    token: 'initial-token',
    authServerUrl: 'https://auth.test',
    init: vi.fn(),
    updateToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../services/rolePermissionService', () => ({
  getPortalConsent: vi.fn(),
  savePortalConsent: vi.fn(),
}));

describe('AuthProvider token refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    authStore.setState({ token: null, isAuthenticated: false, logoutFn: null });
    keycloak.token = 'initial-token';
    vi.mocked(keycloak.init).mockResolvedValue(true);
    vi.mocked(keycloak.updateToken).mockResolvedValue(false);
    vi.spyOn(axios, 'get').mockResolvedValue({ data: {} });
    vi.mocked(getPortalConsent).mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderSession = async () => {
    const hook = renderHook(() => ({ auth: useAuth(), consent: useTCAgreement() }), {
      wrapper: AuthProvider,
    });
    await act(async () => {});
    expect(hook.result.current.auth.isAuthenticated).toBe(true);
    expect(hook.result.current.consent.isTOSAccepted).toBe(true);
    return hook;
  };

  const checkRefresh = async () => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
  };

  it('uses the refreshed API token when the context change triggers a consent check', async () => {
    const { result } = await renderSession();
    const requestTokens: Array<string | null> = [];
    vi.mocked(getPortalConsent).mockImplementation(async () => {
      requestTokens.push(getAuthToken());
      return {};
    });
    vi.mocked(keycloak.updateToken).mockImplementation(async () => {
      keycloak.token = 'refreshed-token';
      return true;
    });

    await checkRefresh();

    expect(requestTokens).toEqual(['refreshed-token']);
    expect(result.current.auth.token).toBe('refreshed-token');
    expect(result.current.consent.isTOSAccepted).toBe(true);
    expect(keycloak.logout).not.toHaveBeenCalled();
  });

  it('does not repeat the consent check when the token was not refreshed', async () => {
    await renderSession();
    vi.mocked(getPortalConsent).mockClear();
    await checkRefresh();

    expect(keycloak.updateToken).toHaveBeenCalledWith(70);
    expect(getPortalConsent).not.toHaveBeenCalled();
    expect(keycloak.logout).not.toHaveBeenCalled();
  });

  it('logs out when token refresh fails', async () => {
    const { result } = await renderSession();
    vi.mocked(keycloak.updateToken).mockRejectedValue(new Error('Refresh failed'));

    await checkRefresh();

    expect(keycloak.logout).toHaveBeenCalledTimes(1);
    expect(result.current.auth.isAuthenticated).toBe(false);
  });
});
