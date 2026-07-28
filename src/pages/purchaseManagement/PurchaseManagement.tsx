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
import { DecodedJwtToken, FieldConfigDef, FilterConfigDef } from '../../utils/types';
import { GridSortModel } from '@mui/x-data-grid';
import { formatEuro, plainObj } from '../../utils/helpers';
import { utilsStore } from '../../store/utilsStore';
import ModalComponent from '../../components/Modal/ModalComponent';
import TransactionsLayout from '../../components/TransactionsLayout/TransactionsLayout';
import DescriptionIcon from '@mui/icons-material/Description';
import { getPreviewPdf } from '../../services/merchantService';
import { downloadFileFromBase64 } from '../../utils/helpers';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicFilters } from '../../components/DynamicFilters/DynamicFilters';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import { authStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';
import { PointOfSaleTransactionDTO } from '../../api/generated/data-contracts';

const initialPageSize = parseInt(import.meta.env.VITE_PAGINATION_SIZE, 10)

const initialPagination = {
  page: 0,
  pageSize: isNaN(initialPageSize) ? 10 : initialPageSize
}

const PurchaseManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initiativeId } = useParams();
  const { t, config } = useScopedTranslation();
  const filtersDef = config<Array<FilterConfigDef>>('pages.purchaseManagement.transactionsTable.filters')
  const fieldsDef = config<Array<FieldConfigDef>>('pages.purchaseManagement.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.purchaseManagement.transactionsTable.columns')
  const [mappedFieldsDef, setMappedFieldsDef] = useState<Array<FieldConfigDef>>(fieldsDef)

  const [transactionsList, setTransactionsList] = useState<Array<PointOfSaleTransactionDTO | never>>([]);
  const [transactionsListIsLoading, setTransactionsListIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(initialPagination.page)
  const [pageSize, setPageSize] = useState(initialPagination.pageSize)
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [totalElements, setTotalElements] = useState(0)

  const [openDrawer, setOpenDrawer] = useState(false);
  const [isPreviewPdfLoading, setIsPreviewPdfLoading] = useState(false);
  const [modal, setModal] = useState<string>("");

  const [genericError, setGenericError] = useState(false);
  const [errorDeleteTransaction, setErrorDeleteTransaction] = useState(false);
  const [errorCaptureTransaction, setErrorCaptureTransaction] = useState(false);
  const [transactionCaptured, setTransactionCaptured] = useState(false);
  const [errorPreviewPdf, setErrorPreviewPdf] = useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] = useState(false);
  const [transactionDeleteSuccess, setTransactionDeleteSuccess] = useState(false);
  const transactionAuthorized = utilsStore((state) => state.transactionAuthorized);
  const [triggerFetchTransactions, setTriggerFetchTransactions] = useState(false);

  const handlePreviewPdf = useCallback(async () => {
    setIsPreviewPdfLoading(true);
    try {
      const response = await getPreviewPdf(selectedTransaction?.id);
      downloadFileFromBase64(response.data, `${selectedTransaction.trxCode}_preautorizzazione.pdf`);
    } catch {
      setErrorPreviewPdf(true);
    } finally {
      setIsPreviewPdfLoading(false);
    }
  }, [selectedTransaction]);

  const mappedTransactionsList = useMemo(() => {
    return transactionsList.map((trx) => {
      const plainedTrx = plainObj(trx)
      const isDowloadVisible = plainedTrx?.status === 'AUTHORIZED' || plainedTrx?.status === 'CAPTURED'
      const mappedFieldsDef = fieldsDef.reduce((acc, field) => {
        return [...acc, ...(!isDowloadVisible && field.cell.type === "download" ? [] : [field])]
      }, [])
      return {
        ...plainedTrx,
        onClick: handlePreviewPdf,
        isLoading: isPreviewPdfLoading,
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
  }, [fieldsDef, handlePreviewPdf, isPreviewPdfLoading, transactionsList])

  const fetchTransactions = useCallback(async (params) => {
    const token = authStore.getState().token;
    const decodeToken: DecodedJwtToken = jwtDecode(token)
    setTransactionsListIsLoading(true);
    try {
      const { content, totalElements } = await getInProgressTransactions(initiativeId, decodeToken?.point_of_sale_id, params);
      setTransactionsList(content);
      setTotalElements(totalElements)
    } catch {
      setGenericError(true)
    } finally {
      setTransactionsListIsLoading(false)
    }
  }, [initiativeId]);

  useEffect(() => {
    const [model] = sortModel
    const params = {
      size: pageSize,
      page,
      ...filters,
      ...(sortModel.length ? { sort: `${model?.field},${model?.sort}` } : {}),
    }
    fetchTransactions(params);
  }, [fetchTransactions, filters, page, pageSize, sortModel]);

  useEffect(() => {
    if (transactionAuthorized) {
      const timer = setTimeout(() => {
        utilsStore.setState({ transactionAuthorized: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (triggerFetchTransactions) {
      const timer = setTimeout(() => {
        setTriggerFetchTransactions(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [transactionAuthorized, triggerFetchTransactions]);

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
      await deleteTransactionInProgress(selectedTransaction?.id);
      setOpenDrawer(false);
      setTransactionDeleteSuccess(true);
      setTriggerFetchTransactions(true);
    } catch {
      setErrorDeleteTransaction(true);
      setOpenDrawer(true);
    } finally {
      setModal("");
    }
  }, [selectedTransaction?.id]);

  const captureTransaction = useCallback(async () => {
    try {
      await capturePayment({ trxCode: selectedTransaction?.trxCode });
      setOpenDrawer(false);
      setTransactionCaptured(true);
      setTriggerFetchTransactions(true);
    } catch {
      setErrorCaptureTransaction(true);
      setOpenDrawer(true);
    } finally {
      setModal("");
    }
  }, [selectedTransaction?.trxCode]);

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
        title={t('pages.purchaseManagement.title')}
        subtitle={t('pages.purchaseManagement.subtitle')}
        tableTitle={t('pages.purchaseManagement.tableTitle')}
        additionalButton={{
          label: 'Accetta buono sconto',
          icon: <QrCodeIcon />,
          onClick: () => navigate(generatePath(ROUTES.ACCEPT_DISCOUNT, { initiativeId: initiativeId })),
        }}
        isAlertVisible={openDrawer}
        genericErrorState={[genericError, setGenericError]}
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
          error: t('pages.purchaseManagement.errorAlert'),
          transactionAuthorized: t('pages.purchaseManagement.alertSuccess'),
          transactionCaptured: t('pages.purchaseManagement.paymentSuccess'),
          errorDeleteTransaction: t(
            'pages.purchaseManagement.cancelTransactionModal.errorDeleteTransaction'
          ),
          errorCaptureTransaction: t(
            'pages.purchaseManagement.captureTransactionModal.errorCaptureTransaction'
          ),
          errorPreviewPdf: t('pages.purchaseManagement.errorPreviewPdf'),
          transactionRefundSuccess: t('pages.purchaseManagement.refundSuccessUpload'),
          transactionReverseSuccess: t('pages.purchaseManagement.reverseSuccessUpload'),
          transactionDeleteSuccess: t('pages.purchaseManagement.transactionDeleteSuccess'),
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
      >
        <Box>
          <DynamicFilters
            filtersDef={filtersDef}
            filters={filters}
            setFilters={newFilters => {
              setPage(0)
              setFilters(newFilters);
            }}
          />
          <Box marginTop="1rem">
            <DynamicTable
              emptyText={t('pages.purchaseManagement.noTransactions')}
              columnsDef={columnsDef}
              isEmpty={!mappedTransactionsList?.length}
              isLoading={transactionsListIsLoading}
              rows={mappedTransactionsList}
              sortModel={sortModel}
              getRowId={row => row.id}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={model => {
                setPage(model.page)
                setPageSize(model.pageSize)
              }}
              rowCount={totalElements || 0}
              sortingMode='server'
              paginationMode="server"
              onSortModelChange={setSortModel}
              pageSizeOptions={ELEMENT_PER_PAGE}
            />
          </Box>
          <DynamicDrawer
            setIsOpen={() => setOpenDrawer(false)}
            title={t('pages.purchaseManagement.drawer.title')}
            fieldsValues={selectedTransaction}
            fieldsDef={mappedFieldsDef}
            isOpen={openDrawer}
            buttons={[
              {
                variant: "contained",
                fullWidth: true,
                onClick: () => selectedTransaction?.status === 'AUTHORIZED'
                  ? handleModal("capture")
                  : handleRedirect(ROUTES.REFUND),
                title: selectedTransaction?.status === 'AUTHORIZED'
                  ? t('pages.purchaseManagement.drawer.confirmPayment')
                  : t('pages.purchaseManagement.drawer.requestRefund')
              },
              {
                fullWidth: true,
                onClick: () => handleModal(selectedTransaction?.status === 'AUTHORIZED' ? "cancel" : "reverse"),
                color: selectedTransaction?.status === 'AUTHORIZED' ? "error" : "primary",
                title: selectedTransaction?.status === 'AUTHORIZED'
                  ? t('pages.purchaseManagement.drawer.cancellPayment')
                  : t('pages.purchaseManagement.drawer.refund')
              }
            ]}
          />
        </Box>
      </TransactionsLayout>
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
