import { Box, Button, Grid, Typography, Tooltip, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, Paper} from "@mui/material";
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
import { DecodedJwtToken, PaginationExtendedModel, GetProcessedTransactionsFilters } from "../../utils/types";
import { GridPaginationModel, GridRenderCellParams, GridSortModel } from "@mui/x-data-grid";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";

const PurchaseManagement = () => {
    const [loading, setLoading] = useState(true);
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>({
        page: 0,
        pageSize: import.meta.env.VITE_PAGINATION_SIZE,
        totalElements: 0
    });
    const [transactions, setTransactions] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = authStore.getState().token;

    const initialValues: GetProcessedTransactionsFilters = {
        fiscalCode: '',
        productGtin: '',
        status: ''
    };

    const formik = useFormik<GetProcessedTransactionsFilters>({
        initialValues,
        onSubmit: (values) => {
            console.log('Eseguo ricerca con filtri:', values);
        }
    });

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
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
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
            renderCell: (params: GridRenderCellParams) => {
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
            renderCell: (params: GridRenderCellParams) => {
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
            renderCell: (params: GridRenderCellParams) => {
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
            renderCell: (params: GridRenderCellParams) => {
                if (params.value === "AUTHORIZED") {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Chip
                                label={t('pages.refundManagement.authorized')}
                                size="small"
                                sx={{ backgroundColor: '#EEEEEE !important', color: '#17324D !important' }}
                            />
                        </Box>
                    )
                } else {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Chip
                                label={t('pages.refundManagement.captured')}
                                size="small"
                                sx={{ backgroundColor: '#FFF5DA !important', color: '#614C16 !important' }}
                            />
                        </Box>
                    )
                }
            }
        },
    ];

    const fetchTransactions = async (params: {
        fiscalCode?: string;
        gtiIn?: string;
        status?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) => {
        const decodeToken: DecodedJwtToken = jwtDecode(token);
        try {
            setLoading(true);
            const response = await getInProgressTransactions(
                import.meta.env.VITE_INITIATIVE_ID,
                decodeToken?.point_of_sale_id,
                Object.keys(params).length > 0 ? params : {
                    sort: 'trxDate,asc',
                    page: paginationModel.page,
                    size: paginationModel.pageSize
                }
            );
            setTransactions([...response.content]);
            setPaginationModel({
                page: response.pageNo,
                pageSize: response.pageSize || import.meta.env.VITE_PAGINATION_SIZE,
                totalElements: response.totalElements
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const handleSortModelChange = (model: GridSortModel) => {
        if (model.length > 0) {
            setSortModel(model);
            if(model[0].field === 'additionalProperties'){
                fetchTransactions({
                    sort: 'productCategory,' + model[0].sort,
                    page: paginationModel.page,
                    size: paginationModel.pageSize,
                    ...formik.values
                });
            } else {
                fetchTransactions({
                    sort: model[0].field + ',' + model[0].sort,
                    page: paginationModel.page,
                    size: paginationModel.pageSize,
                    ...formik.values
                });
            }
        }
    };

    const handleApplyFilters = (filtersObj: GetProcessedTransactionsFilters) => {
        fetchTransactions({
            page: paginationModel.page,
            size: paginationModel.pageSize,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
            ...filtersObj
        });
    };

    const handlePaginationChange = (model: GridPaginationModel) => {
        fetchTransactions({
            page: model.page,
            size: model.pageSize,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
            ...formik.values
        });
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
                {t('pages.purchaseManagement.tableTitle')}
            </Typography>
            {
                (transactions?.length > 0 || (transactions?.length === 0 && (formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null))) && (
                    <FiltersForm
                        formik={formik}
                        onFiltersApplied={handleApplyFilters}
                        onFiltersReset={() => {
                            formik.resetForm();
                            fetchTransactions({});
                        }}
                    >
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <TextField
                                name="fiscalCode"
                                label={t('commons.fiscalCodeFilterPlaceholer')}
                                size="small"
                                fullWidth
                                value={formik.values.fiscalCode}
                                onChange={formik.handleChange}
                                data-testid="fiscal-code-filter"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                            <TextField
                                name="productGtin"
                                label={t('commons.gtiInFilterPlaceholer')}
                                size="small"
                                fullWidth
                                value={formik.values.productGtin}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="pos-type-label">{t('commons.statusFilterPlaceholer')}</InputLabel>
                                <Select
                                    labelId="pos-type-label"
                                    id="pos-type-select"
                                    label={t('commons.statusFilterPlaceholer')}
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="AUTHORIZED">
                                        <Chip label={t('pages.refundManagement.authorized')} size="small" sx={{ backgroundColor: '#EEEEEE !important', color: '#17324D !important' }} />
                                    </MenuItem>
                                    <MenuItem value="CAPTURED">
                                        <Chip label={t('pages.refundManagement.captured')} size="small" sx={{ backgroundColor: '#FFF5DA !important', color: '#614C16 !important' }} />
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </FiltersForm>
                )
            }
            {
                loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }} data-testid="loading">
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
                                    paginationModel={paginationModel}
                                    onPaginationPageChange={handlePaginationChange}
                                    onSortModelChange={handleSortModelChange}
                                    sortModel={sortModel}
                                />
                            </Box>
                        </Grid>

                    </Grid>
                )
            }
            {transactions.length === 0 && !loading && (
                <Paper sx={{ my: 4, p: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2">{t('pages.refundManagement.noTransactions')}</Typography>
                </Paper>
            )}

        </Box>
    );
};

export default PurchaseManagement;