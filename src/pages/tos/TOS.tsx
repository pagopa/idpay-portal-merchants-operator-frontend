import tosHTML from './tosHTML.json';
import { PrivacyAndTosLayout } from '../privacyAndTosLayout/PrivacyAndTosLayout';

const TOS = () => {
  return <PrivacyAndTosLayout text={tosHTML} />
};
export default TOS;
