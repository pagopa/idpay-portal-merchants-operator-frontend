
import privacyHTML from './privacyHTML.json';
import { PrivacyAndTosLayout } from '../../components/privacyAndTosLayout/PrivacyAndTosLayout';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return <PrivacyAndTosLayout text={privacyHTML} title={t('pages.privacyPolicyStatic.title')} />
};

export default PrivacyPolicy
