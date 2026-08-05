import { useEffect, useState } from 'react';

// Mock
const getPortalConsent = async () => ({versionId: 'mocked-version', firstAcceptance: false})
const savePortalConsent = async (version: string) => version

const useTCAgreement = () => {
  const [acceptedTOS, setAcceptedTOS] = useState<boolean | undefined>(undefined);
  const [acceptedTOSVersion, setAcceptedTOSVersion] = useState<string | undefined>();
  const [firstAcceptance, setFirstAcceptance] = useState<boolean | undefined>(false);
  useEffect(() => {
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
  }, []);

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
