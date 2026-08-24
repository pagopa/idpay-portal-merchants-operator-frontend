import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInitiativeStatusAction } from './useInitiativeStatusAction';
import { useAppSelector } from '../redux/hooks';
import { currentInitiativeSelector } from '../redux/slices/initiativesSlice';
import { useActionPermission } from './useActionPermission';

vi.mock('../redux/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../redux/slices/initiativesSlice', () => ({
  currentInitiativeSelector: vi.fn(),
}));

vi.mock('./useActionPermission', () => ({
  useActionPermission: vi.fn(),
}));

describe('useInitiativeStatusAction', () => {
  const mockGetPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useActionPermission).mockReturnValue({
      getPermission: mockGetPermission,
    });
  });

  it('returns isActionPermitted as true when action is permitted', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({} as any)
    );
    vi.mocked(currentInitiativeSelector).mockReturnValue({
      status: 'PUBLISHED',
    } as any);
    mockGetPermission.mockReturnValue(true);

    const { result } = renderHook(() => useInitiativeStatusAction('init-123'));

    expect(result.current.isActionPermitted).toBe(true);
    expect(mockGetPermission).toHaveBeenCalledWith(
      'commons.permissions.initiativeStatus',
      'PUBLISHED'
    );
  });

  it('returns isActionPermitted as false when action is not permitted', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({} as any)
    );
    vi.mocked(currentInitiativeSelector).mockReturnValue({
      status: 'DRAFT',
    } as any);
    mockGetPermission.mockReturnValue(false);

    const { result } = renderHook(() => useInitiativeStatusAction('init-123'));

    expect(result.current.isActionPermitted).toBe(false);
    expect(mockGetPermission).toHaveBeenCalledWith(
      'commons.permissions.initiativeStatus',
      'DRAFT'
    );
  });

  it('passes undefined status to getPermission when initiative is not found', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({} as any)
    );
    vi.mocked(currentInitiativeSelector).mockReturnValue(undefined);
    mockGetPermission.mockReturnValue(false);

    const { result } = renderHook(() => useInitiativeStatusAction('init-123'));

    expect(result.current.isActionPermitted).toBe(false);
    expect(mockGetPermission).toHaveBeenCalledWith(
      'commons.permissions.initiativeStatus',
      undefined
    );
  });
});