import { useTranslation } from 'react-i18next';
import { rewardTransactionApi } from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from './style.module.css';   

const Refund = () => {
    const { t } = useTranslation();

    return (
        <FileUploadAction
            titleKey="pages.refund.title"
            subtitleKey="pages.refund.subtitle"
            i18nBlockKey="pages.refund"
            apiCall={rewardTransactionApi} 
            successStateKey="refundUploadSuccess" 
            breadcrumbsLabelKey={t('routes.refund')}
            manualLink="#" 
            styleClass={styles.uploadFileContainer} 
        />
    );
};

export default Refund;