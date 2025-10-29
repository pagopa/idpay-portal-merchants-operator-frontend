import tosHTML from './tosHTML.json';
import { PrivacyAndTosLayout } from '../../components/privacyAndTosLayout/PrivacyAndTosLayout';
import { useTranslation } from 'react-i18next';

const TOS = () => {
  const { t } = useTranslation();
  return <PrivacyAndTosLayout text={tosHTML} title={t('pages.tosStatic.title')} />
};

export default TOS
