import { MerchantApi } from '../api/MerchantsApiClient';
import type {
  PreviewPaymentDTO,
  AuthPaymentResponseDTO,
  TransactionBarCodeResponse,
  ProductListDTO,
} from '../api/generated/data-contracts';
import { GetProductsParams } from '../utils/types';

export const getInitiativeProductsList = async (initiativeId: string, params: GetProductsParams): Promise<ProductListDTO> => {
  const response = await MerchantApi.getInitiativeProducts(initiativeId,
    params as Parameters<typeof MerchantApi.getInitiativeProducts>[1]
  );

  return response;
};

export const previewPayment = async (initiativeId: string,
  params: {
    productGtin: string;
    productName: string;
    amountCents: number;
    discountCode: string;
  }): Promise<PreviewPaymentDTO> => {
  return MerchantApi.previewPayment(initiativeId, params);
};

export const authPaymentBarCode = async (initiativeId: string,
  params: {
    trxCode: string;
    amountCents: number;
    additionalProperties?: Record<string, string>;
  }): Promise<AuthPaymentResponseDTO> => {
  const idTrxAcquirer = crypto.randomUUID();

  return MerchantApi.authPaymentBarCode(initiativeId, {
    trxCode: params.trxCode,
    amountCents: params.amountCents,
    idTrxAcquirer,
    additionalProperties: params.additionalProperties ?? {},
  });
};

export const capturePayment = async (initiativeId: string,
  params: {
    trxCode: string;
  }): Promise<TransactionBarCodeResponse> => {
  return MerchantApi.capturePayment(initiativeId, params);
};

export const deleteTransactionInProgress = async (initiativeId: string, trxId: string): Promise<void> => {
  return MerchantApi.deleteTransactionInProgress(initiativeId, trxId);
};

export const getProcessedTransactions = async (
  initiativeId: string,
  pointOfSaleId: string,
  params?: Parameters<typeof MerchantApi.getProcessedTransactions>[2]
) => {
  return MerchantApi.getProcessedTransactions(initiativeId, pointOfSaleId, params);
};

export const getInProgressTransactions = async (
  initiativeId: string,
  pointOfSaleId: string,
  params?: Parameters<typeof MerchantApi.getInProgressTransactions>[2]
) => {
  return MerchantApi.getInProgressTransactions(initiativeId, pointOfSaleId, params);
};

export const getPointOfSaleDetails = async (merchantId: string, pointOfSaleId: string) => {
  return MerchantApi.getPointOfSaleDetails(merchantId, pointOfSaleId);
};

export const downloadInvoiceFileApi = async (initiativeId: string, pointOfSaleId: string, trxId: string) => {
  return MerchantApi.downloadInvoiceFileApi(initiativeId, pointOfSaleId, trxId);
};

export const reverseTransactionApi = async (
  initiativeId: string,
  trxId: string,
  file: File,
  docNumber: string
): Promise<void> => {
  return MerchantApi.reverseTransactionApi(initiativeId, trxId, file, docNumber);
};

export const reverseInvoicedTransactionApi = async (
  initiativeId: string,
  trxId: string,
  file: File,
  docNumber: string
): Promise<void> => {
  return MerchantApi.reverseInvoicedTransactionApi(initiativeId, trxId, file, docNumber);
};

export const invoiceTransactionApi = async (
  initiativeId: string,
  trxId: string,
  file: File,
  docNumber: string
): Promise<void> => {
  return MerchantApi.invoiceTransactionApi(initiativeId, trxId, file, docNumber);
};

export const updateInvoiceTransactionApi = async (
  initiativeId: string,
  trxId: string,
  file: File,
  docNumber: string
): Promise<void> => {
  return MerchantApi.updateInvoiceTransactionApi(initiativeId, trxId, file, docNumber);
};

export const getPreviewPdf = async (initiativeId: string, trxId: string): Promise<{ data: string }> => {
  const report = await MerchantApi.getPreviewPdf(initiativeId, trxId);
  const rawData = (report as unknown as { data?: unknown })?.data;

  if (!rawData) {
    return { data: '' };
  }

  if (typeof rawData === 'string') {
    return { data: rawData };
  }

  if (
    rawData instanceof Blob ||
    (typeof rawData === 'object' &&
      'arrayBuffer' in rawData &&
      typeof (
        rawData as {
          arrayBuffer?: unknown;
        }
      ).arrayBuffer === 'function')
  ) {
    const arrayBuffer =
      rawData instanceof Blob
        ? await rawData.arrayBuffer()
        : await (rawData as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer();

    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return { data: base64 };
  }

  return { data: '' };
};

export const getInitiativesList = async () => await MerchantApi.getInitiativesList()
