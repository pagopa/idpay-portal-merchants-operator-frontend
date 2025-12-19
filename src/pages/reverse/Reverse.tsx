import { useTranslation } from "react-i18next";
import {
  reverseTransactionApi,
  reverseInvoicedTransactionApi,
} from "../../services/merchantService";
import FileUploadAction from "../../components/FileUploadAction/FileUploadAction";
import styles from "./reverse.module.css";
import ROUTES from "../../routes.ts";
import { useLocation } from "react-router-dom";

const CONTEXTS = {
  [ROUTES.REFUNDS_MANAGEMENT]: {
    breadcrumb: (t) => ({
      label: t("routes.refundManagement"),
      path: ROUTES.REFUNDS_MANAGEMENT,
    }),
    apiCall: reverseInvoicedTransactionApi,
  },
  [ROUTES.BUY_MANAGEMENT]: {
    breadcrumb: (t) => ({
      label: t("routes.buyManagement"),
      path: ROUTES.BUY_MANAGEMENT,
    }),
    apiCall: reverseTransactionApi,
  },
};

function getContext(location, t) {
  if (location.state?.breadcrumbsProp) {
    const path = location.state.breadcrumbsProp.path;
    const context = CONTEXTS[path];
    return {
      breadcrumbsProp: location.state.breadcrumbsProp,
      apiCall: context ? context.apiCall : reverseTransactionApi,
    };
  }

  if (location.state?.backTo && CONTEXTS[location.state.backTo]) {
    const context = CONTEXTS[location.state.backTo];
    return {
      breadcrumbsProp: context.breadcrumb(t),
      apiCall: context.apiCall,
    };
  }

  const context = CONTEXTS[ROUTES.BUY_MANAGEMENT];
  return {
    breadcrumbsProp: context.breadcrumb(t),
    apiCall: context.apiCall,
  };
}

const Reverse = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const { breadcrumbsProp, apiCall } = getContext(location, t);

  return (
    <FileUploadAction
      titleKey="pages.reverse.title"
      subtitleKey="pages.reverse.subtitle"
      i18nBlockKey="pages.reverse"
      apiCall={apiCall}
      successStateKey="reverseUploadSuccess"
      breadcrumbsLabelKey={t("routes.reverse")}
      breadcrumbsProp={breadcrumbsProp}
      manualLink={import.meta.env.VITE_MANUAL_LINK}
      styleClass={styles.uploadFileContainer}
      docNumberTitle={t("pages.reverse.creditNoteTitle")}
      docNumberInsert={t("pages.reverse.insertCreditNote")}
      docNumberLabel={t("pages.reverse.creditNoteLabel")}
    />
  );
};

export default Reverse;
