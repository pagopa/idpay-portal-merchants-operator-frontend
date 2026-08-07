import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPermission, getPortalConsent, savePortalConsent } from './RolePermissionService';
import { RolePermissionApiClient } from '../api/RolePermissionClient';

vi.mock('../api/RolePermissionClient', () => ({
  RolePermissionApiClient: {
    userPermission: vi.fn(),
    getPortalConsent: vi.fn(),
    savePortalConsent: vi.fn(),
  },
}));

describe('RolePermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPermission', () => {
    it('should call RolePermissionApiClient.userPermission and return the result', async () => {
      const mockResponse = { permissions: ['READ', 'WRITE'] };
      vi.mocked(RolePermissionApiClient.userPermission).mockResolvedValue(mockResponse);

      const result = await getUserPermission();

      expect(RolePermissionApiClient.userPermission).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPortalConsent', () => {
    it('should call RolePermissionApiClient.getPortalConsent and return the result', async () => {
      const mockResponse = { versionId: '1.0', accepted: true };
      vi.mocked(RolePermissionApiClient.getPortalConsent).mockResolvedValue(mockResponse);

      const result = await getPortalConsent();

      expect(RolePermissionApiClient.getPortalConsent).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('savePortalConsent', () => {
    it('should call RolePermissionApiClient.savePortalConsent with the provided versionId', async () => {
      const versionId = '2.0.0';
      vi.mocked(RolePermissionApiClient.savePortalConsent).mockResolvedValue(undefined);

      await savePortalConsent(versionId);

      expect(RolePermissionApiClient.savePortalConsent).toHaveBeenCalledTimes(1);
      expect(RolePermissionApiClient.savePortalConsent).toHaveBeenCalledWith(versionId);
    });

    it('should call RolePermissionApiClient.savePortalConsent with undefined', async () => {
      vi.mocked(RolePermissionApiClient.savePortalConsent).mockResolvedValue(undefined);

      await savePortalConsent(undefined);

      expect(RolePermissionApiClient.savePortalConsent).toHaveBeenCalledTimes(1);
      expect(RolePermissionApiClient.savePortalConsent).toHaveBeenCalledWith(undefined);
    });
  });
});