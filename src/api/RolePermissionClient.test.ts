import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiConfig, getAuthToken } from './BaseApiClient';
import { RolePermissionApiClient } from './RolePermissionClient';

const { mockPermissionsInstance, mockConsentInstance } = vi.hoisted(() => ({
  mockPermissionsInstance: {
    setSecurityData: vi.fn(),
    userPermission: vi.fn(),
  },
  mockConsentInstance: {
    setSecurityData: vi.fn(),
    getPortalConsent: vi.fn(),
    savePortalConsent: vi.fn(),
  }
}));

vi.mock('./BaseApiClient', () => ({
  createApiConfig: () => ({baseURL: 'base-url'}),
  getAuthToken: vi.fn()
}));

vi.mock('./generated/Permissions', () => ({
  Permissions: vi.fn(() => mockPermissionsInstance),
}));

vi.mock('./generated/Consent', () => ({
  Consent: vi.fn(() => mockConsentInstance),
}));

describe('RolePermissionApiClient', () => {
  const mockToken = 'mock-auth-token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue(mockToken);
  });

  describe('userPermission', () => {
    it('should apply security and return user permissions data', async () => {
      const mockData = { permissions: ['READ_USER', 'WRITE_USER'] };
      mockPermissionsInstance.userPermission.mockResolvedValue({ data: mockData });

      const result = await RolePermissionApiClient.userPermission();

      expect(getAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPermissionsInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockPermissionsInstance.userPermission).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPortalConsent', () => {
    it('should apply security and return portal consent data', async () => {
      const mockData = { versionId: '1.0.0', accepted: true };
      mockConsentInstance.getPortalConsent.mockResolvedValue({ data: mockData });

      const result = await RolePermissionApiClient.getPortalConsent();

      expect(getAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPermissionsInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.getPortalConsent).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('savePortalConsent', () => {
    it('should apply security and save portal consent with versionId', async () => {
      const versionId = '2.0.0';
      mockConsentInstance.savePortalConsent.mockResolvedValue({ data: undefined });

      await RolePermissionApiClient.savePortalConsent(versionId);

      expect(getAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPermissionsInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.savePortalConsent).toHaveBeenCalledWith({ versionId });
    });

    it('should apply security and save portal consent without versionId', async () => {
      mockConsentInstance.savePortalConsent.mockResolvedValue({ data: undefined });

      await RolePermissionApiClient.savePortalConsent();

      expect(getAuthToken).toHaveBeenCalledTimes(1);
      expect(mockPermissionsInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.setSecurityData).toHaveBeenCalledWith(mockToken);
      expect(mockConsentInstance.savePortalConsent).toHaveBeenCalledWith({ versionId: undefined });
    });
  });
});