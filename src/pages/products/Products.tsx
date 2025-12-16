import { Box, CircularProgress, Typography, Paper, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Drawer, Divider, Link, Button } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { ELEMENT_PER_PAGE, MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, useCallback } from "react";
import DataTable from "../../components/DataTable/DataTable";
import { getProductsList } from "../../services/merchantService";
import { GetProductsParams } from "../../utils/types";
import { GridPaginationModel, GridSortModel, GridRenderCellParams } from "@mui/x-data-grid";
import { PaginationExtendedModel } from "../../utils/types";
import { theme } from '@pagopa/mui-italia';
import CloseIcon from '@mui/icons-material/Close';
import style from '../purchaseManagement/purchaseManagement.module.css';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useAutoResetBanner } from "../../hooks/useAutoResetBanner";
import { handleGtinChange } from "../../utils/helpers";




const Products = () => {
    const [gtinError, setGtinError] = useState<string>('')
    const [productsList, setProductsList] = useState([]);
    const [productsListIsLoading, setProductsListIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>({
        page: 0,
        pageSize: import.meta.env.VITE_PAGINATION_SIZE,
        totalElements: 0
    });
    const initialValues = {
        category: '',
        brand: '',
        model: '',
        eprelCode: '',
        gtinCode: ''
    };
    const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(initialValues);
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const { t } = useTranslation();
    useAutoResetBanner([
        [errorAlert, setErrorAlert]
    ])

    const formik = useFormik({
        initialValues,
        onSubmit: (values) => {
            console.log('Eseguo ricerca con filtri:', values);
        }
    });

    const columns = [
        {
            field: 'category',
            headerName: 'Categoria',
            flex: 2,
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
                            <Tooltip title={params.value} placement='top'>
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
            field: 'brand',
            headerName: 'Marca',
            flex: 1,
            disableColumnMenu: true,
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
                            <Tooltip title={params.value} placement='top'>
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
            field: 'model',
            headerName: 'Modello',
            flex: 1.5,
            disableColumnMenu: true,
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
                            <Tooltip title={params.value} placement='top'>
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
            field: 'gtinCode',
            headerName: 'Codice GTIN/EAN',
            flex: 2,
            disableColumnMenu: true,
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
                            <Tooltip title={params.value} placement='top'>
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
            field: 'eprelCode',
            headerName: 'Codice EPREL',
            flex: 1,
            disableColumnMenu: true,
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
                            <Tooltip title={params.value} placement='top'>
                                <Typography sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: theme.typography.fontWeightMedium
                                }}>
                                    {(params.value && params?.value !== '' && params?.value !== null) && <Link sx={{ color: '#0062C3', fontWeight: theme.typography.fontWeightMedium }} href={params?.row?.linkEprel} target="_blank">{params.value}</Link>}
                                    {(!params.value || params?.value === '' || params?.value === null) && MISSING_DATA_PLACEHOLDER}
                                </Typography>
                            </Tooltip>
                        </div>
                    )
                }
                return MISSING_DATA_PLACEHOLDER;
            },
        },
    ];

    useEffect(() => {
        fetchProducts({});
        setProductsListIsLoading(true);
    }, []);

    const fetchProducts = useCallback(async (params: GetProductsParams) => {
        setProductsListIsLoading(true);
        try {
            const { content, pageNo, pageSize, totalElements } = await getProductsList({ size: import.meta.env.VITE_PAGINATION_SIZE, status: 'APPROVED', ...params });
            setProductsList([...content]);
            setPaginationModel({
                page: pageNo || 0,
                pageSize: pageSize || 10,
                totalElements: totalElements || 0
            });
            setProductsListIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsListIsLoading(false);
            setErrorAlert(true);
        }
    }, []);

    const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {

        if (newPaginationModel.page === paginationModel.page &&
            newPaginationModel.pageSize === paginationModel.pageSize) {
            return;
        }

        fetchProducts({
            page: newPaginationModel.page,
            size: newPaginationModel.pageSize,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
            ...appliedFilters
        });
    };

    const handleSortModelChange = (model: GridSortModel) => {
        if (model.length > 0) {
            setSortModel(model);
            fetchProducts({
                sort: model[0].field + ',' + model[0].sort,
                page: paginationModel.page,
                size: paginationModel.pageSize,
                ...appliedFilters
            });
        }
    }


    const handleFiltersApplied = (filtersObj: any) => {
        setFiltersAppliedOnce(true);
        setAppliedFilters(filtersObj);
        const queryParams = Object.keys(filtersObj).reduce((acc, key) => {
            const value = filtersObj[key];
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        fetchProducts({
            ...queryParams,
            page: 0,
            size: paginationModel.pageSize || 10,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
        });
    };

    const handleFiltersReset = () => {
        setFiltersAppliedOnce(false);
        setAppliedFilters(initialValues);
        formik.resetForm();
        fetchProducts({});
    };
    const handleRowAction = (row: any) => {
        setOpenDrawer(true);
        setSelectedProduct(row);
    };

    const areFiltersApplied = () => {
        return formik.values.category.length > 0 || formik.values.brand.length > 0 || formik.values.model.length > 0 || formik.values.eprelCode.length > 0 || formik.values.gtinCode.length > 0;
    };

    return (
        <Box>
            <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'}>
                <TitleBox
                    title={t('pages.products.title')}
                    variantTitle="h4"
                    subTitle={t('pages.products.subtitle')}
                    variantSubTitle='body2'
                    mbTitle={2}
                    mtTitle={0}
                    mbSubTitle={2}
                />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    sx={{ textWrap: 'nowrap' }}
                    onClick={() => window.open(import.meta.env.VITE_CSV_LINK, '_blank')?.focus()}
                >
                    Esporta csv
                </Button>
            </Box>
            <Box>
                {
                    ((productsList && productsList?.length > 0) || (productsList.length === 0 && (formik.values.category.length > 0 || formik.values.brand.length > 0 || formik.values.model.length > 0 || formik.values.eprelCode.length > 0 || formik.values.gtinCode.length > 0)) || filtersAppliedOnce) && (
                        <FiltersForm
                            formik={formik}
                            onFiltersApplied={handleFiltersApplied}
                            onFiltersReset={handleFiltersReset}
                            filtersApplied={areFiltersApplied()}
                            filtersAppliedOnce={filtersAppliedOnce}
                        >
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="pos-type-label">Categoria</InputLabel>
                                    <Select
                                        labelId="pos-type-label"
                                        id="pos-type-select"
                                        label="Categoria"
                                        name="category"
                                        value={formik.values.category}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    >
                                        <MenuItem value="REFRIGERATINGAPPL">
                                            Apparecchi di refrigerazione
                                        </MenuItem>
                                        <MenuItem value="TUMBLEDRYERS">
                                            Asciugatrici
                                        </MenuItem>
                                        <MenuItem value="RANGEHOODS">
                                            Cappe da cucina
                                        </MenuItem>
                                        <MenuItem value="OVENS">
                                            Forni
                                        </MenuItem>
                                        <MenuItem value="WASHERDRIERS">
                                            Lavasciuga
                                        </MenuItem>
                                        <MenuItem value="DISHWASHERS">
                                            Lavastoviglie
                                        </MenuItem>
                                        <MenuItem value="WASHINGMACHINES">
                                            Lavatrici
                                        </MenuItem>
                                        <MenuItem value="COOKINGHOBS">
                                            Piani cottura
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField
                                    name="brand"
                                    label="Marca"
                                    size="small"
                                    fullWidth
                                    value={formik.values.brand}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField
                                    name="model"
                                    label="Modello"
                                    size="small"
                                    fullWidth
                                    value={formik.values.model}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField
                                    name="eprelCode"
                                    label="Codice EPREL"
                                    size="small"
                                    fullWidth
                                    value={formik.values.eprelCode}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
                                <TextField
                                    name="gtinCode"
                                    label="Codice GTIN/EAN"
                                    size="small"
                                    fullWidth
                                    value={formik.values.gtinCode}
                                    onChange={(e) => setGtinError(handleGtinChange(e, formik))}
                                    onBlur={() => setGtinError('')}
                                    error={!!gtinError}
                                    helperText={gtinError}
                                />
                            </Grid>

                        </FiltersForm>
                    )
                }
            </Box>

            <Box>
                <>
                    {
                        productsListIsLoading && (
                            <Box mt={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CircularProgress />
                            </Box>
                        )
                    }

                    {
                        !productsListIsLoading && productsList?.length > 0 && (
                            <DataTable
                                columns={columns}
                                rows={productsList}
                                customUniqueField='gtinCode'
                                paginationModel={paginationModel}
                                onPaginationPageChange={handlePaginationChange}
                                sortModel={sortModel}
                                onSortModelChange={handleSortModelChange}
                                handleRowAction={handleRowAction}
                                externalPageSizeOptions={ELEMENT_PER_PAGE}
                            />
                        )
                    }

                    {
                        !productsListIsLoading && productsList?.length === 0 && (
                            <Paper sx={{ my: 4, p: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2">{t('pages.products.noProducts')}</Typography>
                            </Paper>
                        )
                    }

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
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} mb={2} className={style.cursorPointer}>
                                <CloseIcon sx={{ color: '#5C6F82' }} onClick={() => setOpenDrawer(false)} />
                            </Box>
                            <Typography variant="h6" mb={2}>{selectedProduct?.productName}</Typography>
                            <Divider
                                color="#E3E7EB"
                                sx={{ mb: 2 }}
                            />
                            <Grid container spacing={2}>
                                <Typography sx={{ fontWeight: theme.typography.fontWeightBold, fontSize: '14px' }}>
                                    {t('pages.products.drawer.subTitle')}
                                </Typography>

                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.eprelCode')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.eprelCode ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.gtinCode')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.gtinCode ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.productCode')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.productCode ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.category')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.category ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.brand')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.brand ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.model')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.model ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" mb={1} sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.capacity')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.capacity || selectedProduct?.capacity !== '' ? selectedProduct?.capacity : MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" mb={1} sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.energyClass')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.energyClass ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }} pb={2}>
                                    <Typography variant="body2" mb={1} sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.products.drawer.productionCountry')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{selectedProduct?.countryOfProduction ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>


                            </Grid>
                        </Box>
                    </Drawer>
                </>
            </Box>
            <AlertComponent isOpen={errorAlert} error message={t('pages.products.errorAlert')} />
        </Box>
    );
};


export default Products;
