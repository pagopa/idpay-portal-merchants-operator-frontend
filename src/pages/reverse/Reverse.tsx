import { useTranslation } from 'react-i18next';
import {
  reverseTransactionApi,
  reverseInvoicedTransactionApi,
} from '../../services/merchantService';
import FileUploadAction from '../../components/FileUploadAction/FileUploadAction';
import styles from './reverse.module.css';
import ROUTES from '../../routes.ts';
import { generatePath, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';

function getContext(routesMap, defaultRoute, location) {
  if (location.state?.breadcrumbsProp) {
    const path = location.state.breadcrumbsProp.path;
    const context = routesMap[path];
    return {
      breadcrumbsProp: location.state.breadcrumbsProp,
      apiCall: context ? context.apiCall : reverseTransactionApi,
    };
  }

  if (location.state?.backTo && routesMap[location.state.backTo]) {
    const context = routesMap[location.state.backTo];
    return {
      breadcrumbsProp: context.breadcrumb,
      apiCall: context.apiCall,
    };
  }

  return {
    breadcrumbsProp: defaultRoute.breadcrumb,
    apiCall: defaultRoute.apiCall,
  };
}

const Reverse = () => {
  const { initiativeId } = useParams()
  const { t } = useTranslation();
  const location = useLocation();

  const routesKeys = useMemo(() => ({
    refundManagement: generatePath(ROUTES.REFUNDS_MANAGEMENT, { initiativeId: initiativeId }),
    buyManagement: generatePath(ROUTES.BUY_MANAGEMENT, { initiativeId: initiativeId })
  }), [initiativeId])

  const routesMap = useMemo(() => ({
    [routesKeys.refundManagement]: {
      breadcrumb: {
        label: t('routes.refundManagement'),
        path: routesKeys.refundManagement
      },
      apiCall: reverseInvoicedTransactionApi,
    },
    [routesKeys.buyManagement]: {
      breadcrumb: {
        label: t('routes.buyManagement'),
        path: routesKeys.buyManagement
      },
      apiCall: reverseTransactionApi,
    },
  }), [routesKeys, t])

  const { breadcrumbsProp, apiCall } = getContext(routesMap, routesMap[routesKeys.buyManagement], location);

  return (
    <FileUploadAction
      titleKey="pages.reverse.title"
      subtitleKey="pages.reverse.subtitle"
      i18nBlockKey="pages.reverse"
      apiCall={apiCall}
      successStateKey="reverseUploadSuccess"
      breadcrumbsLabelKey={t('routes.reverse')}
      breadcrumbsProp={breadcrumbsProp}
      manualLink={import.meta.env.VITE_MANUAL_LINK}
      styleClass={styles.uploadFileContainer}
      docNumberTitle={t('pages.reverse.creditNoteTitle')}
      docNumberInsert={t('pages.reverse.insertCreditNote')}
      docNumberLabel={t('pages.reverse.creditNoteLabel')}
    />
  );
};

export default Reverse;
