import { useState, useCallback, useEffect, useMemo } from 'react';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getProcessedTransactions, downloadInvoiceFileApi } from '../../services/merchantService';
import { plainObj, } from '../../utils/helpers';
import TransactionsLayout from '../../components/TransactionsLayout/TransactionsLayout';
import ROUTES from '../../routes';
import { authStore } from '../../store/authStore';
import { DecodedJwtToken, FieldConfigDef, FilterConfigDef } from '../../utils/types';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/data-contracts';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { ReceiptLong } from '@mui/icons-material';

const RefundManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initiativeId } = useParams();
  const { t, config } = useScopedTranslation();
  const filtersDef = config<Array<FilterConfigDef>>('pages.refundManagement.transactionsTable.filters')
  const fieldsDef = config<Array<FieldConfigDef>>('pages.refundManagement.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.refundManagement.transactionsTable.columns')
  const [mappedFieldsDef, setMappedFieldsDef] = useState<Array<FieldConfigDef>>(fieldsDef)

  const [transactionsList, setTransactionsList] = useState<Array<PointOfSaleTransactionProcessedDTO | never>>([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [openDrawer, setOpenDrawer] = useState(false);

  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [isDisabledModDocButton, setIsDisabledModDocButton] = useState(false);
  const [areButtonsVisible, setAreButtonsVisible] = useState(false);
  const [errorDownloadAlert, setErrorDownloadAlert] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] = useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] = useState(false);

  useEffect(() => {
    if (!location.state) return;
    const { refundUploadSuccess, reverseUploadSuccess } = location.state;
    if (refundUploadSuccess) {
      setTransactionRefundSuccess(true);
    } else if (reverseUploadSuccess) {
      setTransactionReverseSuccess(true);
    }
  }, [location.state]);

  const handleDownloadInvoice = useCallback(async (transaction: PointOfSaleTransactionProcessedDTO) => {
    const token = authStore.getState().token;
    const decodedToken: DecodedJwtToken = jwtDecode(token);
    setDownloadInProgress(true);
    try {
      const { invoiceUrl } = await downloadInvoiceFileApi(
        initiativeId,
        decodedToken?.point_of_sale_id,
        transaction?.id
      );
      const filename = transaction?.invoiceFile?.filename || 'fattura.pdf';
      const link = document.createElement('a');
      link.href = invoiceUrl;
      link.download = filename;
      link.click();
    } catch {
      setErrorDownloadAlert(true);
    } finally {
      setDownloadInProgress(false);
    }
  }, [initiativeId]);

  const mappedTransactionsList = useMemo(() => {
    return transactionsList.map((trx) => {
      const plainedTrx = plainObj(trx)
      const isDowloadVisible = plainedTrx?.status !== 'CANCELLED'
      const isButtonDisable = plainedTrx?.rewardBatchTrxStatus === 'APPROVED'
      const areButtonsVisible = plainedTrx?.status === 'INVOICED'
      const mappedFieldsDef = fieldsDef.reduce((acc, field) => {
        return [...acc, ...((field.field === "docNumber" || field.field === "filename") && isDowloadVisible ? [{ ...field, headerName: `${field.headerName}.${plainedTrx?.status.toLowerCase()}` }] :
          (field.field === "docNumber" || field.field === "filename") && !isDowloadVisible ? [] : [field])]
      }, [])
      return {
        ...plainedTrx,
        onClick: () => handleDownloadInvoice(trx),
        value: plainedTrx?.filename,
        icon: ReceiptLong,
        action: {
          icon: "arrow",
          onClick: (row) => {
            setIsDisabledModDocButton(isButtonDisable)
            setAreButtonsVisible(areButtonsVisible)
            setMappedFieldsDef(mappedFieldsDef)
            setOpenDrawer(true);
            setSelectedTransaction(row)
          }
        }
      }
    })
  }, [fieldsDef, handleDownloadInvoice, transactionsList])

  const handleReverseTransaction = useCallback(() => {
    const replaceValuesObj = {
      initiativeId: initiativeId,
      trxId: selectedTransaction?.id
    }
    navigate(generatePath(ROUTES.REVERSE, replaceValuesObj), {
      state: { backTo: generatePath(ROUTES.REFUNDS_MANAGEMENT, { initiativeId: initiativeId }) },
    });
  }, [initiativeId, navigate, selectedTransaction?.id]);

  return (
    <TransactionsLayout
      initiativeId={initiativeId}
      title={t('pages.refundManagement.title')}
      subtitle={t('pages.refundManagement.subtitle')}
      tableTitle={t('pages.refundManagement.tableTitle')}
      isAlertVisible={openDrawer}
      transactionsApi={getProcessedTransactions}
      setTransactionsList={setTransactionsList}
      alerts={[
        [transactionReverseSuccess, setTransactionReverseSuccess],
        [transactionRefundSuccess, setTransactionRefundSuccess],
        [errorDownloadAlert, setErrorDownloadAlert],
      ]}
      alertMessages={{
        error: t('pages.refundManagement.feedbackMessages.errors.generic'),
        transactionRefundSuccess: t('pages.refundManagement.feedbackMessages.success.refundUpload'),
        transactionReverseSuccess: t('pages.refundManagement.feedbackMessages.success.reverseUpload'),
        errorDownloadAlert: t('pages.refundManagement.feedbackMessages.errors.downloadPdf'),
      }}
      externalState={{
        transactionRefundSuccess,
        transactionReverseSuccess,
        errorDownloadAlert,
      }}
      tableProps={{
        emptyText: t('pages.refundManagement.noTransactions'),
        columnsDef: columnsDef,
        rows: mappedTransactionsList,
        isEmpty: !mappedTransactionsList?.length
      }}
      drawerProps={{
        setIsOpen: () => setOpenDrawer(false),
        title: t('pages.refundManagement.drawer.title'),
        fieldsValues: { ...selectedTransaction, isLoading: downloadInProgress },
        fieldsDef: mappedFieldsDef,
        isOpen: openDrawer,
        buttons: areButtonsVisible && [
          {
            disabled: isDisabledModDocButton,
            variant: "contained",
            fullWidth: true,
            onClick: () => {
              const replaceValuesObj = {
                initiativeId: initiativeId,
                trxId: selectedTransaction?.id,
                fileDocNumber: btoa(selectedTransaction?.docNumber) || ''
              }
              navigate(generatePath(ROUTES.MODIFY_DOCUMENT, replaceValuesObj))
            },
            title: t('pages.refundManagement.drawer.modifyDocument')
          },
          {
            fullWidth: true,
            onClick: handleReverseTransaction,
            title: t('pages.refundManagement.drawer.refund')
          }
        ]
      }}
      filtersProps={{
        filtersDef,
        filters,
        setFilters: setFilters
      }
      }
    />
  );
};

export default RefundManagement;
