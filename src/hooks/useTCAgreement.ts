import { useEffect, useState } from 'react';
import { getPortalConsent, savePortalConsent } from '../services/rolePermissionService';
import { useAuth } from '../contexts/AuthContext';

const useTCAgreement = () => {
  const { isAuthenticated, token } = useAuth();
  const [acceptedTOS, setAcceptedTOS] = useState<boolean | undefined>(undefined);
  const [acceptedTOSVersion, setAcceptedTOSVersion] = useState<string | undefined>();
  const [firstAcceptance, setFirstAcceptance] = useState<boolean | undefined>(false);
  useEffect(() => {
    if(isAuthenticated || token) {
    getPortalConsent()
      .then((res) => {
        if (Object.keys(res).length) {
          setAcceptedTOSVersion(res.versionId);
          setFirstAcceptance(res.firstAcceptance);
          setAcceptedTOS(false);
        } else {
          setAcceptedTOS(true);
        }
      })
      .catch(() => {
        setAcceptedTOS(false);
      });
    }
  }, [isAuthenticated, token]);

  const acceptTOS = () => {
    savePortalConsent(acceptedTOSVersion)
      .then(() => {
        setAcceptedTOS(true);
      })
      .catch(() => {
        setAcceptedTOS(false);
      });
  };

  return { isTOSAccepted: acceptedTOS, acceptTOS, firstAcceptance };
};

export default useTCAgreement;
