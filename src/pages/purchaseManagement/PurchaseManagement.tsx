import { Box, Button, Typography } from '@mui/material';
import { useState, useCallback, useEffect, useMemo } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate, useLocation, useParams, generatePath } from 'react-router-dom';
import ROUTES from '../../routes';
import {
  getInProgressTransactions,
  deleteTransactionInProgress,
  capturePayment,
} from '../../services/merchantService';
import { FieldConfigDef, FilterConfigDef } from '../../utils/types';
import { formatEuro, plainObj } from '../../utils/helpers';
import { utilsStore } from '../../store/utilsStore';
import ModalComponent from '../../components/Modal/ModalComponent';
import TransactionsLayout from '../../components/TransactionsLayout/TransactionsLayout';
import DescriptionIcon from '@mui/icons-material/Description';
import { getPreviewPdf } from '../../services/merchantService';
import { downloadFileFromBase64 } from '../../utils/helpers';
import { useScopedTranslation } from '../../hooks/useScopedTranslation'
import { PointOfSaleTransactionDTO } from '../../api/generated/data-contracts';
import { useInitiativeStatusAction } from '../../hooks/useInitiativeStatusAction';

const PurchaseManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initiativeId } = useParams();
  const { isActionPermitted } = useInitiativeStatusAction(initiativeId);
  const { t, config } = useScopedTranslation();
  const filtersDef = config<Array<FilterConfigDef>>('pages.purchaseManagement.transactionsTable.filters')
  const fieldsDef = config<Array<FieldConfigDef>>('pages.purchaseManagement.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.purchaseManagement.transactionsTable.columns')
  const [mappedFieldsDef, setMappedFieldsDef] = useState<Array<FieldConfigDef>>(fieldsDef)

  const [transactionsList, setTransactionsList] = useState<Array<PointOfSaleTransactionDTO | never>>([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [filters, setFilters] = useState<Record<string, string>>({});

  const [openDrawer, setOpenDrawer] = useState(false);
  const [isPreviewPdfLoading, setIsPreviewPdfLoading] = useState(false);
  const [modal, setModal] = useState<string>("");

  const [errorDeleteTransaction, setErrorDeleteTransaction] = useState(false);
  const [errorCaptureTransaction, setErrorCaptureTransaction] = useState(false);
  const [transactionCaptured, setTransactionCaptured] = useState(false);
  const [errorPreviewPdf, setErrorPreviewPdf] = useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] = useState(false);
  const [transactionDeleteSuccess, setTransactionDeleteSuccess] = useState(false);
  const transactionAuthorized = utilsStore((state) => state.transactionAuthorized);
  const [triggerFetchTransactions, setTriggerFetchTransactions] = useState(false);

  const handlePreviewPdf = useCallback(async (transaction: PointOfSaleTransactionDTO) => {
    setIsPreviewPdfLoading(true);
    try {
      const response = await getPreviewPdf(initiativeId, transaction?.id);
      downloadFileFromBase64(response.data, `${transaction.trxCode}_preautorizzazione.pdf`);
    } catch {
      setErrorPreviewPdf(true);
    } finally {
      setIsPreviewPdfLoading(false);
    }
  }, [initiativeId]);

  const mappedTransactionsList = useMemo(() => {
    return transactionsList.map((trx) => {
      const plainedTrx = plainObj(trx)
      const isDowloadVisible = plainedTrx?.status === 'AUTHORIZED' || plainedTrx?.status === 'CAPTURED'
      const mappedFieldsDef = fieldsDef.reduce((acc, field) => {
        return [...acc, ...(!isDowloadVisible && field.cell.type === "download" ? [] : [field])]
      }, [])
      return {
        ...plainedTrx,
        onClick: () => handlePreviewPdf(trx),
        icon: DescriptionIcon,
        value: `${plainedTrx?.trxCode}_preautorizzazione.pdf`,
        action: {
          icon: "arrow",
          onClick: (row) => {
            setMappedFieldsDef(mappedFieldsDef)
            setOpenDrawer(true);
            setSelectedTransaction(row)
          }
        }
      }
    })
  }, [fieldsDef, handlePreviewPdf, transactionsList])


  useEffect(() => {
    if (transactionAuthorized) {
      const timer = setTimeout(() => {
        utilsStore.setState({ transactionAuthorized: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionAuthorized]);

  useEffect(() => {
    if (location.state) {
      const { refundUploadSuccess, reverseUploadSuccess } = location.state;
      if (refundUploadSuccess) {
        setTransactionRefundSuccess(true);
      }
      if (reverseUploadSuccess) {
        setTransactionReverseSuccess(true);
      }
    }
  }, [location.state]);

  const handleModal = useCallback((key: "cancel" | "capture" | "reverse") => {
    setOpenDrawer(false);
    setModal(key)
  }, [])

  const deleteTransaction = useCallback(async () => {
    try {
      await deleteTransactionInProgress(initiativeId, selectedTransaction?.id);
      setOpenDrawer(false);
      setTransactionDeleteSuccess(true);
      setTriggerFetchTransactions(prev => !prev);
    } catch {
      setErrorDeleteTransaction(true);
      setOpenDrawer(true);
    } finally {
      setModal("");
    }
  }, [initiativeId, selectedTransaction?.id]);

  const captureTransaction = useCallback(async () => {
    try {
      await capturePayment(initiativeId, { trxCode: selectedTransaction?.trxCode });
      setOpenDrawer(false);
      setTransactionCaptured(true);
      setTriggerFetchTransactions(prev => !prev);
    } catch {
      setErrorCaptureTransaction(true);
      setOpenDrawer(true);
    } finally {
      setModal("");
    }
  }, [initiativeId, selectedTransaction?.trxCode]);

  const handleRedirect = useCallback((path: string) => {
    const replaceValuesObj = {
      initiativeId: initiativeId,
      trxId: selectedTransaction?.id
    }
    navigate(generatePath(path, replaceValuesObj))
  }, [initiativeId, navigate, selectedTransaction?.id]);

  return (
    <>
      <TransactionsLayout
        initiativeId={initiativeId}
        title={t('pages.purchaseManagement.title')}
        subtitle={t('pages.purchaseManagement.subtitle')}
        tableTitle={t('pages.purchaseManagement.tableTitle')}
        additionalButton={{
          variant: 'contained',
          size: 'small',
          disabled: !isActionPermitted,
          title: 'Accetta buono sconto',
          sx: { textWrap: 'nowrap' },
          startIcon: <QrCodeIcon />,
          onClick: () => isActionPermitted && navigate(generatePath(ROUTES.ACCEPT_DISCOUNT, { initiativeId: initiativeId })),
        }}
        isAlertVisible={openDrawer}
        transactionsApi={getInProgressTransactions}
        setTransactionsList={setTransactionsList}
        triggerFetchTransactions={triggerFetchTransactions}
        alerts={[
          [errorDeleteTransaction, setErrorDeleteTransaction],
          [errorCaptureTransaction, setErrorCaptureTransaction],
          [transactionCaptured, setTransactionCaptured],
          [transactionAuthorized, () => utilsStore.setState({ transactionAuthorized: false })],
          [errorPreviewPdf, setErrorPreviewPdf],
          [transactionRefundSuccess, setTransactionRefundSuccess],
          [transactionReverseSuccess, setTransactionReverseSuccess],
          [transactionDeleteSuccess, setTransactionDeleteSuccess],
        ]}
        alertMessages={{
          error: t('pages.purchaseManagement.feedbackMessages.errors.generic'),
          transactionAuthorized: t('pages.purchaseManagement.feedbackMessages.success.transaction'),
          transactionCaptured: t('pages.purchaseManagement.feedbackMessages.success.payment'),
          errorDeleteTransaction: t('pages.purchaseManagement.feedbackMessages.errors.cancel'),
          errorCaptureTransaction: t('pages.purchaseManagement.feedbackMessages.errors.capture'),
          errorPreviewPdf: t('pages.purchaseManagement.feedbackMessages.errors.previewPdf'),
          transactionRefundSuccess: t('pages.purchaseManagement.feedbackMessages.success.refundUpload'),
          transactionReverseSuccess: t('pages.purchaseManagement.feedbackMessages.success.reverseUpload'),
          transactionDeleteSuccess: t('pages.purchaseManagement.feedbackMessages.success.transactionDelete'),
        }}
        externalState={{
          transactionAuthorized,
          transactionCaptured,
          errorDeleteTransaction,
          errorCaptureTransaction,
          errorPreviewPdf,
          transactionRefundSuccess,
          transactionReverseSuccess,
          transactionDeleteSuccess,
        }}
        tableProps={{
          emptyText: t('pages.purchaseManagement.noTransactions'),
          columnsDef: columnsDef,
          rows: mappedTransactionsList,
          isEmpty: !mappedTransactionsList?.length
        }}
        drawerProps={{
          setIsOpen: () => setOpenDrawer(false),
          title: t('pages.purchaseManagement.drawer.title'),
          fieldsValues: { ...selectedTransaction, isLoading: isPreviewPdfLoading },
          fieldsDef: mappedFieldsDef,
          isOpen: openDrawer,
          buttons: [
            {
              variant: "contained",
              fullWidth: true,
              disabled: !isActionPermitted,
              onClick: () => isActionPermitted && (selectedTransaction?.status === 'AUTHORIZED'
                ? handleModal("capture")
                : handleRedirect(ROUTES.REFUND)),
              title: selectedTransaction?.status === 'AUTHORIZED'
                ? t('pages.purchaseManagement.drawer.confirmPayment')
                : t('pages.purchaseManagement.drawer.requestRefund')
            },
            {
              fullWidth: true,
              disabled: !isActionPermitted,
              onClick: () => isActionPermitted && handleModal(selectedTransaction?.status === 'AUTHORIZED' ? "cancel" : "reverse"),
              color: selectedTransaction?.status === 'AUTHORIZED' ? "error" : "primary",
              title: selectedTransaction?.status === 'AUTHORIZED'
                ? t('pages.purchaseManagement.drawer.cancellPayment')
                : t('pages.purchaseManagement.drawer.refund')
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
      <ModalComponent
        open={!!modal}
        onClose={() => {
          setModal("")
        }}
      >
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          <Typography variant="h6">
            {t(`pages.purchaseManagement.modal.${modal}.title`)}
          </Typography>
          <Typography variant="body1">
            {t(`pages.purchaseManagement.modal.${modal}.description`,
              {
                amount: formatEuro(selectedTransaction?.residualAmountCents),
                product: selectedTransaction?.productName
              }
            )}
            {modal === "capture" && <Typography display="inline" variant="body1" fontWeight="bold">"{t(`pages.purchaseManagement.modal.${modal}.detail`)}"</Typography>}.
          </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => {
              setModal("")
              setOpenDrawer(true);
            }}
          >
            {t(`pages.purchaseManagement.modal.${modal}.exitBtn`)}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const actions = {
                cancel: deleteTransaction,
                capture: captureTransaction,
                reverse: () => handleRedirect(ROUTES.REVERSE),
              }
              actions[modal]()
            }}
          >
            {t(`pages.purchaseManagement.modal.${modal}.confirmBtn`)}
          </Button>
        </Box>
      </ModalComponent>
    </>
  );
};

export default PurchaseManagement;
