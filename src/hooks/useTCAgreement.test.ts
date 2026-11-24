import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import useTCAgreement from './useTCAgreement';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useAppSelector } from '../redux/hooks';
import { getPortalConsent, savePortalConsent } from '../services/rolePermissionService';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}));

const mockCommonHooks = () => {
  const mockAddError = vi.fn();

  (useAppSelector as Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

  (useErrorDispatcher as Mock).mockReturnValue(mockAddError);

  (useTranslation as Mock).mockReturnValue({
    t: (key: string) => key,
  });

  return { mockAddError };
};

vi.mock('../services/rolePermissionService', () => ({
  getPortalConsent: vi.fn(),
  savePortalConsent: vi.fn(),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher');
vi.mock('react-i18next');

const mockedGetPortalConsent = getPortalConsent as Mock;
const mockedSavePortalConsent = savePortalConsent as Mock;

vi.mock('./useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
  setInitiativesList: vi.fn(),
  intiativesListSelector: vi.fn(),
  initiativesReducer: vi.fn(),
}));

vi.mock('../redux/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('useTCAgreement', () => {
  let mockAddError: Mock;

  const setupHook = (consentResponse: any, saveError?: Error) => {
    if (consentResponse instanceof Error) {
      mockedGetPortalConsent.mockRejectedValue(consentResponse);
    } else {
      mockedGetPortalConsent.mockResolvedValue(consentResponse);
    }

    if (saveError) {
      mockedSavePortalConsent.mockRejectedValue(saveError);
    } else {
      // default success behavior for acceptTOS
      mockedSavePortalConsent.mockResolvedValue(undefined);
    }

    return renderHook(() => useTCAgreement());
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'fake-jwt-token',
    } as any);
    const mocks = mockCommonHooks();
    mockAddError = mocks.mockAddError;
  });

  it('sets isTOSAccepted to false when pending consents exist', async () => {
    const consentData = { versionId: 'v1.2.3', firstAcceptance: true };
    const { result } = setupHook(consentData);

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
      expect(result.current.firstAcceptance).toBe(true);
    });

    expect(mockedGetPortalConsent).toHaveBeenCalledTimes(1);
  });

  it('sets isTOSAccepted to true when no pending consents exist', async () => {
    const { result } = setupHook({});

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(true);
    });
  });

  it.each([
    [401, true],
    [500, false],
  ])('handles consent status %s after token refresh with accepted state %s', async (status, expected) => {
    const { result, rerender } = setupHook({});
    await waitFor(() => expect(result.current.isTOSAccepted).toBe(true));

    mockedGetPortalConsent.mockRejectedValue(
      Object.assign(new AxiosError('Consent request failed'), { response: { status } })
    );
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'refreshed-token',
    } as ReturnType<typeof useAuth>);

    await act(async () => {
      rerender();
    });

    expect(mockedGetPortalConsent).toHaveBeenCalledTimes(2);
    expect(result.current.isTOSAccepted).toBe(expected);
    if (status === 401) {
      expect(result.all.some((state) => !(state instanceof Error) && state.isTOSAccepted === false)).toBe(false);
    }
  });

  it('does not show TOS when the initial consent check returns 401', async () => {
    const error = Object.assign(new AxiosError('Unauthorized'), { response: { status: 401 } });
    const { result } = setupHook(error);
    await act(async () => {});

    expect(mockedGetPortalConsent).toHaveBeenCalledTimes(1);
    expect(result.current.isTOSAccepted).toBeUndefined();
  });

  it('calls savePortalConsent and updates state on success', async () => {
    const consentData = { versionId: 'v2.0.0', firstAcceptance: false };
    const { result } = setupHook(consentData);

    await waitFor(() => expect(result.current.isTOSAccepted).toBe(false));

    await act(async () => {
      result.current.acceptTOS();
    });

    expect(mockedSavePortalConsent).toHaveBeenCalledWith(consentData.versionId);

    await waitFor(() => expect(result.current.isTOSAccepted).toBe(true));

    expect(mockAddError).not.toHaveBeenCalled();
  });
});
