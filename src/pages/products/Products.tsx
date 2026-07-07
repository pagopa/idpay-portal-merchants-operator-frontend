import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getProductsList } from '../../services/merchantService';
import { FieldConfigDef, FilterConfigDef, GetProductsParams } from '../../utils/types';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { PaginationExtendedModel } from '../../utils/types';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useAutoResetBanner } from '../../hooks/useAutoResetBanner';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import { DynamicFilters } from '../../components/DynamicFilters/DynamicFilters';

const initialPagination = {
  page: 0,
  pageSize: import.meta.env.VITE_PAGINATION_SIZE,
  totalElements: 0,
}

const Products = () => {
  const { t, config } = useScopedTranslation();
  const filtersDef = config<Array<FilterConfigDef>>('pages.products.productsTable.filters')
  const fieldsDef = config<Array<FieldConfigDef>>('pages.products.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.products.productsTable.columns')

  const [productsList, setProductsList] = useState([]);
  const [productsListIsLoading, setProductsListIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filters, setFilters] = useState({});
  const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>(initialPagination);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);

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
      ...filters,
    });
  };

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      setSortModel(model);
      fetchProducts({
        sort: model[0].field + ',' + model[0].sort,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        ...filters,
      });
    }
  };

  const handleFiltersApplied = (filtersObj: typeof filters) => {
    setFilters(filtersObj);
    fetchProducts({
      ...filtersObj,
      page: 0,
      size: paginationModel.pageSize || 10,
      sort: sortModel?.length > 0 ? sortModel[0].field + ',' + sortModel[0].sort : '',
    });
  };

  const handleFiltersReset = () => {
    setFilters({});
    fetchProducts({});
  };

  useEffect(() => {
    fetchProducts({});
    setProductsListIsLoading(true);
  }, [fetchProducts]);

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
        <DynamicFilters
          filters={filters}
          filtersDef={filtersDef}
          onFiltersApply={handleFiltersApplied}
          onFiltersReset={handleFiltersReset}
          />
      </Box>
      <Box>
        <DynamicTable
          emptyText={t('pages.products.noProducts')}
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
      </Box>
      <AlertComponent isOpen={errorAlert} error message={t('pages.products.errorAlert')} />
    </Box>
  );
};

export default Products;
