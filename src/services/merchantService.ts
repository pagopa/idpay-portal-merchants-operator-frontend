import { MerchantApi } from "../api/MerchantsApiClient";
import type {
  PreviewPaymentDTO,
  AuthPaymentResponseDTO,
  TransactionBarCodeResponse,
  ProductListDTO,
} from "../api/generated/data-contracts";
import { GetProductsParams } from "../utils/types";

export const getProductsList = async (
  params: GetProductsParams,
): Promise<ProductListDTO> => {
  const response = await MerchantApi.getProducts(
    params as Parameters<typeof MerchantApi.getProducts>[0],
  );

  return response;
};

export const previewPayment = async (params: {
  productGtin: string;
  productName: string;
  amountCents: number;
  discountCode: string;
}): Promise<PreviewPaymentDTO> => {
  return MerchantApi.previewPayment(params);
};

export const authPaymentBarCode = async (params: {
  trxCode: string;
  amountCents: number;
  additionalProperties?: Record<string, string>;
}): Promise<AuthPaymentResponseDTO> => {
  const idTrxAcquirer = crypto.randomUUID();

  return MerchantApi.authPaymentBarCode({
    trxCode: params.trxCode,
    amountCents: params.amountCents,
    idTrxAcquirer,
    additionalProperties: params.additionalProperties ?? {},
  });
};

export const capturePayment = async (params: {
  trxCode: string;
}): Promise<TransactionBarCodeResponse> => {
  return MerchantApi.capturePayment(params);
};

export const deleteTransactionInProgress = async (
  trxId: string,
): Promise<void> => {
  return MerchantApi.deleteTransactionInProgress(trxId);
};

export const getProcessedTransactions = async (
  initiativeId: string,
  pointOfSaleId: string,
  params?: Parameters<typeof MerchantApi.getProcessedTransactions>[2],
) => {
  return MerchantApi.getProcessedTransactions(
    initiativeId,
    pointOfSaleId,
    params,
  );
};

export const getInProgressTransactions = async (
  initiativeId: string,
  pointOfSaleId: string,
  params?: Parameters<typeof MerchantApi.getInProgressTransactions>[2],
) => {
  return MerchantApi.getInProgressTransactions(
    initiativeId,
    pointOfSaleId,
    params,
  );
};

export const getPointOfSaleDetails = async (
  merchantId: string,
  pointOfSaleId: string,
) => {
  return MerchantApi.getPointOfSaleDetails(
    merchantId,
    pointOfSaleId,
  );
};

export const downloadInvoiceFileApi = async (
  pointOfSaleId: string,
  trxId: string,
) => {
  return MerchantApi.downloadInvoiceFileApi(pointOfSaleId, trxId);
};

export const reverseTransactionApi = async (
  trxId: string,
  file: File,
  docNumber: string,
): Promise<void> => {
  return MerchantApi.reverseTransactionApi(trxId, file, docNumber);
};

export const reverseInvoicedTransactionApi = async (
  trxId: string,
  file: File,
  docNumber: string,
): Promise<void> => {
  return MerchantApi.reverseInvoicedTransactionApi(
    trxId,
    file,
    docNumber,
  );
};

export const invoiceTransactionApi = async (
  trxId: string,
  file: File,
  docNumber: string,
): Promise<void> => {
  return MerchantApi.invoiceTransactionApi(trxId, file, docNumber);
};

export const updateInvoiceTransactionApi = async (
  trxId: string,
  file: File,
  docNumber: string,
): Promise<void> => {
  return MerchantApi.updateInvoiceTransactionApi(
    trxId,
    file,
    docNumber,
  );
};

export const getPreviewPdf = async (
  trxId: string,
): Promise<{ data: string }> => {
  const report = await MerchantApi.getPreviewPdf(trxId);

  const file = report?.data;
  if (!file) {
    return { data: "" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      "",
    ),
  );

  return { data: base64 };
};
