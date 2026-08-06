import { getAuthToken } from "./BaseApiClient";
import { Consent } from "./generated/Consent";
import { Permissions } from "./generated/Permissions";

const permissionsClient = new Permissions();
const consentClient = new Consent();

const applySecurity = () => {
    const token = getAuthToken();
    permissionsClient.setSecurityData(token);
    consentClient.setSecurityData(token);
};

export const RolePermissionApiClient = {
    userPermission: async () => {
        applySecurity();
        const response = await permissionsClient.userPermission();
        return response.data;
    },
    
    getPortalConsent: async () => {
        applySecurity();
        const response = await consentClient.getPortalConsent();
        return response.data;
    },

    savePortalConsent: async (versionId?: string): Promise<void> => {
        applySecurity();
        const response = await consentClient.savePortalConsent({ versionId });
        return response.data;
    }
}
