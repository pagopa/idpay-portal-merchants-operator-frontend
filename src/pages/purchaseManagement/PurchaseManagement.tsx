import { Box, Button, Tooltip, Drawer, Typography, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate } from "react-router-dom";
import ROUTES from "../../routes";
import { getInProgressTransactions, deleteTransactionInProgress, capturePayment } from "../../services/merchantService";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import { transactionInProgreessDTO } from "../../utils/types";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { theme } from '@pagopa/mui-italia';
import CloseIcon from '@mui/icons-material/Close';
import style from './purchaseManagement.module.css';
import { getStatusChip, formatEuro } from "../../utils/helpers";
import { utilsStore } from "../../store/utilsStore";
import ModalComponent from "../../components/Modal/ModalComponent";
import TransactionsLayout from "../../components/TransactionsLayout/TransactionsLayout";

const PurchaseManagement = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [errorDeleteTransaction, setErrorDeleteTransaction] = useState(false);
    const [errorCaptureTransaction, setErrorCaptureTransaction] = useState(false);
    const [transactionCaptured, setTransactionCaptured] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cancelTransactionModal, setCancelTransactionModal] = useState(false);
    const [captureTransactionModal, setCaptureTransactionModal] = useState(false);
    const [refundTransactionModal, setRefundTransactionModal] = useState(false);
    const transactionAuthorized = utilsStore((state) => state.transactionAuthorized);

    useEffect(() => {
        if (transactionAuthorized) {
            const timer = setTimeout(() => {
                utilsStore.setState({ transactionAuthorized: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [transactionAuthorized]);

    const columns = [
        {
            field: "additionalProperties",
            headerName: 'Elettrodomestico',
            flex: 2.5,
            disableColumnMenu: true,
            align: 'center',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
                if (params?.value?.productName) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Tooltip title={params.value?.productName}>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {params.value?.productName}
                                </Typography>
                            </Tooltip>
                        </div>
                    );
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
        {
            field: 'updateDate',
            headerName: 'Data e ora',
            flex: 1,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value) {
                    const formattedDate = new Date(params.value).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }).replace(',', '');
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Tooltip title={formattedDate}>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {formattedDate}
                                </Typography>
                            </Tooltip>
                        </div>
                    );
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
        {
            field: 'fiscalCode',
            headerName: 'Beneficiario',
            flex: 1.5,
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Tooltip title={params.value}>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {params.value}
                                </Typography>
                            </Tooltip>
                        </div>
                    );
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
        {
            field: 'effectiveAmountCents',
            headerName: 'Totale della spesa',
            flex: 1.2,
            type: 'number',
            headerAlign: 'left',
            align: 'center',
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value || params.value === 0) {
                    return formatEuro(params.value);
                }
                return MISSING_DATA_PLACEHOLDER;
            }
        },
        {
            field: 'rewardAmountCents',
            headerName: 'Sconto applicato',
            flex: 1.2,
            type: 'number',
            headerAlign: 'left',
            align: 'center',
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value || params.value === 0) {
                    return formatEuro(params.value);
                }
                return MISSING_DATA_PLACEHOLDER;
            }
        },
        {
            field: 'residualAmountCents',
            headerName: 'Importo autorizzato',
            flex: 1.2,
            type: 'number',
            headerAlign: 'left',
            align: 'center',
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value || params.value === 0) {
                    return formatEuro(params.value);
                }
                return MISSING_DATA_PLACEHOLDER;
            }
        },
        {
            field: 'status',
            headerName: 'Stato',
            flex: 1.5,
            disableColumnMenu: true,
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        {getStatusChip(t, params.value)}
                    </Box>
                );
            }
        },
    ];

    const handleRowAction = useCallback((row: transactionInProgreessDTO) => {
        setOpenDrawer(true);
        setSelectedTransaction(row);
    }, []);

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
            navigate(ROUTES.REFUNDS_MANAGEMENT);
        } catch (error) {
            console.error('Error deleting transaction:', error);
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
            navigate(ROUTES.BUY_MANAGEMENT);
            setTransactionCaptured(true);
        } catch (error) {
            console.error('Error capture transaction:', error);
            setCaptureTransactionModal(false);
            setErrorCaptureTransaction(true);
            setOpenDrawer(true);
        }
    };

    const handleReverseTransaction = async () => {
        navigate('/storna-transazione/' + selectedTransaction?.id);
    };

    const handleRequestRefund = async () => {
        navigate("/richiedi-rimborso/" + selectedTransaction?.id);
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
                    onClick: () => navigate(ROUTES.ACCEPT_DISCOUNT)
                }}
                alerts={[
                    [errorDeleteTransaction, setErrorDeleteTransaction],
                    [errorCaptureTransaction, setErrorCaptureTransaction],
                    [transactionCaptured, setTransactionCaptured],
                    [transactionAuthorized, () => utilsStore.setState({ transactionAuthorized: false })]
                ]}
                alertMessages={{
                    error: t('pages.refundManagement.errorAlert'),
                    transactionAuthorized: t('pages.purchaseManagement.alertSuccess'),
                    transactionCaptured: t('pages.purchaseManagement.paymentSuccess'),
                    errorDeleteTransaction: t('pages.purchaseManagement.cancelTransactionModal.errorDeleteTransaction'),
                    errorCaptureTransaction: t('pages.purchaseManagement.captureTransactionModal.errorDeleteTransaction')
                }}
                noDataMessage={t('pages.refundManagement.noTransactions')}
                onRowAction={handleRowAction}
                DrawerComponent={
                    <Drawer
                        anchor="right"
                        open={openDrawer}
                        onClose={() => setOpenDrawer(false)}
                        sx={{
                            '& .MuiDrawer-paper': {
                                width: 375,
                                boxSizing: 'border-box',
                                p: 2
                            },
                        }}
                    >
                        <Box p={1} sx={{ position: 'relative', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} mb={4} className={style.cursorPointer}>
                                <CloseIcon sx={{ color: '#5C6F82' }} onClick={() => setOpenDrawer(false)} />
                            </Box>
                            <Typography variant="h6" mb={4}>{t('pages.purchaseManagement.drawer.title')}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.trxDate')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {new Date(selectedTransaction?.updateDate).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }).replace(',', '') ?? MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.householdAppliance')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.additionalProperties?.productName ?? MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.fiscalCode')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.fiscalCode ?? MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.totalAmount')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.effectiveAmountCents !== null && selectedTransaction?.effectiveAmountCents !== undefined 
                                            ? formatEuro(selectedTransaction?.effectiveAmountCents) 
                                            : MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.rewardAmount')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.rewardAmountCents !== null && selectedTransaction?.rewardAmountCents !== undefined 
                                            ? formatEuro(selectedTransaction?.rewardAmountCents) 
                                            : MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.authorizedAmount')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.residualAmountCents !== null && selectedTransaction?.residualAmountCents !== undefined 
                                            ? formatEuro(selectedTransaction?.residualAmountCents) 
                                            : MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" mb={1} sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                                        {t('pages.purchaseManagement.drawer.status')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                                        {selectedTransaction?.status ? getStatusChip(t, selectedTransaction?.status) : MISSING_DATA_PLACEHOLDER}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    onClick={selectedTransaction?.status === 'AUTHORIZED' ? handleCaptureTransaction : handleRequestRefund}
                                >
                                    {selectedTransaction?.status === 'AUTHORIZED' 
                                        ? t('pages.purchaseManagement.drawer.confirmPayment') 
                                        : t('pages.purchaseManagement.drawer.requestRefund')}
                                </Button>
                                <Button 
                                    fullWidth 
                                    onClick={selectedTransaction?.status === 'AUTHORIZED' 
                                        ? handleCancelTransaction 
                                        : () => { setRefundTransactionModal(true); setOpenDrawer(false); }
                                    } 
                                    sx={{ color: selectedTransaction?.status === 'AUTHORIZED' ? '#D85757' : '#' }}
                                >
                                    {selectedTransaction?.status === 'AUTHORIZED' 
                                        ? t('pages.purchaseManagement.drawer.cancellPayment') 
                                        : t('pages.purchaseManagement.drawer.refund')}
                                </Button>
                            </Box>
                        </Box>
                    </Drawer>
                }
                externalState={{
                    transactionAuthorized,
                    transactionCaptured,
                    errorDeleteTransaction,
                    errorCaptureTransaction
                }}
            />

            <ModalComponent open={cancelTransactionModal || captureTransactionModal} onClose={() => {
                setCancelTransactionModal(false);
                setCaptureTransactionModal(false);
            }}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant="h6">
                        {captureTransactionModal 
                            ? t('pages.purchaseManagement.captureTransactionModal.title') 
                            : t('pages.purchaseManagement.cancelTransactionModal.title')}
                    </Typography>
                    <Typography variant="body1">
                        {captureTransactionModal 
                            ? `${t('pages.purchaseManagement.captureTransactionModal.description1')} ${formatEuro(selectedTransaction?.effectiveAmountCents)}
                                ${t('pages.purchaseManagement.captureTransactionModal.description2')}${selectedTransaction?.additionalProperties?.productName}
                                ${t('pages.purchaseManagement.captureTransactionModal.description3')} "Da Rimborsare"`
                            : t('pages.purchaseManagement.cancelTransactionModal.description')}.
                    </Typography>
                </Box>
                <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
                    <Button variant="outlined" onClick={() => { 
                        setCaptureTransactionModal(false); 
                        setCancelTransactionModal(false); 
                        setOpenDrawer(true);
                    }}>
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

            <ModalComponent open={refundTransactionModal} onClose={() => setRefundTransactionModal(false)}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant="h6">{t('pages.purchaseManagement.refundTransactionModal.title')}</Typography>
                    <Typography variant="body1">{t('pages.purchaseManagement.refundTransactionModal.description')}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
                    <Button variant="outlined" onClick={() => { 
                        setRefundTransactionModal(false); 
                        setOpenDrawer(true);
                    }}>
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