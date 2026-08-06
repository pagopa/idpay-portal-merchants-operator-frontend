import { RolePermissionApiClient } from "../api/RolePermissionClient";

export const getUserPermission = () => RolePermissionApiClient.userPermission();

export const getPortalConsent = () => RolePermissionApiClient.getPortalConsent();

export const savePortalConsent = (versionId: string | undefined): Promise<void> =>
    RolePermissionApiClient.savePortalConsent(versionId);
