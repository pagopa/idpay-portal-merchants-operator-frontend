import { useTranslation } from 'react-i18next';
import { reverseTransactionApi } from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from './reverse.module.css'; 

const Reverse = () => {
    const { t } = useTranslation();
    
    return (
        <FileUploadAction
            titleKey="pages.reverse.title"
            subtitleKey="pages.reverse.subtitle"
            i18nBlockKey="pages.reverse"
            apiCall={reverseTransactionApi} 
            successStateKey="reverseUploadSuccess" 
            breadcrumbsLabelKey={t('routes.reverse')}
            manualLink={import.meta.env.VITE_MANUAL_LINK}
            styleClass={styles.uploadFileContainer} 
        />
    );
};

export default Reverse;