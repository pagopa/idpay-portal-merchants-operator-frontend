import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import FiltersForm from '../../components/FiltersForm/FiltersForm';
import { useFormik } from 'formik';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getProductsList } from '../../services/merchantService';
import { FieldConfigDef, GetProductsParams } from '../../utils/types';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { PaginationExtendedModel } from '../../utils/types';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useAutoResetBanner } from '../../hooks/useAutoResetBanner';
import { handleCodeChange } from '../../utils/helpers';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';

const initialValues = {
  category: '',
  brand: '',
  model: '',
  eprelCode: '',
  gtinCode: '',
};

const initialPagination = {
  page: 0,
  pageSize: import.meta.env.VITE_PAGINATION_SIZE,
  totalElements: 0,
}

const Products = () => {
  const [gtinError, setGtinError] = useState<string>('');
  const [productsList, setProductsList] = useState([]);
  const [productsListIsLoading, setProductsListIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>(initialPagination);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialValues);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const { t, config } = useScopedTranslation();
  const fieldsDef = config<Array<FieldConfigDef>>('pages.products.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.products.productsTable.columns')
  useAutoResetBanner([[errorAlert, setErrorAlert]]);
  const mappedProductsList = useMemo(() =>
    productsList.map((product) =>
    ({
      ...product, action: {
        icon: "arrow",
        onClick: (row) => {
          setOpenDrawer(true);
          setSelectedProduct(row)
        }
      }
    })),
    [productsList])

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      handleFiltersApplied(values);
    },
  });

  useEffect(() => {
    fetchProducts({});
    setProductsListIsLoading(true);
  }, []);

  const fetchProducts = useCallback(async (params: GetProductsParams) => {
    setProductsListIsLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_ /* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) =>
            value !== undefined && value !== '' && value !== null
        )
      );
      const { content, pageNo, pageSize, totalElements } = await getProductsList({
        size: import.meta.env.VITE_PAGINATION_SIZE,
        status: 'APPROVED',
        ...cleanParams,
      });
      setProductsList([...content]);
      setPaginationModel({
        page: pageNo || 0,
        pageSize: pageSize || 10,
        totalElements: totalElements || 0,
      });
      setProductsListIsLoading(false);
    } catch {
      setProductsListIsLoading(false);
      setErrorAlert(true);
    }
  }, []);

  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    if (
      newPaginationModel.page === paginationModel.page &&
      newPaginationModel.pageSize === paginationModel.pageSize
    ) {
      return;
    }

    fetchProducts({
      page: newPaginationModel.page,
      size: newPaginationModel.pageSize,
      sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
      ...appliedFilters,
    });
  };

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      setSortModel(model);
      fetchProducts({
        sort: model[0].field + ',' + model[0].sort,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        ...appliedFilters,
      });
    }
  };

  const handleFiltersApplied = (filtersObj: typeof initialValues) => {
    setFiltersAppliedOnce(true);
    setAppliedFilters(filtersObj);
    const queryParams = Object.keys(filtersObj).reduce((acc, key) => {
      const value = filtersObj[key];
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = String(value).trim();
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

  const areFiltersApplied = () => {
    return (
      formik.values.category.length > 0 ||
      formik.values.brand.length > 0 ||
      formik.values.model.length > 0 ||
      formik.values.eprelCode.length > 0 ||
      formik.values.gtinCode.length > 0
    );
  };

  return (
    <Box>
      <Box
        mt={2}
        mb={4}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'flex-start'}
      >
        <TitleBox
          title={t('pages.products.title')}
          variantTitle="h4"
          subTitle={t('pages.products.subtitle')}
          variantSubTitle="body2"
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
        {((productsList && productsList?.length > 0) ||
          (productsList.length === 0 &&
            (formik.values.category.length > 0 ||
              formik.values.brand.length > 0 ||
              formik.values.model.length > 0 ||
              formik.values.eprelCode.length > 0 ||
              formik.values.gtinCode.length > 0)) ||
          filtersAppliedOnce) && (
            <FiltersForm
              formik={formik}
              onFiltersApplied={formik.handleSubmit}
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
                    <MenuItem value="REFRIGERATINGAPPL">Apparecchi di refrigerazione</MenuItem>
                    <MenuItem value="TUMBLEDRYERS">Asciugatrici</MenuItem>
                    <MenuItem value="RANGEHOODS">Cappe da cucina</MenuItem>
                    <MenuItem value="OVENS">Forni</MenuItem>
                    <MenuItem value="WASHERDRIERS">Lavasciuga</MenuItem>
                    <MenuItem value="DISHWASHERS">Lavastoviglie</MenuItem>
                    <MenuItem value="WASHINGMACHINES">Lavatrici</MenuItem>
                    <MenuItem value="COOKINGHOBS">Piani cottura</MenuItem>
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
                  onChange={(e) => setGtinError(handleCodeChange(e, formik, 14, 'GTIN/EAN'))}
                  onBlur={() => setGtinError('')}
                  error={!!gtinError}
                  helperText={gtinError}
                />
              </Grid>
            </FiltersForm>
          )}
      </Box>

      <Box>
        <>
          <DynamicTable
            emptyText='pages.products.noProducts'
            columnsDef={columnsDef}
            isEmpty={!mappedProductsList?.length}
            isLoading={productsListIsLoading}
            rows={mappedProductsList}
            getRowId={row => row.gtinCode}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            pageSizeOptions={ELEMENT_PER_PAGE}
          />
          <DynamicDrawer
            setIsOpen={() => setOpenDrawer(false)}
            title={`${selectedProduct?.productName} - ${selectedProduct?.productCode}`}
            subtitle={t('pages.products.drawer.subtitle')}
            fieldsValues={selectedProduct}
            fieldsDef={fieldsDef}
            isOpen={openDrawer}
          />
        </>
      </Box>
      <AlertComponent isOpen={errorAlert} error message={t('pages.products.errorAlert')} />
    </Box>
  );
};

export default Products;
