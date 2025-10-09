import { Box, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { getProcessedTransactions, downloadInvoiceFileApi } from "../../services/merchantService";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import { GridRenderCellParams } from '@mui/x-data-grid';
import { getStatusChip, formatEuro } from "../../utils/helpers";
import { DetailsDrawer } from "../../components/DetailsDrawer/DetailsDrawer";
import { useLocation } from "react-router-dom";
import { PointOfSaleTransactionProcessedDTO } from "../../api/generated/merchants/PointOfSaleTransactionProcessedDTO";
import TransactionsLayout from "../../components/TransactionsLayout/TransactionsLayout";
import { authStore } from "../../store/authStore";
import { DecodedJwtToken } from "../../utils/types";
import { jwtDecode } from 'jwt-decode';
// import { getFileUrl } from "../../services/merchantService";

const RefundManagement = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<PointOfSaleTransactionProcessedDTO>({});
    const [errorDownloadAlert, setErrorDownloadAlert] = useState(false);
    const [transactionReverseSuccess, setTransactionReverseSuccess] = useState(false);
    const [transactionRefundSuccess, setTransactionRefundSuccess] = useState(false);
    const [downloadInProgress, setDownloadInProgress] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
    const token = authStore.getState().token;

    useEffect(() => {
        if (location.state) {
            const { refundUploadSuccess, reverseUploadSuccess } = location.state;
            if (refundUploadSuccess) {
                setTransactionRefundSuccess(true);
            } else if (reverseUploadSuccess) {
                setTransactionReverseSuccess(true);
            }
        }
    }, [location.state]);

    const handleRowAction = useCallback((transaction) => {
        setIsOpen(true);
        const invoiceLabel = transaction?.status === 'REFUNDED' ? 'Nota di credito' : transaction?.status === 'CANCELLED' ? 'cancelled' : 'Fattura'

        const mappedTransaction = {
            'Data e ora': new Date(transaction?.updateDate).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(',', ''),
            'Elettrodomestico': transaction?.additionalProperties.productName,
            'Codice Fiscale': transaction?.fiscalCode,
            'Totale della spesa': transaction?.effectiveAmountCents && formatEuro(transaction.effectiveAmountCents),
            'Sconto applicato': transaction?.rewardAmountCents && formatEuro(transaction.rewardAmountCents),
            'Importo autorizzato': transaction?.rewardAmountCents && transaction.effectiveAmountCents && formatEuro(transaction.effectiveAmountCents - transaction.rewardAmountCents),
            'Stato': getStatusChip(t, transaction?.status),
            [invoiceLabel]: transaction?.invoiceFile?.filename,
            'id': transaction?.id,
        };
        setSelectedTransaction(mappedTransaction);
    }, [t]);

    const downloadInvoiceFile = async () => {
        const decodeToken: DecodedJwtToken = jwtDecode(token);
        setDownloadInProgress(true);
        try {
            const response = await downloadInvoiceFileApi(decodeToken?.point_of_sale_id,selectedTransaction?.id);
            const { invoiceUrl } = response;

            const filename = selectedTransaction?.invoiceFile?.filename || "fattura.pdf";

            const link = document.createElement("a");
            link.href = invoiceUrl;
            link.download = filename;
            link.click();
            setDownloadInProgress(false);

        } catch (error) {
            console.error('Errore download file:', error);
            setErrorDownloadAlert(true);
            setDownloadInProgress(false);
        }
    };

    const columns = [
        {
            field: 'additionalProperties',
            headerName: 'Elettrodomestico',
            flex: 2.5,
            disableColumnMenu: true,
            align: 'center',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value?.productName) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Tooltip title={params.value?.productName}>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: '400',
                                    fontSize: '16px'
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
            flex: 1.5,
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
                                    whiteSpace: 'nowrap',
                                    fontWeight: '400',
                                    fontSize: '16px'
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
            flex: 1.2,
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
                                    whiteSpace: 'nowrap',
                                    fontWeight: '400',
                                    fontSize: '16px'
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
            flex: 1,
            type: 'number',
            align: 'center',
            headerAlign: 'left',
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
            flex: 1,
            type: 'number',
            align: 'center',
            headerAlign: 'left',
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
            field: 'authorizedAmountCents',
            headerName: 'Importo autorizzato',
            flex: 1.4,
            type: 'number',
            align: 'center',
            headerAlign: 'left',
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
            alignVertical: 'center',
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        {getStatusChip(t, params.value)}
                    </Box>
                );
            }
        },
    ];

    return (
        <TransactionsLayout
            title={t('pages.refundManagement.title')}
            subtitle={t('pages.refundManagement.subtitle')}
            tableTitle={t('pages.refundManagement.tableTitle')}
            fetchTransactionsApi={getProcessedTransactions}
            columns={columns}
            statusOptions={['REWARDED', 'CANCELLED', 'REFUNDED']}
            alerts={[
                [transactionReverseSuccess, setTransactionReverseSuccess],
                [transactionRefundSuccess, setTransactionRefundSuccess],
                [errorDownloadAlert, setErrorDownloadAlert]
            ]}
            alertMessages={{
                error: t('pages.refundManagement.errorAlert'),
                transactionRefundSuccess: t('pages.refundManagement.refundSuccessUpload'),
                transactionReverseSuccess: t('pages.refundManagement.reverseSuccessUpload'),
                errorDownloadAlert: t('pages.refundManagement.errorDownloadAlert')
            }}
            noDataMessage={t('pages.refundManagement.noTransactions')}
            onRowAction={handleRowAction}
            DrawerComponent={
                <DetailsDrawer
                    isLoading={downloadInProgress}
                    setIsOpen={() => setIsOpen(false)}
                    isOpen={isOpen}
                    title={t('pages.purchaseManagement.drawer.title')}
                    item={selectedTransaction}
                    onFileDownloadCallback={downloadInvoiceFile}
                />
            }
            externalState={{
                transactionRefundSuccess,
                transactionReverseSuccess,
                errorDownloadAlert
            }}
        />
    );
};

export default RefundManagement;