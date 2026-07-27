import { useState } from 'react';
import OneTrustContentWrapper from '../../components/OneTrustContentWrapper/OneTrustContentWrapper';
import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
import ROUTES from '../../routes';

const TOS_NOTICE_ID = 'otnotice-cadd2394-571d-42e0-90bd-8b0521ba33f7';

const TOS = () => {
  const [contentLoaded, setContentLoaded] = useState(false);

  useOneTrustNotice(
    import.meta.env.VITE_ONE_TRUST_TOS_JSON_URL,
    contentLoaded,
    setContentLoaded,
    ROUTES.TOS
  );

  return <OneTrustContentWrapper idSelector={TOS_NOTICE_ID} />;
};

export default TOS;
