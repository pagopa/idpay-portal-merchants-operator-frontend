import { useTranslation } from 'react-i18next';
import { updateInvoiceTransactionApi } from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from '../reverse/reverse.module.css';
import ROUTES from "../../routes.ts";

const ModifyDocument = () => {
    const { t } = useTranslation();

    return (
        <FileUploadAction
            titleKey="pages.modifyDocument.title"
            subtitleKey=""
            i18nBlockKey="pages.modifyDocument"
            apiCall={updateInvoiceTransactionApi}
            successStateKey="refundUploadSuccess"
            breadcrumbsLabelKey={t('routes.refund')}
            breadcrumbsProp={{
                label: t('routes.refundManagement'),
                path: ROUTES.REFUNDS_MANAGEMENT,
            }}
            manualLink={import.meta.env.VITE_MANUAL_LINK}
            styleClass={styles.uploadFileContainer}
            docNumberTitle={t("pages.modifyDocument.invoiceTitle")}
            docNumberInsert={t("pages.modifyDocument.insertInvoice")}
            docNumberLabel={t("pages.modifyDocument.invoiceLabel")}
        />
    );
};

export default ModifyDocument;