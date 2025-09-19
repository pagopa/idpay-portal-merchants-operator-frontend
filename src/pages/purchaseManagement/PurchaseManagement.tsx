import { Box, Button, Grid, Typography, Tooltip, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate } from "react-router-dom";
import ROUTES from "../../routes";
import { getInProgressTransactions } from "../../services/merchantService";
import { jwtDecode } from 'jwt-decode';
import { authStore } from "../../store/authStore";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";

const PurchaseManagement = () => {
    const [loading, setLoading] = useState(true);
    const [sortModel, setSortModel] = useState<any>([]);
    const [paginationModel, setPaginationModel] = useState<any>({
        pageNo: 0,
        pageSize: import.meta.env.VITE_PAGINATION_SIZE,
        totalElements: 0
    });
    const [transactions, setTransactions] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = authStore.getState().token;

    useEffect(() => {
        fetchTransactions({});
    }, []);


    const columns = [
        {
            field: "additionalProperties",
            headerName: 'Elettrodomestico',
            flex: 1.5,
            disableColumnMenu: true,
            align: 'center',
            sortable: false,
            renderCell: (params: any) => {
                if (params.value) {
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%'
                        }}>
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
                    )
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
        {
            field: 'trxDate',
            headerName: 'Data e ora',
            flex: 1,
            disableColumnMenu: true,
            renderCell: (params: any) => {
                if (params.value) {
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%'
                        }}>
                            <Tooltip title={params.value ? new Date(params.value).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }).replace(',', '') : MISSING_DATA_PLACEHOLDER}>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {
                                        params.value ? new Date(params.value).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }).replace(',', '') : MISSING_DATA_PLACEHOLDER
                                    }
                                </Typography>
                            </Tooltip>
                        </div>
                    )
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
        {
            field: 'fiscalCode',
            headerName: 'Beneficiario',
            flex: 1.5,
            disableColumnMenu: true,
            sortable: false
        },
        {
            field: 'effectiveAmountCents',
            headerName: 'Totale della spesa',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: any) => {
                if (params.value || params.value === 0) {
                    return (params.value / 100).toLocaleString('it-IT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + '€';
                }
                return MISSING_DATA_PLACEHOLDER;
            }
        },
        {
            field: 'rewardAmountCents',
            headerName: 'Importo autorizzato',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params: any) => {
                if (params.value || params.value === 0) {
                    return (params.value / 100).toLocaleString('it-IT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + '€';
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
            renderCell: (params: any) => {
                if (params.value === "AUTHORIZED") {
                    return (
                        <Chip
                            label={t('pages.refundManagement.authorized')}
                            size="small"
                            sx={{ backgroundColor: '#EEEEEE !important', color: '#17324D !important' }}
                        />
                    )
                } else {
                    return (
                        <Chip
                            label={t('pages.refundManagement.captured')}
                            size="small"
                            sx={{ backgroundColor: '#FFF5DA !important', color: '#614C16 !important' }}
                        />
                    )
                }
            }
        },
    ];

    const fetchTransactions = async (params: any) => {
        const decodeToken: any = jwtDecode(token);
        try {
            setLoading(true);
            const response = await getInProgressTransactions(
                import.meta.env.VITE_INITIATIVE_ID,
                decodeToken?.point_of_sale_id,
                Object.keys(params).length > 0 ? params : {
                    sort: 'trxDate,asc',
                    page: paginationModel.pageNo,
                    size: paginationModel.pageSize
                }
            );
            setTransactions([...response.content]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const handleSortModelChange = (model: any) => {
        if (model.length > 0) {
            setSortModel(model);
            fetchTransactions({
                sort: model[0].field + ',' + model[0].sort,
                page: paginationModel.pageNo,
                size: paginationModel.pageSize,
            });
        }
    };




    return (
        <Box>
            <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <TitleBox
                    title={t('pages.purchaseManagement.title')}
                    variantTitle="h4"
                    subTitle={t('pages.purchaseManagement.subtitle')}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
                <Button variant="contained" size="small" startIcon={<QrCodeIcon />} sx={{ display: 'flex', textWrap: 'nowrap' }} onClick={() => navigate(ROUTES.ACCEPT_DISCOUNT)}>Accetta buono sconto</Button>
            </Box>
            <Typography variant="h6" >
                Transazioni
            </Typography>
            {
                loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} data-testid="loading">
                        <CircularProgress />
                    </Box>
                )
            }
            {
                !loading && transactions?.length > 0 && (
                    <Grid container mt={2}>
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                            <Box sx={{ height: 'auto', width: '100%' }}>
                                <DataTable
                                    rows={transactions}
                                    columns={columns}
                                    // pageSize={10}
                                    // rowsPerPage={10}
                                    paginationModel={{
                                        pageSize: import.meta.env.VITE_PAGINATION_SIZE,
                                        pageNo: 0,
                                        totalElements: transactions.length
                                    }}
                                    onSortModelChange={handleSortModelChange}
                                    sortModel={sortModel}
                                />
                            </Box>
                        </Grid>

                    </Grid>
                )
            }

        </Box>
    );
};

export default PurchaseManagement;