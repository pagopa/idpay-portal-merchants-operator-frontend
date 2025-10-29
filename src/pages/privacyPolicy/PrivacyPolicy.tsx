
import privacyHTML from './privacyHTML.json';
import { PrivacyAndTosLayout } from '../privacyAndTosLayout/PrivacyAndTosLayout';

// import routes from '../../routes';
// import OneTrustContentWrapper from '../components/OneTrustContentWrapper';

const PrivacyPolicy = () => {
  return <PrivacyAndTosLayout text={privacyHTML} />
};
export default PrivacyPolicy;
