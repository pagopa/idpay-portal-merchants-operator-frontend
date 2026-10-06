import { useState } from 'react';
import OneTrustContentWrapper from '../../components/OneTrustContentWrapper/OneTrustContentWrapper';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
import ROUTES from '../../routes';

const PRIVACY_POLICY_NOTICE_ID = import.meta.env.VITE_ONE_TRUST_PRIVACY_POLICY_NOTICE_ID;

const PrivacyPolicy = () => {
  const [contentLoaded, setContentLoaded] = useState(false);

  useOneTrustNotice(
    import.meta.env.VITE_ONE_TRUST_PRIVACY_POLICY_JSON_URL,
    contentLoaded,
    setContentLoaded,
    ROUTES.PRIVACY_POLICY
  );

  return <OneTrustContentWrapper idSelector={PRIVACY_POLICY_NOTICE_ID} />;
};

export default PrivacyPolicy;
