import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { TitleBox } from "@pagopa/selfcare-common-frontend/lib";
import { useTranslation } from "react-i18next";
import FiltersForm from "../../components/FiltersForm/FiltersForm";
import { useFormik } from "formik";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, useCallback } from "react";
import DataTable from "../../components/DataTable/DataTable";
import { getProductsList } from "../../services/merchantService";



const Products = () => {
    const [productsList, setProductsList] = useState([]);
    const [productsListIsLoading, setProductsListIsLoading] = useState(false);
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
        fetchProducts();
        setProductsListIsLoading(true);
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const { content } = await getProductsList({ size: 50, status: 'APPROVED' });
            setProductsList([...content]);
            setProductsListIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsListIsLoading(false);
        }
    }, []);

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
                        />
                    )
                }
            </Box>

            <Box>
                <>
                    {
                        productsListIsLoading && (
                            <CircularProgress />
                        )
                    }

                    {
                        !productsListIsLoading && productsList?.length > 0 && (
                            <DataTable
                                columns={columns}
                                rows={productsList}
                                customUniqueField='gtinCode'
                            // paginationModel={paginationModel}
                            // onPaginationModelChange={setPaginationModel}
                            // sortModel={sortModel}
                            // onSortModelChange={setSortModel}
                            />
                        )
                    }

                    {
                        !productsListIsLoading && productsList?.length === 0 && (
                            <Paper sx={{ my: 4, p: 3, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2">{t('pages.refundManagement.noTransactions')}</Typography>
                            </Paper>
                        )
                    }
                </>
            </Box>
        </Box>
    );
};


export default Products;
