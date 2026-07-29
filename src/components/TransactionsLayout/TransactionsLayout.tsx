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

type TransactionsLayoutProps = {
  title: string;
  subtitle: string;
  tableProps: DynamicTableProps,
  drawerProps: DynamicDrawerProps,
  filtersProps: DynamicFiltersProps,
  tableTitle?: string;
  additionalButton?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  alerts: Array<[boolean, (value: boolean) => void]>;
  genericErrorState: [boolean, (value: boolean) => void];
  alertMessages?: {
    error?: string;
    [key: string]: string | undefined;
  };
  isAlertVisible?: boolean
  externalState?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

const TransactionsLayout: React.FC<TransactionsLayoutProps> = ({
  title,
  subtitle,
  tableProps,
  drawerProps,
  filtersProps,
  tableTitle,
  additionalButton,
  alerts,
  alertMessages,
  genericErrorState,
  isAlertVisible,
  externalState = {},
}) => {
  const { t } = useScopedTranslation()
  const [genericError] = genericErrorState;
  const allAlerts = [genericErrorState, ...alerts];
  const alertsList = Object.entries(externalState)
    .filter(([key]) => !key.includes('error'))
    .map(([key, value]) => ({ isOpen: value, message: alertMessages[key] }));

  useAutoResetBanner(allAlerts);

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
        {(!!tableProps?.rows?.length || !!Object.keys(filtersProps?.filters)?.length) && <DynamicFilters {...filtersProps} />}
        <Box marginTop="1rem">
          <DynamicTable {...tableProps} />
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
