import { Box, Grid, Typography, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../../components/DataTable/DataTable";
import { useEffect, useState, useCallback, useRef } from "react";
import Chip from "@mui/material/Chip";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { getProcessedTransactions } from "../../services/merchantService";
import { authStore } from "../../store/authStore";
import { jwtDecode } from 'jwt-decode';
import ErrorAlert from "../../components/errorAlert/ErrorAlert";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import { GridRenderCellParams, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import { GetProcessedTransactionsFilters, PaginationExtendedModel, DecodedJwtToken } from "../../utils/types";

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
                field: 'trxDate',
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
        gtiIn?: string;
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
                    sort: 'trxDate,asc',
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
            field: 'eletronicDevice',
            headerName: 'Elettrodomestico',
            flex: 1.5,
            disableColumnMenu: true,
            align: 'center',
            sortable: false,
            renderCell: (params: GridRenderCellParams) => {
                if (params.value) {
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%'
                        }}>
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
            align: 'left',
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
            align: 'left',
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
                if (params.value === "CANCELLED") {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Chip
                                label={t('pages.refundManagement.cancelled')}
                                size="small"
                                sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }}
                            />
                        </Box>
                    )
                } else if (params.value === "REFUNDED") {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Chip
                                label={t('pages.refundManagement.refunded')}
                                size="small"
                                sx={{ backgroundColor: '#C4DCF5 !important', color: '#17324D !important' }}
                            />
                        </Box>
                    )
                } else {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                            <Chip
                                label={t('pages.refundManagement.rewarded')}
                                size="small"
                                sx={{ backgroundColor: '#E1F4E1 !important', color: '#17324D !important' }}
                            />
                        </Box>
                    )
                }

            }
        },
    ];

    const setApiFilters = useCallback((filtersObj: GetProcessedTransactionsFilters) => {
        fetchTransactions({
            ...filtersObj,
            page: 0,
            size: paginationModel.pageSize || 10,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
        });
    }, [fetchTransactions, paginationModel.pageSize, sortModel]);

    const handlePaginationChange = useCallback((newPaginationModel: GridPaginationModel) => {

        if (newPaginationModel.page === paginationModel.page &&
            newPaginationModel.pageSize === paginationModel.pageSize) {
            return;
        }

        fetchTransactions({
            page: newPaginationModel.page,
            size: newPaginationModel.pageSize,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
            ...formik.values
        });
    }, [fetchTransactions, paginationModel.page, paginationModel.pageSize, sortModel, formik.values]);

    const handleSortModelChange = (model: GridSortModel) => {
        if (model.length > 0) {
            setSortModel(model);
            fetchTransactions({
                sort: model[0].field + ',' + model[0].sort,
                page: paginationModel.page,
                size: paginationModel.pageSize,
                ...formik.values
            });
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
                    (rows.length > 0 || (rows.length === 0 && (formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null))) && (
                        <FiltersForm
                            formik={formik}
                            onFiltersApplied={setApiFilters}
                            onFiltersReset={() => {
                                setApiFilters({
                                    fiscalCode: '',
                                    productGtin: '',
                                    status: '',
                                });
                                formik.resetForm();
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
                                        <MenuItem value="REWARDED">
                                            <Chip label="Rimborso richiesto" size="small" sx={{ backgroundColor: '#E1F4E1 !important', color: '##17324D !important' }} />
                                        </MenuItem>
                                        <MenuItem value="CANCELLED">
                                            <Chip label="Annullato" size="small" sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }} />
                                        </MenuItem>
                                        <MenuItem value="REFUNDED">
                                            <Chip label="Stornato" size="small" sx={{ backgroundColor: '#C4DCF5 !important', color: '##17324D !important' }} />
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

            {(rows && rows?.length > 0) && (
                <Grid container mt={2}>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <Box sx={{ height: 'auto', width: '100%' }}>
                            <DataTable
                                rows={rows}
                                columns={columns}
                                loading={loading}
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

            {errorAlert && <ErrorAlert message={t('pages.refundManagement.errorAlert')} />}
        </Box>
    );
};

export default RefundManagement;