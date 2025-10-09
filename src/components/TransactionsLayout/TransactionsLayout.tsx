import { Box, Grid, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import DataTable from "../DataTable/DataTable";
import { useEffect, useState, useCallback, useRef } from "react";
import FiltersForm from "../FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { authStore } from "../../store/authStore";
import { jwtDecode } from 'jwt-decode';
import AlertComponent from "../Alert/AlertComponent";
import { GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import { GetProcessedTransactionsFilters, PaginationExtendedModel, DecodedJwtToken } from "../../utils/types";
import { getStatusChip } from "../../utils/helpers";
import { useAutoResetBanner } from "../../hooks/useAutoResetBanner";

interface TransactionsLayoutProps {
    title: string;
    subtitle: string;
    tableTitle: string;
    fetchTransactionsApi: (initiativeId: string, posId: string, params: any) => Promise<any>;
    columns: any[];
    statusOptions: string[];
    additionalButton?: {
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
    };
    alerts: Array<[boolean, (value: boolean) => void]>;
    alertMessages: {
        error?: string;
        [key: string]: string | undefined;
    };
    noDataMessage: string;
    onRowAction: (row: any) => void;
    DrawerComponent?: React.ReactNode;
    externalState?: {
        [key: string]: any;
    };
    triggerFetchTransactions?: boolean;
}

const TransactionsLayout: React.FC<TransactionsLayoutProps> = ({
    title,
    subtitle,
    tableTitle,
    fetchTransactionsApi,
    columns,
    statusOptions,
    additionalButton,
    alerts,
    alertMessages,
    noDataMessage,
    onRowAction,
    DrawerComponent,
    triggerFetchTransactions,
    externalState = {}
}) => {
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

    const allAlerts = [
        [errorAlert, setErrorAlert],
        ...alerts
    ];

    useAutoResetBanner(allAlerts);

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
                sort: 'desc'
            }
        ]);
        fetchTransactions({});
    }, []);

    useEffect(() => {
        if(triggerFetchTransactions){
            fetchTransactions({});
        }
    },[triggerFetchTransactions])

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
            const response = await fetchTransactionsApi(
                import.meta.env.VITE_INITIATIVE_ID,
                decodeToken?.point_of_sale_id,
                Object.keys(params).length > 0 ? params : {
                    sort: 'updateDate,desc',
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
            console.error('Errore fetch:', error);
            setErrorAlert(true);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [token, paginationModel.page, paginationModel.pageSize, fetchTransactionsApi]);

    const handleApplyFilters = (filtersObj: GetProcessedTransactionsFilters) => {
        if (sortModel?.length > 0 && sortModel[0].field === 'additionalProperties') {
            fetchTransactions({
                sort: 'productName,' + sortModel[0].sort,
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
                sort: 'productName,' + sortModel[0].sort,
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
                    sort: 'productName,' + model[0].sort,
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
            {DrawerComponent}
            
            <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <TitleBox
                    title={title}
                    variantTitle="h4"
                    subTitle={subtitle}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
                {additionalButton && (
                    <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={additionalButton.icon} 
                        sx={{ textWrap: 'nowrap' }} 
                        onClick={additionalButton.onClick}
                    >
                        {additionalButton.label}
                    </Button>
                )}
            </Box>

            <Typography variant="h6">
                {tableTitle}
            </Typography>

            <Box>
                {(rows.length > 0 || (rows.length === 0 && (formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null && formik.values.status !== ''))) && (
                    <FiltersForm
                        formik={formik}
                        onFiltersApplied={handleApplyFilters}
                        onFiltersReset={() => {
                            if (formik.values.fiscalCode.length > 0 || formik.values.productGtin.length > 0 || formik.values.status !== null) {
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
                                <InputLabel id="status-label">{t('commons.statusFilterPlaceholer')}</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status-select"
                                    label={t('commons.statusFilterPlaceholer')}
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    {statusOptions.map(status => (
                                        <MenuItem key={status} value={status}>
                                            {getStatusChip(t, status)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </FiltersForm>
                )}
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }} data-testid="loading">
                    <CircularProgress />
                </Box>
            )}

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
                                handleRowAction={onRowAction}
                            />
                        </Box>
                    </Grid>
                </Grid>
            )}

            {rows.length === 0 && !loading && (
                <Paper sx={{ my: 4, p: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2">{noDataMessage}</Typography>
                </Paper>
            )}

            {/* Alerts */}
            {errorAlert && <AlertComponent error={true} message={alertMessages.error || t('pages.refundManagement.errorAlert')} />}
            {Object.entries(externalState).map(([key, value]) => {
                if (value && alertMessages[key]) {
                    return <AlertComponent key={key} error={key.includes('error')} message={alertMessages[key]!} />;
                }
                return null;
            })}
        </Box>
    );
};

export default TransactionsLayout;