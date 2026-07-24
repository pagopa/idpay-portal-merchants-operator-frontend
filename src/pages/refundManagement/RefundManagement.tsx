import { Box } from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getProcessedTransactions, downloadInvoiceFileApi } from '../../services/merchantService';
import { checkEuroTooltip, checkTooltipValue, formatDate, } from '../../utils/helpers';
import TransactionsLayout from '../../components/TransactionsLayout/TransactionsLayout';
import ROUTES from '../../routes';
import { authStore } from '../../store/authStore';
import { DecodedJwtToken, FieldConfigDef } from '../../utils/types';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/data-contracts';
import { StatusChip } from '../../components/StatusChip/StatusChip';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { ReceiptLong } from '@mui/icons-material';

const RefundManagement = () => {
  const { initiativeId } = useParams();
  const { t, config } = useScopedTranslation();
  const fieldsDef = config<Array<FieldConfigDef>>('pages.refundManagement.drawer')
  const [mappedFieldsDef, setMappedFieldsDef] = useState<Array<FieldConfigDef>>(fieldsDef)
  const navigate = useNavigate();
  const location = useLocation();
  const token = authStore.getState().token;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PointOfSaleTransactionProcessedDTO>({});
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [isDisabledModDocButton, setIsDisabledModDocButton] = useState(false);

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
  }, [token]);

  const handleRowAction = useCallback((row: PointOfSaleTransactionProcessedDTO) => {
    const isButtonDisable = row?.rewardBatchTrxStatus === 'APPROVED'
    const isDowloadVisible = row?.status !== 'CANCELLED'
    const mappedFieldsDef = fieldsDef.reduce((acc, field) => {
      return [...acc, ...((field.field === "invoiceFile.docNumber" || field.field === "invoiceFile.filename") && isDowloadVisible ? [{ ...field, headerName: `${field.headerName}.${row?.status.toLowerCase()}` }] :
        (field.field === "invoiceFile.docNumber" || field.field === "invoiceFile.filename") && !isDowloadVisible ? [] : [field])]
    }, [])
    const mappedTransaction = {
      ...row,
      onClick: () => {
        handleDownloadInvoice(row)
      },
      isLoading: downloadInProgress,
      icon: <ReceiptLong />
    }
    setMappedFieldsDef(mappedFieldsDef)
    setSelectedTransaction(mappedTransaction)
    setIsDisabledModDocButton(isButtonDisable)
    setIsDrawerOpen(true);
  }, [downloadInProgress, fieldsDef, handleDownloadInvoice]);

  const handleReverseTransaction = useCallback(() => {
    const replaceValuesObj = {
      initiativeId: initiativeId,
      trxId: selectedTransaction?.id
    }
    navigate(generatePath(ROUTES.REVERSE, replaceValuesObj), {
      state: { backTo: generatePath(ROUTES.REFUNDS_MANAGEMENT, { initiativeId: initiativeId }) },
    });
  }, [initiativeId, navigate, selectedTransaction?.id]);

  const columns = [
    {
      field: 'additionalProperties',
      headerName: 'Elettrodomestico',
      flex: 2.5,
      disableColumnMenu: true,
      align: 'center',
      sortable: true,
      renderCell: (params: GridRenderCellParams) => checkTooltipValue(params, 'productName'),
    },
    {
      field: 'trxChargeDate',
      headerName: 'Data e ora',
      flex: 1.5,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => formatDate(params.value),
    },
    {
      field: 'fiscalCode',
      headerName: 'Beneficiario',
      flex: 1.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => checkTooltipValue(params),
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'left',
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Sconto applicato',
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'left',
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: 'authorizedAmountCents',
      headerName: 'Importo autorizzato',
      flex: 1.4,
      type: 'number',
      align: 'center',
      headerAlign: 'left',
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1.5,
      disableColumnMenu: true,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <StatusChip context='commons.statusEnum.transaction' value={params.value.toLowerCase()} />
        </Box>
      ),
    },
  ];

  return (
    <TransactionsLayout
      title={t('pages.refundManagement.title')}
      subtitle={t('pages.refundManagement.subtitle')}
      tableTitle={t('pages.refundManagement.tableTitle')}
      fetchTransactionsApi={getProcessedTransactions}
      columns={columns}
      statusOptions={['REWARDED', 'CANCELLED', 'REFUNDED', 'INVOICED']}
      noDataMessage={t('pages.refundManagement.noTransactions')}
      onRowAction={handleRowAction}
      alerts={[
        [transactionReverseSuccess, setTransactionReverseSuccess],
        [transactionRefundSuccess, setTransactionRefundSuccess],
        [errorDownloadAlert, setErrorDownloadAlert],
      ]}
      alertMessages={{
        error: t('pages.refundManagement.errorAlert'),
        transactionRefundSuccess: t('pages.refundManagement.refundSuccessUpload'),
        transactionReverseSuccess: t('pages.refundManagement.reverseSuccessUpload'),
        errorDownloadAlert: t('pages.refundManagement.errorDownloadAlert'),
      }}
      drawerProps={{
        title: t('pages.refundManagement.drawer.title'),
        fieldsValues: selectedTransaction,
        fieldsDef: mappedFieldsDef,
        isOpen: isDrawerOpen,
        setIsOpen: () => setIsDrawerOpen(false),
        ...(selectedTransaction.status === "INVOICED" ?
          {
            buttons: [
              {
                disabled: isDisabledModDocButton,
                variant: "contained",
                fullWidth: true,
                onClick: () => {
                  const replaceValuesObj = {
                    initiativeId: initiativeId,
                    trxId: selectedTransaction?.id,
                    fileDocNumber: btoa(selectedTransaction['Numero fattura']) || ''
                  }
                  navigate(generatePath(ROUTES.MODIFY_DOCUMENT, replaceValuesObj))
                },
                title: 'Modifica documento'
              },
              {
                fullWidth: true,
                onClick: handleReverseTransaction,
                title: t('pages.refundManagement.drawer.refund')
              }
            ]
          } : {}
        )
      }
      }
      externalState={{
        transactionRefundSuccess,
        transactionReverseSuccess,
        errorDownloadAlert,
      }}
      isDrawerOpen={isDrawerOpen}
    />
  );
};

export default RefundManagement;
