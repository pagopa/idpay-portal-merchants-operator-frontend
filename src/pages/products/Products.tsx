import { Box, CircularProgress, Typography, Paper, Grid, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, useCallback } from "react";
import DataTable from "../../components/DataTable/DataTable";
import { getProductsList } from "../../services/merchantService";
import { GetProductsParams } from "../../utils/types";
import { SortModel } from "../../utils/types";
import { PaginationModel } from "../../utils/types";



const Products = () => {
    const [productsList, setProductsList] = useState([]);
    const [productsListIsLoading, setProductsListIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        pageNo: 0,
        pageSize: 10,
        totalElements: 0
    });
    const [sortModel, setSortModel] = useState<SortModel>([]);
    const { t } = useTranslation();

    const initialValues = {
        category: '',
        brand: '',
        model: '',
        eprelCode: '',
        gtinCode: ''
    };
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
            flex: 1.5,
            disableColumnMenu: true,
            align: 'center',
            sortable: true,
            renderCell: (params: any) => {
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
            field: 'brand',
            headerName: 'Marca',
            flex: 1,
            disableColumnMenu: true,
            sortable: true,
            renderCell: (params: any) => {
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
            field: 'model',
            headerName: 'Modello',
            flex: 1,
            disableColumnMenu: true,
            sortable: true,
            renderCell: (params: any) => {
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
            field: 'gtinCode',
            headerName: 'Codice GTIN',
            flex: 1,
            disableColumnMenu: true,
            sortable: true,
            renderCell: (params: any) => {
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
            field: 'eprelCode',
            headerName: 'Codice EPREL',
            flex: 1,
            disableColumnMenu: true,
            sortable: true,
            renderCell: (params: any) => {
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
    ];

    useEffect(() => {
        fetchProducts({});
        setProductsListIsLoading(true);
    }, []);

    const fetchProducts = useCallback(async (params: GetProductsParams) => {
        try {
            const { content, pageNo, pageSize, totalElements } = await getProductsList({ size: 10, status: 'APPROVED', ...params });
            setProductsList([...content]);
            setPaginationModel({
                pageNo: pageNo || 0,
                pageSize: pageSize || 10,
                totalElements: totalElements || 0
            });
            setProductsListIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsListIsLoading(false);
        }
    }, []);

    const handlePaginationChange = useCallback((newPaginationModel: PaginationModel) => {

        if (newPaginationModel.pageNo === paginationModel.pageNo &&
            newPaginationModel.pageSize === paginationModel.pageSize) {
            return;
        }

        fetchProducts({
            page: newPaginationModel.pageNo,
            size: newPaginationModel.pageSize,
            sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
        });
    }, [fetchProducts, paginationModel.pageNo, paginationModel.pageSize, sortModel]);

    const handleSortModelChange = (model: SortModel) => {
        if (model.length > 0) {
            setSortModel(model);
            const filteredValues = filterFormikValues(formik.values);
            fetchProducts({
                sort: model[0].field + ',' + model[0].sort,
                page: paginationModel.pageNo,
                size: paginationModel.pageSize,
                ...filteredValues
            });
        }
    }

    const filterFormikValues = (values: GetProductsParams) => {
        const filteredValues = {};
        for (const key in values) {
            const value = values[key];
            if (value !== null && value !== undefined && value !== '') {
                filteredValues[key] = value;
            }
        }
        return filteredValues;
    };

    return (
        <Box>
            <TitleBox
                title={t('pages.products.title')}
                variantTitle="h4"
                subTitle={t('pages.products.subtitle')}
                variantSubTitle='body2'
                mbTitle={2}
                mtTitle={0}
                mbSubTitle={2}
            />

            <Box>
                {
                    productsList && productsList?.length > 0 && (
                        <FiltersForm
                            formik={formik}
                            onFiltersApplied={() => { }}
                            onFiltersReset={() => { }}
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
                                        <MenuItem value="WASHINGMACHINES">
                                            Lavatrici
                                        </MenuItem>
                                        <MenuItem value="TUMBLEDRYERS">
                                            Asciugatrici
                                        </MenuItem>
                                        <MenuItem value="OVENS">
                                            Forni
                                        </MenuItem>
                                        <MenuItem value="DISHWASHERS">
                                            Lavastoviglie
                                        </MenuItem>
                                        <MenuItem value="WASHERDRYERS">
                                            Lavasciuga
                                        </MenuItem>
                                        <MenuItem value="REFRIGERATINGAPPL">
                                            Frigoriferi e congelatori
                                        </MenuItem>
                                        <MenuItem value="RANGEHOODS">
                                            Cappe da cucina
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
                                    onChange={formik.handleChange}
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
                </>
            </Box>
        </Box>
    );
};


export default Products;
