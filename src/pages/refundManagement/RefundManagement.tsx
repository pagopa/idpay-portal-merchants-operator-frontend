import { Box, Button, Grid, Typography, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem, Paper } from "@mui/material";
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

const RefundManagement = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginationModel, setPaginationModel] = useState<any>({
        pageNo: 0,
        pageSize: 10,
        totalElements: 0
    });
    const [sortModel, setSortModel] = useState<any>([]);
    const [errorAlert, setErrorAlert] = useState(false);
    const { t } = useTranslation();
    const token = authStore.getState().token;
    
    const isLoadingRef = useRef(false);

    const initialValues = {
        fiscalCode: '',
        gtiIn: '',
        status: null
    };

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            console.log('Eseguo ricerca con filtri:', values);
        }
    });

    useEffect(() => {
        fetchTransactions({});
    }, []);

    useEffect(() => {
        console.log('formik.values', formik.values);
    }, [formik.values]);
    
    const fetchTransactions = useCallback(async (params: any) => {
        if (isLoadingRef.current) {
            return;
        }

        const decodeToken: any = jwtDecode(token);
        
        isLoadingRef.current = true;
        setLoading(true);
        
        try {
            const response = await getProcessedTransactions(
                "688a12d87415622f166697a0", 
                decodeToken?.point_of_sale_id, 
                params
            );
            
            setPaginationModel({
                pageNo: response.pageNo || 0,
                pageSize: response.pageSize || 10,
                totalElements: response.totalElements || 0
            });
            
            setRows([...response.content]);
            setErrorAlert(false); 
        } catch (error) {
            console.error('RefundManagement: Errore fetch:', error);
            setErrorAlert(true);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [token]);


    const columns = [
        {
            field: 'elettrodomestico', 
            headerName: 'Elettrodomestico', 
            flex: 1.5, 
            disableColumnMenu: true, 
            align: 'center', 
            sortable: false, 
            renderCell: (params: any) => {
                if(params.value){
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
            renderCell: (params: any) => {
                if(params.value){
                    return new Date(params.value).toLocaleDateString('it-IT');
                }
                return MISSING_DATA_PLACEHOLDER;
            } 
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
            disableColumnMenu: true, 
            sortable: false, 
            renderCell: (params: any) => {
                if(params.value || params.value === 0){
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
            disableColumnMenu: true, 
            sortable: false, 
            renderCell: (params: any) => {
                if(params.value || params.value === 0){
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
            flex: 1, 
            disableColumnMenu: true, 
            sortable: false, 
            renderCell: (params: any) => {
                if(params.value === "CANCELLED"){
                    return (
                        <Chip 
                            label={t('pages.refundManagement.chipCancelled')} 
                            size="small" 
                            sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }} 
                        />
                    )
                }else{
                    return (
                        <Chip 
                            label={t('pages.refundManagement.chipRefunded')} 
                            size="small" 
                            sx={{ backgroundColor: '#C4DCF5 !important', color: '#17324D !important' }} 
                        />
                    )
                }
               
            }
        },
    ];

    const setApiFilters = useCallback((filtersObj: any) => {
        fetchTransactions({
            ...filtersObj,
            page: 0, 
            size: paginationModel.pageSize || 10,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
        });
    }, [fetchTransactions, paginationModel.pageSize, sortModel]);

    const handlePaginationChange = useCallback((newPaginationModel: any) => {
        
        if (newPaginationModel.pageNo === paginationModel.pageNo && 
            newPaginationModel.pageSize === paginationModel.pageSize) {
            return;
        }

        fetchTransactions({
            page: newPaginationModel.pageNo,
            size: newPaginationModel.pageSize,
            sort: sortModel[0].field + ',' + sortModel[0].sort,
        });
    }, [fetchTransactions, paginationModel.pageNo, paginationModel.pageSize, sortModel]);

    const handleSortModelChange = (model: any) => {
        if(model.length > 0){
            setSortModel(model);
            fetchTransactions({
                sort: model[0].field + ',' + model[0].sort,
                page: paginationModel.pageNo,
                size: paginationModel.pageSize,
                ...formik.values
            });
        }
    }

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
                Transazioni
            </Typography>
            
            {(rows.length > 0 || loading) ? (
                <>
                    <Box>
                        <FiltersForm
                            formik={formik}
                            onFiltersApplied={setApiFilters}
                            onFiltersReset={() => setApiFilters({})}
                        >
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField 
                                    name="fiscalCode" 
                                    label="Cerca per codice fiscale" 
                                    size="small" 
                                    value={formik.values.fiscalCode} 
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField 
                                    name="gtiIn" 
                                    label="Cerca per GTI In" 
                                    size="small" 
                                    value={formik.values.gtiIn} 
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="pos-type-label">Stato</InputLabel>
                                    <Select
                                        labelId="pos-type-label"
                                        id="pos-type-select"
                                        label="Stato"
                                        name="status"
                                        value={formik.values.status}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        <MenuItem value=""><em>Tutti gli stati</em></MenuItem>
                                        <MenuItem value="CANCELLED">
                                            <Chip label="Annullato" size="small" sx={{ backgroundColor: '#FFE0E0 !important', color: '#761F1F !important' }} />
                                        </MenuItem>
                                        <MenuItem value="REWARDED">
                                            <Chip label="Stornato" size="small" sx={{ backgroundColor: '#C4DCF5 !important', color: '##17324D !important' }} />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </FiltersForm>
                    </Box>
                    
                    <Grid container mt={2}>
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                            <Box sx={{ height: 600, width: '100%' }}>
                                <DataTable
                                    rows={rows}
                                    columns={columns}
                                    loading={loading} 
                                    onPaginationPageChange={handlePaginationChange}  
                                    paginationModel={paginationModel}
                                    onSortModelChange={handleSortModelChange}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{my: 4, p: 3, textAlign: 'center', display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="body2">{t('pages.refundManagement.noTransactions')}</Typography>
                </Paper>
            )}
            
            {errorAlert && <ErrorAlert message={t('pages.refundManagement.errorAlert')} />}
        </Box>
    );
};

export default RefundManagement;