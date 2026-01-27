import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import {
  getProcessedTransactions,
  downloadInvoiceFileApi,
} from "../../services/merchantService";
import { GridRenderCellParams } from "@mui/x-data-grid";
import {
  getStatusChip,
  formatEuro,
  renderCellWithTooltip,
  renderMissingDataWithTooltip,
  checkEuroTooltip,
  checkTooltipValue,
} from "../../utils/helpers";
import { DetailsDrawer } from "../../components/DetailsDrawer/DetailsDrawer";
import { useLocation, useNavigate } from "react-router-dom";
import ROUTES from "../../routes";
import { PointOfSaleTransactionProcessedDTO } from "../../api/generated/merchants/PointOfSaleTransactionProcessedDTO";
import TransactionsLayout from "../../components/TransactionsLayout/TransactionsLayout";
import { authStore } from "../../store/authStore";
import { DecodedJwtToken } from "../../utils/types";
import { jwtDecode } from "jwt-decode";

const RefundManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PointOfSaleTransactionProcessedDTO>({});
  const [errorDownloadAlert, setErrorDownloadAlert] = useState(false);
  const [transactionReverseSuccess, setTransactionReverseSuccess] =
    useState(false);
  const [transactionRefundSuccess, setTransactionRefundSuccess] =
    useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [status, setStatus] = useState<
    "INVOICED" | "REWARDED" | "REFUNDED" | "CANCELLED"
  >();
  const { t } = useTranslation();
  const location = useLocation();
  const token = authStore.getState().token;
  const navigate = useNavigate();

  const handleReverseTransaction = () => {
    navigate("/storna-transazione/" + selectedTransaction?.id, {
      state: { backTo: ROUTES.REFUNDS_MANAGEMENT },
    });
  };

  useEffect(() => {
    if (location.state) {
      const { refundUploadSuccess, reverseUploadSuccess } = location.state;
      if (refundUploadSuccess) {
        setTransactionRefundSuccess(true);
      } else if (reverseUploadSuccess) {
        setTransactionReverseSuccess(true);
      }
    }
  }, [location.state]);

  const handleRowAction = useCallback(
    (transaction) => {
      setStatus(transaction?.status);
      setIsOpen(true);
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

      const mappedTransaction = {
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
        [t("pages.refundManagement.drawer.fiscalCode")]:
          transaction?.fiscalCode,
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
      setSelectedTransaction(mappedTransaction);
    },
    [t],
  );

  const downloadInvoiceFile = async () => {
    const decodeToken: DecodedJwtToken = jwtDecode(token);
    setDownloadInProgress(true);
    try {
      const response = await downloadInvoiceFileApi(
        decodeToken?.point_of_sale_id,
        selectedTransaction?.id,
      );
      const { invoiceUrl } = response;

      const filename =
        selectedTransaction?.invoiceFile?.filename || "fattura.pdf";

      const link = document.createElement("a");
      link.href = invoiceUrl;
      link.download = filename;
      link.click();
      setDownloadInProgress(false);
    } catch (error) {
      console.error("Errore download file:", error);
      setErrorDownloadAlert(true);
      setDownloadInProgress(false);
    }
  };

  const columns = [
    {
      field: "additionalProperties",
      headerName: "Elettrodomestico",
      flex: 2.5,
      disableColumnMenu: true,
      align: "center",
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        return checkTooltipValue(params, "productName");
      },
    },
    {
      field: "trxChargeDate",
      headerName: "Data e ora",
      flex: 1.5,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => {
        if (params.value) {
          const formattedDate = new Date(params.value)
            .toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            .replace(",", "");
          return renderCellWithTooltip(formattedDate);
        }
        return renderMissingDataWithTooltip();
      },
    },
    {
      field: "fiscalCode",
      headerName: "Beneficiario",
      flex: 1.2,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return checkTooltipValue(params);
      },
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
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
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
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
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
      renderCell: (params: GridRenderCellParams) => {
        return checkEuroTooltip(params);
      },
    },
    {
      field: "status",
      headerName: "Stato",
      flex: 1.5,
      disableColumnMenu: true,
      sortable: true,
      alignVertical: "center",
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            {getStatusChip(t, params.value)}
          </Box>
        );
      },
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
      noDataMessage={t("pages.refundManagement.noTransactions")}
      onRowAction={handleRowAction}
      DrawerComponent={
        <DetailsDrawer
          isLoading={downloadInProgress}
          setIsOpen={() => setIsOpen(false)}
          isOpen={isOpen}
          title={t("pages.refundManagement.drawer.title")}
          item={selectedTransaction}
          invoiceStatus={status}
          primaryButton={{
            label: "Modifica documento",
            onClick: async () => {
              navigate(
                `/modifica-documento/${selectedTransaction?.id}/${btoa(
                  selectedTransaction["Numero fattura"],
                )}`,
              );
            },
            disabled: selectedTransaction?.rewardBatchTrxStatus === "APPROVED",
          }}
          secondaryButton={
            status === "INVOICED" || status === "REWARDED"
              ? {
                  label: t("pages.refundManagement.drawer.refund"),
                  onClick: handleReverseTransaction,
                }
              : undefined
          }
          onFileDownloadCallback={downloadInvoiceFile}
        />
      }
      externalState={{
        transactionRefundSuccess,
        transactionReverseSuccess,
        errorDownloadAlert,
      }}
      isDrawerOpen={isOpen}
    />
  );
};

export default RefundManagement;
