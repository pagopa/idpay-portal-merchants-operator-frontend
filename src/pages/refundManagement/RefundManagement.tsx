import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  getProcessedTransactions,
  downloadInvoiceFileApi,
} from "../../services/merchantService";
import {
  getStatusChip,
  formatEuro,
  renderCellWithTooltip,
  renderMissingDataWithTooltip,
  checkEuroTooltip,
  checkTooltipValue,
} from "../../utils/helpers";
import { DetailsDrawer } from "../../components/DetailsDrawer/DetailsDrawer";
import TransactionsLayout from "../../components/TransactionsLayout/TransactionsLayout";
import ROUTES from "../../routes";
import { authStore } from "../../store/authStore";
import { DecodedJwtToken } from "../../utils/types";
import { PointOfSaleTransactionProcessedDTO } from "../../api/generated/merchants/PointOfSaleTransactionProcessedDTO";

const formatDateTime = (value?: string) => {
  if (!value) {
    return renderMissingDataWithTooltip();
  }

  const formatted = new Date(value)
    .toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");

  return renderCellWithTooltip(formatted);
};

const mapTransactionToDrawerItem = (
  transaction: PointOfSaleTransactionProcessedDTO,
  t: (key: string) => string,
) => {
  const invoiceLabel =
    transaction?.status === "REFUNDED"
      ? "Nota di credito"
      : transaction?.status === "CANCELLED"
      ? "cancelled"
      : "Fattura";

  const docNumberLabel =
    transaction?.status === "REFUNDED"
      ? "Numero nota di credito"
      : transaction?.status === "CANCELLED"
      ? "cancelled"
      : "Numero fattura";

  return {
    [t("pages.refundManagement.drawer.trxDate")]: new Date(
      transaction?.trxChargeDate,
    )
      .toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", ""),
    [t("pages.refundManagement.drawer.householdAppliance")]:
      transaction?.additionalProperties?.productName,
    [t("pages.refundManagement.drawer.fiscalCode")]: transaction?.fiscalCode,
    [t("pages.refundManagement.drawer.transactionId")]: transaction?.id,
    [t("pages.refundManagement.drawer.trxCode")]: transaction?.trxCode,
    [t("pages.refundManagement.drawer.totalAmount")]:
      transaction?.effectiveAmountCents &&
      formatEuro(transaction?.effectiveAmountCents),
    [t("pages.refundManagement.drawer.rewardAmount")]:
      transaction?.rewardAmountCents &&
      formatEuro(transaction?.rewardAmountCents),
    [t("pages.refundManagement.drawer.authorizedAmount")]:
      transaction?.authorizedAmountCents &&
      formatEuro(transaction?.authorizedAmountCents),
    Stato: getStatusChip(t, transaction?.status),
    [docNumberLabel]: transaction?.invoiceFile?.docNumber,
    [invoiceLabel]: transaction?.invoiceFile?.filename,
    id: transaction?.id,
  };
};

const RefundManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const token = authStore.getState().token;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PointOfSaleTransactionProcessedDTO>({});
  const [invoiceStatus, setInvoiceStatus] = useState<
    "INVOICED" | "REWARDED" | "REFUNDED" | "CANCELLED"
  >();
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [isDisabledModDocButton, setIsDisabledModDocButton] = useState(false);

  const [errorDownloadAlert, setErrorDownloadAlert] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] =
    useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] =
    useState(false);

  useEffect(() => {
    if (!location.state) return;

    const { refundUploadSuccess, reverseUploadSuccess } = location.state;

    if (refundUploadSuccess) {
      setTransactionRefundSuccess(true);
    } else if (reverseUploadSuccess) {
      setTransactionReverseSuccess(true);
    }
  }, [location.state]);

  const handleRowAction = useCallback(
    (transaction: PointOfSaleTransactionProcessedDTO) => {
      setInvoiceStatus(transaction?.status);
      setIsDrawerOpen(true);
      setIsDisabledModDocButton(
        transaction?.rewardBatchTrxStatus === "APPROVED",
      );

      setSelectedTransaction(mapTransactionToDrawerItem(transaction, t));
    },
    [t],
  );

  const handleReverseTransaction = useCallback(() => {
    navigate(`/storna-transazione/${selectedTransaction?.id}`, {
      state: { backTo: ROUTES.REFUNDS_MANAGEMENT },
    });
  }, [navigate, selectedTransaction]);

  const handleDownloadInvoice = useCallback(async () => {
    const decodedToken: DecodedJwtToken = jwtDecode(token);

    setDownloadInProgress(true);
    try {
      const { invoiceUrl } = await downloadInvoiceFileApi(
        decodedToken?.point_of_sale_id,
        selectedTransaction?.id,
      );

      const filename =
        selectedTransaction?.invoiceFile?.filename || "fattura.pdf";

      const link = document.createElement("a");
      link.href = invoiceUrl;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error("Errore download file:", error);
      setErrorDownloadAlert(true);
    } finally {
      setDownloadInProgress(false);
    }
  }, [token, selectedTransaction]);

  const columns = [
    {
      field: "additionalProperties",
      headerName: "Elettrodomestico",
      flex: 2.5,
      disableColumnMenu: true,
      align: "center",
      sortable: true,
      renderCell: (params: GridRenderCellParams) =>
        checkTooltipValue(params, "productName"),
    },
    {
      field: "trxChargeDate",
      headerName: "Data e ora",
      flex: 1.5,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) =>
        formatDateTime(params.value),
    },
    {
      field: "fiscalCode",
      headerName: "Beneficiario",
      flex: 1.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => checkTooltipValue(params),
    },
    {
      field: "effectiveAmountCents",
      headerName: "Totale della spesa",
      flex: 1,
      type: "number",
      align: "center",
      headerAlign: "left",
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: "rewardAmountCents",
      headerName: "Sconto applicato",
      flex: 1,
      type: "number",
      align: "center",
      headerAlign: "left",
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: "authorizedAmountCents",
      headerName: "Importo autorizzato",
      flex: 1.4,
      type: "number",
      align: "center",
      headerAlign: "left",
      disableColumnMenu: true,
      sortable: false,
      renderCell: checkEuroTooltip,
    },
    {
      field: "status",
      headerName: "Stato",
      flex: 1.5,
      disableColumnMenu: true,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {getStatusChip(t, params.value)}
        </Box>
      ),
    },
  ];

  return (
    <TransactionsLayout
      title={t("pages.refundManagement.title")}
      subtitle={t("pages.refundManagement.subtitle")}
      tableTitle={t("pages.refundManagement.tableTitle")}
      fetchTransactionsApi={getProcessedTransactions}
      columns={columns}
      statusOptions={["REWARDED", "CANCELLED", "REFUNDED", "INVOICED"]}
      noDataMessage={t("pages.refundManagement.noTransactions")}
      onRowAction={handleRowAction}
      alerts={[
        [transactionReverseSuccess, setTransactionReverseSuccess],
        [transactionRefundSuccess, setTransactionRefundSuccess],
        [errorDownloadAlert, setErrorDownloadAlert],
      ]}
      alertMessages={{
        error: t("pages.refundManagement.errorAlert"),
        transactionRefundSuccess: t(
          "pages.refundManagement.refundSuccessUpload",
        ),
        transactionReverseSuccess: t(
          "pages.refundManagement.reverseSuccessUpload",
        ),
        errorDownloadAlert: t("pages.refundManagement.errorDownloadAlert"),
      }}
      DrawerComponent={
        <DetailsDrawer
          isOpen={isDrawerOpen}
          setIsOpen={() => setIsDrawerOpen(false)}
          isLoading={downloadInProgress}
          title={t("pages.refundManagement.drawer.title")}
          item={selectedTransaction}
          invoiceStatus={invoiceStatus}
          primaryButton={{
            label: "Modifica documento",
            disabled: isDisabledModDocButton,
            onClick: () =>
              navigate(
                `/modifica-documento/${selectedTransaction?.id}/${btoa(
                  selectedTransaction["Numero fattura"],
                )}`,
              ),
          }}
          secondaryButton={
            invoiceStatus === "INVOICED" || invoiceStatus === "REWARDED"
              ? {
                  label: t("pages.refundManagement.drawer.refund"),
                  onClick: handleReverseTransaction,
                }
              : undefined
          }
          onFileDownloadCallback={handleDownloadInvoice}
        />
      }
      externalState={{
        transactionRefundSuccess,
        transactionReverseSuccess,
        errorDownloadAlert,
      }}
      isDrawerOpen={isDrawerOpen}
    />
  );
};

export default RefundManagement;
