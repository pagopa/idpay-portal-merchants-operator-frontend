import { useTranslation } from 'react-i18next';
import { invoiceTransactionApi } from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from '../reverse/reverse.module.css';
import ROUTES from '../../routes.ts';

const Refund = () => {
  const { t } = useTranslation();

  return (
    <FileUploadAction
      titleKey="pages.refund.title"
      subtitleKey=""
      i18nBlockKey="pages.refund"
      apiCall={invoiceTransactionApi}
      successStateKey="refundUploadSuccess"
      breadcrumbsLabelKey={t('routes.refund')}
      breadcrumbsProp={{
        label: t('routes.buyManagement'),
        path: ROUTES.BUY_MANAGEMENT,
      }}
      manualLink={import.meta.env.VITE_MANUAL_LINK}
      styleClass={styles.uploadFileContainer}
      docNumberTitle={t('pages.refund.invoiceTitle')}
      docNumberInsert={t('pages.refund.insertInvoice')}
      docNumberLabel={t('pages.refund.invoiceLabel')}
    />
  );
};

export default Refund;
