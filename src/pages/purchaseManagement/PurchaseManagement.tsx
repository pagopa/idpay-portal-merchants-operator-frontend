import { Box, Button, Typography } from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate, useLocation, useParams, generatePath } from 'react-router-dom';
import ROUTES from '../../routes';
import {
  getInProgressTransactions,
  deleteTransactionInProgress,
  capturePayment,
} from '../../services/merchantService';
import { FieldConfigDef, transactionInProgreessDTO } from '../../utils/types';
import { GridRenderCellParams } from '@mui/x-data-grid';
import {
  formatEuro,
  checkEuroTooltip,
  checkTooltipValue,
  checkDateTooltip,
} from '../../utils/helpers';
import { utilsStore } from '../../store/utilsStore';
import ModalComponent from '../../components/Modal/ModalComponent';
import TransactionsLayout from '../../components/TransactionsLayout/TransactionsLayout';
import DescriptionIcon from '@mui/icons-material/Description';
import { getPreviewPdf } from '../../services/merchantService';
import { downloadFileFromBase64 } from '../../utils/helpers';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { StatusChip } from '../../components/StatusChip/StatusChip';

const PurchaseManagement = () => {
  const { initiativeId } = useParams();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [errorDeleteTransaction, setErrorDeleteTransaction] = useState(false);
  const [errorCaptureTransaction, setErrorCaptureTransaction] = useState(false);
  const [transactionCaptured, setTransactionCaptured] = useState(false);
  const { t, config } = useScopedTranslation();
  const fieldsDef = config<Array<FieldConfigDef>>('pages.purchaseManagement.drawer')
  const [mappedFieldsDef, setMappedFieldsDef] = useState<Array<FieldConfigDef>>(fieldsDef)
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelTransactionModal, setCancelTransactionModal] = useState(false);
  const [captureTransactionModal, setCaptureTransactionModal] = useState(false);
  const [refundTransactionModal, setRefundTransactionModal] = useState(false);
  const [errorPreviewPdf, setErrorPreviewPdf] = useState(false);
  const [isPreviewPdfLoading, setIsPreviewPdfLoading] = useState(false);
  const transactionAuthorized = utilsStore((state) => state.transactionAuthorized);
  const [triggerFetchTransactions, setTriggerFetchTransactions] = useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] = useState(false);
  const [transactionDeleteSuccess, setTransactionDeleteSuccess] = useState(false);

  const replaceValuesObj = {
    initiativeId: initiativeId,
    trxId: selectedTransaction?.id
  }

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

  const columns = [
    {
      field: 'additionalProperties',
      headerName: t('pages.purchaseManagement.table.headers.additionalProperties'),
      flex: 2.5,
      disableColumnMenu: true,
      align: 'center',
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        return checkTooltipValue(params, 'productName');
      },
    },
    {
      field: 'trxChargeDate',
      headerName: t('pages.purchaseManagement.table.headers.trxChargeDate'),
      flex: 1.5,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => checkDateTooltip(params),
    },
    {
      field: 'fiscalCode',
      headerName: t('pages.purchaseManagement.table.headers.fiscalCode'),
      flex: 1.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return checkTooltipValue(params);
      },
    },
    {
      field: 'effectiveAmountCents',
      headerName: t('pages.purchaseManagement.table.headers.effectiveAmountCents'),
      flex: 1.2,
      type: 'number',
      headerAlign: 'left',
      align: 'center',
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
    },
    {
      field: 'rewardAmountCents',
      headerName: t('pages.purchaseManagement.table.headers.rewardAmountCents'),
      flex: 1.2,
      type: 'number',
      headerAlign: 'left',
      align: 'center',
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
    },
    {
      field: 'residualAmountCents',
      headerName: t('pages.purchaseManagement.table.headers.residualAmountCents'),
      flex: 1.2,
      type: 'number',
      headerAlign: 'left',
      align: 'center',
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
    },
    {
      field: 'status',
      headerName: t('pages.purchaseManagement.table.headers.status'),
      flex: 1.5,
      disableColumnMenu: true,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <StatusChip context='commons.statusEnum.transaction' value={params.value.toLowerCase()}/>
          </Box>
        );
      },
    },
  ];

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

  const handleRowAction = useCallback((row: transactionInProgreessDTO) => {
    const isDowloadVisible = row?.status === 'AUTHORIZED' || row?.status === 'CAPTURED'
    const mappedFieldsDef = fieldsDef.reduce((acc, field) => {
      return [ ...acc, ...(!isDowloadVisible && field.cell.type === "download" ? [] : [field])]
    }, [])
    const mappedTransaction = { ...row,
      onClick: handlePreviewPdf,
      isLoading: isPreviewPdfLoading,
      icon: <DescriptionIcon/>,
      value: `${row?.trxCode}_preautorizzazione.pdf`
    }
    setMappedFieldsDef(mappedFieldsDef)
    setOpenDrawer(true);
    setSelectedTransaction(mappedTransaction);
  }, [fieldsDef, handlePreviewPdf, isPreviewPdfLoading]);

  const handleCaptureTransaction = () => {
    setOpenDrawer(false);
    setCaptureTransactionModal(true);
  };

  const handleCancelTransaction = () => {
    setOpenDrawer(false);
    setCancelTransactionModal(true);
  };

  const deleteTransaction = async () => {
    try {
      await deleteTransactionInProgress(selectedTransaction?.id);
      setOpenDrawer(false);
      setCancelTransactionModal(false);
      setTransactionDeleteSuccess(true);
      setTriggerFetchTransactions(true);
    } catch {
      setCancelTransactionModal(false);
      setErrorDeleteTransaction(true);
      setOpenDrawer(true);
    }
  };

  const captureTransaction = async () => {
    try {
      await capturePayment({ trxCode: selectedTransaction?.trxCode });
      setOpenDrawer(false);
      setCaptureTransactionModal(false);
      setTransactionCaptured(true);
      setTriggerFetchTransactions(true);
    } catch {
      setCaptureTransactionModal(false);
      setErrorCaptureTransaction(true);
      setOpenDrawer(true);
    }
  };

  const handleReverseTransaction = async () => {
    navigate(generatePath(ROUTES.REVERSE, replaceValuesObj));
  };

  const handleRequestRefund = async () => {
    navigate(generatePath(ROUTES.REFUND, replaceValuesObj));
  };

  return (
    <>
      <TransactionsLayout
        title={t('pages.purchaseManagement.title')}
        subtitle={t('pages.purchaseManagement.subtitle')}
        tableTitle={t('pages.purchaseManagement.tableTitle')}
        fetchTransactionsApi={getInProgressTransactions}
        columns={columns}
        statusOptions={['AUTHORIZED', 'CAPTURED']}
        additionalButton={{
          label: 'Accetta buono sconto',
          icon: <QrCodeIcon />,
          onClick: () => navigate(generatePath(ROUTES.ACCEPT_DISCOUNT, {initiativeId: initiativeId})),
        }}
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
        noDataMessage={t('pages.purchaseManagement.noTransactions')}
        triggerFetchTransactions={triggerFetchTransactions}
        onRowAction={handleRowAction}
        drawerProps={{
          title: t('pages.purchaseManagement.drawer.title'),
          fieldsValues: selectedTransaction,
          fieldsDef: mappedFieldsDef,
          isOpen: openDrawer,
          setIsOpen: () => setOpenDrawer(false),
          buttons: [
          {
            variant: "contained",
            fullWidth: true,
            onClick: selectedTransaction?.status === 'AUTHORIZED'
              ? handleCaptureTransaction
              : handleRequestRefund,
            title: selectedTransaction?.status === 'AUTHORIZED'
              ? t('pages.purchaseManagement.drawer.confirmPayment')
              : t('pages.purchaseManagement.drawer.requestRefund')
          },
          {
            fullWidth: true,
            onClick: selectedTransaction?.status === 'AUTHORIZED'
              ? handleCancelTransaction
              : () => {
                setRefundTransactionModal(true);
                setOpenDrawer(false);
              },
            color: selectedTransaction?.status === 'AUTHORIZED' ? "error" : "primary",
            title: selectedTransaction?.status === 'AUTHORIZED'
              ? t('pages.purchaseManagement.drawer.cancellPayment')
              : t('pages.purchaseManagement.drawer.refund')
          }
        ]
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
        isDrawerOpen={openDrawer}
      />

      <ModalComponent
        open={cancelTransactionModal || captureTransactionModal}
        onClose={() => {
          setCancelTransactionModal(false);
          setCaptureTransactionModal(false);
        }}
      >
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          <Typography variant="h6">
            {captureTransactionModal
              ? t('pages.purchaseManagement.captureTransactionModal.title')
              : t('pages.purchaseManagement.cancelTransactionModal.title')}
          </Typography>
          <Typography variant="body1">
            {captureTransactionModal
              ? `${t('pages.purchaseManagement.captureTransactionModal.description1')} ${formatEuro(
                selectedTransaction?.residualAmountCents
              )}
                                ${t(
                'pages.purchaseManagement.captureTransactionModal.description2'
              )}${selectedTransaction?.additionalProperties?.productName}
                                ${t(
                'pages.purchaseManagement.captureTransactionModal.description3'
              )}`
              : `${t('pages.purchaseManagement.cancelTransactionModal.description')}`}
            {captureTransactionModal && (
              <Typography display="inline" fontWeight="bold">
                "Fattura da caricare"
              </Typography>
            )}
            .
          </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => {
              setCaptureTransactionModal(false);
              setCancelTransactionModal(false);
              setOpenDrawer(true);
            }}
          >
            {captureTransactionModal ? 'Indietro' : 'Esci'}
          </Button>
          <Button
            variant="contained"
            onClick={captureTransactionModal ? captureTransaction : deleteTransaction}
          >
            Conferma
          </Button>
        </Box>
      </ModalComponent>

      <ModalComponent
        open={refundTransactionModal}
        onClose={() => setRefundTransactionModal(false)}
      >
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          <Typography variant="h6">
            {t('pages.purchaseManagement.refundTransactionModal.title')}
          </Typography>
          <Typography variant="body1">
            {t('pages.purchaseManagement.refundTransactionModal.description')}
          </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => {
              setRefundTransactionModal(false);
              setOpenDrawer(true);
            }}
          >
            Indietro
          </Button>
          <Button variant="contained" onClick={handleReverseTransaction}>
            {t('pages.purchaseManagement.drawer.refund')}
          </Button>
        </Box>
      </ModalComponent>
    </>
  );
};

export default PurchaseManagement;
