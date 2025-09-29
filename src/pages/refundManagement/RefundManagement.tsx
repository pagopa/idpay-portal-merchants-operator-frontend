import { Box, Grid, Typography, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useEffect, useState, useCallback, useRef } from "react";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { getProcessedTransactions } from "../../services/merchantService";
import { authStore } from "../../store/authStore";
import { jwtDecode } from 'jwt-decode';
import AlertComponent from "../../components/Alert/AlertComponent";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import { GridRenderCellParams, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import { GetProcessedTransactionsFilters, PaginationExtendedModel, DecodedJwtToken } from "../../utils/types";
import { getStatusChip } from "../../utils/helpers";

const RefundManagement = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>({
        page: 0,
        pageSize: import.meta.env.VITE_PAGINATION_SIZE,
        totalElements: 0
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [errorAlert, setErrorAlert] = useState(false);
    const { t } = useTranslation();
    const token = authStore.getState().token;

    const isLoadingRef = useRef(false);

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
        setSortModel([
            {
                field: 'updateDate',
                sort: 'asc'
            }
        ]);
        fetchTransactions({});
    }, []);

    useEffect(() => {
        if (errorAlert) {
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);

    const fetchTransactions = useCallback(async (params: {
        fiscalCode?: string;
        productGtin?: string;
        status?: string;
        page?: number;
        size?: number;
        sort?: string;
    }) => {
        if (isLoadingRef.current) {
            return;
        }

        const decodeToken: DecodedJwtToken = jwtDecode(token);

        isLoadingRef.current = true;
        setLoading(true);

        try {
            const response = await getProcessedTransactions(
                import.meta.env.VITE_INITIATIVE_ID,
                decodeToken?.point_of_sale_id,
                Object.keys(params).length > 0 ? params : {
                    sort: 'updateDate,asc',
                    page: paginationModel.page,
                    size: paginationModel.pageSize
                }
            );

            setPaginationModel({
                page: response.pageNo || 0,
                pageSize: response.pageSize || import.meta.env.VITE_PAGINATION_SIZE,
                totalElements: response.totalElements || 0
            });

            setRows([...response.content]);
            setErrorAlert(false);
        } catch (error) {
            console.error('RefundManagement: Errore fetch:', error);
            setLoading(false);
            setErrorAlert(true);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [token, paginationModel.page, paginationModel.pageSize]);


    const columns = [
        {
            field: 'additionalProperties',
            headerName: 'Elettrodomestico',
            flex: 3,
            disableColumnMenu: true,
            align: 'center',
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value?.productName) {
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
            field: 'updateDate',
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
            align: 'center',
            headerAlign: 'left',
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
            align: 'center',
            headerAlign: 'left',
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
            alignVertical: 'center',
            renderCell: (params: GridRenderCellParams) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        {getStatusChip(t, params.value)}
                    </Box>
                )
            }
        },
    ];


    const handleApplyFilters = (filtersObj: GetProcessedTransactionsFilters) => {
        if (sortModel?.length > 0 && sortModel[0].field === 'additionalProperties') {
            fetchTransactions({
                sort: 'productCategory,' + sortModel[0].sort,
                page: paginationModel.page,
                size: paginationModel.pageSize,
                ...filtersObj
            });
        } else {
            fetchTransactions({
                sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
                page: paginationModel.page,
                size: paginationModel.pageSize,
                ...filtersObj
            });
        }
    };

    const handlePaginationChange = (model: GridPaginationModel) => {
        if (sortModel?.length > 0 && sortModel[0].field === 'additionalProperties') {
            fetchTransactions({
                sort: 'productCategory,' + sortModel[0].sort,
                page: model.page,
                size: model.pageSize,
                ...formik.values
            });
        } else {
            fetchTransactions({
                sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
                page: model.page,
                size: model.pageSize,
                ...formik.values
            });
        }
    };

    const handleSortModelChange = (model: GridSortModel) => {
        if (model.length > 0) {
            setSortModel(model);
            if (model[0].field === 'additionalProperties') {
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

    return (
        <Box>
            <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <TitleBox
                    title={t('pages.refundManagement.title')}
                    variantTitle="h4"
                    subTitle={t('pages.refundManagement.subtitle')}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
            </Box>

            <Typography variant="h6">
                {t('pages.refundManagement.tableTitle')}
            </Typography>
            <Box>
                {
                    (rows.length > 0 || (rows.length === 0 && (formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null && formik.values.status !== ''))) && (
                        <FiltersForm
                            formik={formik}
                            onFiltersApplied={handleApplyFilters}
                            onFiltersReset={() => {
                                if(formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null) {
                                    handleApplyFilters({
                                        fiscalCode: '',
                                        productGtin: '',
                                        status: '',
                                    });
                                }
                                formik.resetForm();
                            }}
                            filtersApplied={formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || (formik.values.status !== null && formik.values.status !== '')}
                        >
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                                <TextField
                                    name="fiscalCode"
                                    label={t('commons.fiscalCodeFilterPlaceholer')}
                                    size="small"
                                    fullWidth
                                    value={formik.values.fiscalCode}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
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
                                        <MenuItem value="REWARDED">
                                            {getStatusChip(t, "REWARDED")}
                                        </MenuItem>
                                        <MenuItem value="CANCELLED">
                                            {getStatusChip(t, "CANCELLED")}
                                        </MenuItem>
                                        <MenuItem value="REFUNDED">
                                            {getStatusChip(t, "REFUNDED")}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </FiltersForm>
                    )
                }
            </Box>

            {
                loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }} data-testid="loading">
                        <CircularProgress />
                    </Box>
                )
            }

            {(rows && rows?.length > 0 && !loading) && (
                <Grid container mt={2}>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <Box sx={{ height: 'auto', width: '100%' }}>
                            <DataTable
                                rows={rows}
                                columns={columns}
                                onPaginationPageChange={handlePaginationChange}
                                paginationModel={paginationModel}
                                onSortModelChange={handleSortModelChange}
                                sortModel={sortModel}
                            />
                        </Box>
                    </Grid>
                </Grid>
            )}
            {rows.length === 0 && !loading && (
                <Paper sx={{ my: 4, p: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2">{t('pages.refundManagement.noTransactions')}</Typography>
                </Paper>
            )}

            {errorAlert && <AlertComponent error={true} message={t('pages.refundManagement.errorAlert')} />}
        </Box>
    );
};

export default RefundManagement;