import { Box } from '@mui/material';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
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
import { DynamicFilters } from '../../components/DynamicFilters/DynamicFilters';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';

const initialPageSize = parseInt(import.meta.env.VITE_PAGINATION_SIZE, 10)

const initialPagination = {
  page: 0,
  pageSize: isNaN(initialPageSize) ? 10 : initialPageSize
}

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
  const [transactionsListIsLoading, setTransactionsListIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(initialPagination.page)
  const [pageSize, setPageSize] = useState(initialPagination.pageSize)
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [totalElements, setTotalElements] = useState(0)

  const [openDrawer, setOpenDrawer] = useState(false);

  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [isDisabledModDocButton, setIsDisabledModDocButton] = useState(false);
  const [areButtonsVisible, setAreButtonsVisible] = useState(false);
  const [genericError, setGenericError] = useState(false);
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
  }, []);

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
        isLoading: downloadInProgress,
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
  }, [downloadInProgress, fieldsDef, handleDownloadInvoice, transactionsList])

  const fetchTransactions = useCallback(async (params) => {
    setTransactionsListIsLoading(true);
    const token = authStore.getState().token;
    const decodeToken: DecodedJwtToken = jwtDecode(token);
    try {
      const { content, totalElements } = await getProcessedTransactions(initiativeId, decodeToken?.point_of_sale_id, params);
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
      title={t('pages.refundManagement.title')}
      subtitle={t('pages.refundManagement.subtitle')}
      tableTitle={t('pages.refundManagement.tableTitle')}
      genericErrorState={[genericError, setGenericError]}
      isAlertVisible={openDrawer}
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
          fieldsValues={{ ...selectedTransaction, isLoading: downloadInProgress }}
          fieldsDef={mappedFieldsDef}
          isOpen={openDrawer}
          buttons={areButtonsVisible && [
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
          }
        />
      </Box>
    </TransactionsLayout>
  );
};

export default RefundManagement;
