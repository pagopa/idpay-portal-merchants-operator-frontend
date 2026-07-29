import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import AlertComponent from '../Alert/AlertComponent';
import AlertListComponent from '../Alert/AlertListComponent';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { useAutoResetBanner } from '../../hooks/useAutoResetBanner';
import { DynamicTable, DynamicTableProps } from '../DynamicTable/DynamicTable';
import { DynamicFilters, DynamicFiltersProps } from '../DynamicFilters/DynamicFilters';
import DynamicDrawer, { DynamicDrawerProps } from '../DynamicDrawer/DynamicDrawer';
import { useCallback, useEffect, useState } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { DecodedJwtToken } from '../../utils/types';
import { authStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';
import { PointOfSaleTransactionsListDTO, PointOfSaleTransactionsProcessedListDTO } from '../../api/generated/data-contracts';

type TransactionsLayoutProps = {
  initiativeId: string,
  title: string
  subtitle: string
  tableProps: DynamicTableProps
  drawerProps: DynamicDrawerProps
  filtersProps: DynamicFiltersProps
  transactionsApi: (initiativeId: string, trxId: string, params: unknown) => Promise<PointOfSaleTransactionsListDTO | PointOfSaleTransactionsProcessedListDTO>
  setTransactionsList: (content) => void
  tableTitle?: string
  additionalButton?: {
    label: string
    icon: React.ReactNode
    onClick: () => void
  };
  alerts: Array<[boolean, (value: boolean) => void]>
  alertMessages?: {
    error?: string
    [key: string]: string | undefined
  }
  isAlertVisible?: boolean
  externalState?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  };
}

const initialPageSize = parseInt(import.meta.env.VITE_PAGINATION_SIZE, 10)

const initialPagination = {
  page: 0,
  pageSize: isNaN(initialPageSize) ? 10 : initialPageSize
}

const TransactionsLayout: React.FC<TransactionsLayoutProps> = ({
  initiativeId,
  title,
  subtitle,
  transactionsApi,
  setTransactionsList,
  tableProps,
  drawerProps,
  filtersProps,
  tableTitle,
  additionalButton,
  alerts,
  alertMessages,
  isAlertVisible,
  externalState = {},
}) => {
  const { t } = useScopedTranslation()
  const [page, setPage] = useState(initialPagination.page)
  const [pageSize, setPageSize] = useState(initialPagination.pageSize)
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "trxChargeDate", sort: "desc" }]);
  const [totalElements, setTotalElements] = useState(0)
  const [transactionsListIsLoading, setTransactionsListIsLoading] = useState(true);
  const [genericError, setGenericError] = useState(false);
  const allAlerts = [[genericError, setGenericError], ...alerts];
  const alertsList = Object.entries(externalState)
    .filter(([key]) => !key.includes('error'))
    .map(([key, value]) => ({ isOpen: value, message: alertMessages[key] }));

  useAutoResetBanner(allAlerts);

  const setFilters = useCallback((filters) => {
    setPage(0)
    filtersProps?.setFilters(filters)
  }, [filtersProps])

  const fetchTransactions = useCallback(async (params) => {
    const token = authStore.getState().token;
    const decodeToken: DecodedJwtToken = jwtDecode(token)
    setTransactionsListIsLoading(true);
    try {
      const { content, totalElements } = await transactionsApi(initiativeId, decodeToken?.point_of_sale_id, params);
      setTransactionsList(content);
      setTotalElements(totalElements)
    } catch {
      setGenericError(true)
    } finally {
      setTransactionsListIsLoading(false)
    }
  }, [initiativeId, setTransactionsList, transactionsApi]);

  useEffect(() => {
    const [model] = sortModel
    const params = {
      size: pageSize,
      page,
      ...filtersProps?.filters,
      ...(sortModel.length ? { sort: `${model?.field},${model?.sort}` } : {}),
    }
    fetchTransactions(params);
  }, [fetchTransactions, filtersProps?.filters, page, pageSize, sortModel]);

  return (
    <Box>
      <Box mt={2} mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <TitleBox
          title={title}
          variantTitle="h4"
          subTitle={subtitle}
          variantSubTitle="body2"
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
      <Typography variant="h6" paddingBottom="0.5rem">{tableTitle}</Typography>

      <Box>
        {(!!tableProps?.rows?.length || !!Object.keys(filtersProps?.filters)?.length) && <DynamicFilters {...filtersProps} setFilters={setFilters} />}
        <Box marginTop="1rem">
          <DynamicTable {...tableProps}
            getRowId={row => row.id}
            sortingMode='server'
            paginationMode="server"
            sortModel={sortModel}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={model => {
              setPage(model.page)
              setPageSize(model.pageSize)
            }}
            onSortModelChange={setSortModel}
            rowCount={totalElements || 0}
            isLoading={transactionsListIsLoading}
          />
        </Box>
        <DynamicDrawer {...drawerProps} />
      </Box>
      {/* Alerts */}
      {Object.entries(externalState)
        .filter(([key]) => key.includes('error'))
        .map(
          ([key, value]) =>
            alertMessages[key] && (
              <AlertComponent
                containerStyle={{
                  height: 'fit-content',
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  zIndex: '1300',
                }}
                contentStyle={{ position: 'unset', bottom: '0', right: '0' }}
                isOpen={value && isAlertVisible}
                key={key}
                error
                message={alertMessages[key]}
              />
            )
        )}
      <AlertListComponent
        alertList={[
          ...alertsList,
          {
            isOpen: genericError,
            error: true,
            message: alertMessages.error || t('pages.refundManagement.errorAlert'),
          },
        ]}
      />
    </Box>
  );
};

export default TransactionsLayout;
