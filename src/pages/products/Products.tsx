import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getInitiativeProductsList } from '../../services/merchantService';
import { FieldConfigDef, FilterConfigDef, GetProductsParams } from '../../utils/types';
import { GridSortModel } from '@mui/x-data-grid';
import { PaginationExtendedModel } from '../../utils/types';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useAutoResetBanner } from '../../hooks/useAutoResetBanner';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import { DynamicFilters } from '../../components/DynamicFilters/DynamicFilters';
import { theme } from '@pagopa/mui-italia';
import { useParams } from 'react-router-dom';

const initialPagination = {
  page: 0,
  pageSize: parseInt(import.meta.env.VITE_PAGINATION_SIZE)
}

const Products = () => {
  const { initiativeId } = useParams();
  const { t, config } = useScopedTranslation();
  const filtersDef = config<Array<FilterConfigDef>>('pages.products.productsTable.filters')
  const fieldsDef = config<Array<FieldConfigDef>>('pages.products.drawer')
  const columnsDef = config<Array<FieldConfigDef>>('pages.products.productsTable.columns')

  const [productsList, setProductsList] = useState([]);
  const [productsListIsLoading, setProductsListIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [paginationModel, setPaginationModel] = useState<PaginationExtendedModel>(initialPagination);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [totalElements, setTotalElements] = useState(0)

  const [openDrawer, setOpenDrawer] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);

  useAutoResetBanner([[errorAlert, setErrorAlert]]);

  const mappedProductsList = useMemo(() =>
    productsList.map((product) =>
    ({
      ...product,
      link: product?.linkEprel,
      action: {
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
      const { content, totalElements } = await getInitiativeProductsList(initiativeId, {
        size: paginationModel.pageSize,
        status: 'APPROVED',
        ...params,
      });
      setProductsList(content);
      setTotalElements(totalElements)
    } catch {
      setErrorAlert(true);
    } finally {
      setProductsListIsLoading(false)
    }
  }, [initiativeId, paginationModel.pageSize]);

  const handleFilters = (filtersObj: typeof filters) => {
    setFilters(filtersObj);
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  };

  useEffect(() => {
    const [model] = sortModel
    const {pageSize, ...paginationModelRest} = paginationModel
    const params = {
      size: pageSize,
      ...filters,
      ...paginationModelRest,
      ...(sortModel.length ? {sort: `${model?.field},${model?.sort}`} : {})
    }
    fetchProducts(params);
  }, [fetchProducts, filters, paginationModel, sortModel]);

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
          setFilters={handleFilters}
        />
      </Box>
      <Box marginTop="1rem">
        <DynamicTable
          emptyText={t('pages.products.noProducts')}
          columnsDef={columnsDef}
          isEmpty={!mappedProductsList?.length}
          isLoading={productsListIsLoading}
          rows={mappedProductsList}
          getRowId={row => row.gtinCode}
          paginationModel={paginationModel}
          onPaginationModelChange={newPaginationModel => setPaginationModel(prev => ({ ...prev, ...newPaginationModel }))}
          rowCount={totalElements || 0}
          sortModel={sortModel}
          onSortModelChange={model => setSortModel(model)}
          pageSizeOptions={ELEMENT_PER_PAGE}
          rowsDividerColor={theme.palette.divider}
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
