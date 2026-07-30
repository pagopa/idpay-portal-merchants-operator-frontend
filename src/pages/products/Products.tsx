import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { ELEMENT_PER_PAGE } from '../../utils/constants';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getInitiativeProductsList } from '../../services/merchantService';
import { FieldConfigDef, FilterConfigDef, GetProductsParams } from '../../utils/types';
import { GridSortModel } from '@mui/x-data-grid';
import AlertComponent from '../../components/Alert/AlertComponent';
import { useAutoResetBanner } from '../../hooks/useAutoResetBanner';
import DynamicDrawer from '../../components/DynamicDrawer/DynamicDrawer';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { DynamicTable } from '../../components/DynamicTable/DynamicTable';
import { DynamicFilters } from '../../components/DynamicFilters/DynamicFilters';
import { theme } from '@pagopa/mui-italia';
import { useParams } from 'react-router-dom';
import { plainObj } from '../../utils/helpers';

const initialPageSize = parseInt(import.meta.env.VITE_PAGINATION_SIZE, 10)

const initialPagination = {
  page: 0,
  pageSize: isNaN(initialPageSize) ? 10 : initialPageSize
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
  const [page, setPage] = useState(initialPagination.page)
  const [pageSize, setPageSize] = useState(initialPagination.pageSize)
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [totalElements, setTotalElements] = useState(0)

  const [openDrawer, setOpenDrawer] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);

  useAutoResetBanner([[errorAlert, setErrorAlert]]);

  const mappedProductsList = useMemo(() =>
    productsList.map((product) => {
      const plainedProduct = plainObj(product)
      return {
        ...plainedProduct,
        link: plainedProduct?.linkEprel,
        action: {
          icon: "arrow",
          onClick: (row) => {
            setOpenDrawer(true);
            setSelectedProduct(row)
          }
        }
      }
    }),
    [productsList])

  const fetchProducts = useCallback(async (params: GetProductsParams) => {
    setProductsListIsLoading(true);
    try {
      const { content, totalElements } = await getInitiativeProductsList(initiativeId, {
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
  }, [initiativeId]);

  useEffect(() => {
    const [model] = sortModel
    const params = {
      size: pageSize,
      page,
      ...filters,
      ...(sortModel.length ? { sort: `${model?.field},${model?.sort}` } : {}),
    }
    fetchProducts(params);
  }, [fetchProducts, filters, page, pageSize, sortModel]);

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
          containerStyle={{ paddingY: "2rem" }}
          filters={filters}
          filtersDef={filtersDef}
          setFilters={newFilters => {
            setPage(0)
            setFilters(newFilters);
          }}
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
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={model => {
            setPage(model.page)
            setPageSize(model.pageSize)
          }}
          rowCount={totalElements || 0}
          sortModel={sortModel}
          sortingMode='server'
          paginationMode="server"
          onSortModelChange={setSortModel}
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
