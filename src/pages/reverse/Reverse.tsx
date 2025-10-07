import { useTranslation } from 'react-i18next';
import { reverseTransactionApi } from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from './reverse.module.css'; // Importa solo lo stile specifico

const Reverse = () => {
    const { t } = useTranslation();
    
    return (
        <FileUploadAction
            titleKey="pages.reverse.title"
            subtitleKey="pages.reverse.subtitle"
            i18nBlockKey="pages.reverse"
            apiCall={reverseTransactionApi} // 👈 Passa l'API specifica
            successStateKey="reverseUploadSuccess" // 👈 Passa la chiave di stato specifica
            breadcrumbsLabelKey={t('routes.reverse')}
            manualLink={import.meta.env.VITE_MANUAL_LINK}
            styleClass={styles.uploadFileContainer} // 👈 Passa lo stile specifico
        />
    );
};

export default Reverse;