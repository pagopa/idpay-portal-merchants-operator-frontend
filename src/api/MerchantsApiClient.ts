import { Transactions } from './generated/Transactions';
import { Initiatives } from './generated/Initiatives';
import { MerchantId } from './generated/MerchantId';
import { PointOfSaleId } from './generated/PointOfSaleId';
import type {
  ProductListDTO,
  PreviewPaymentDTO,
  AuthPaymentResponseDTO,
  TransactionBarCodeResponse,
  ReportDTO,
  AuthBarCodePaymentDTO,
} from './generated/data-contracts';
import { createApiConfig, getAuthToken } from './BaseApiClient';
import { PointOfSales } from './generated/PointOfSales';

const transactionsApi = new Transactions<string>(createApiConfig());
const initiativesApi = new Initiatives<string>(createApiConfig());
const merchantIdApi = new MerchantId<string>(createApiConfig());
const pointOfSaleIdApi = new PointOfSaleId<string>(createApiConfig());
const pointOfSalesApi = new PointOfSales<string>(createApiConfig());

const applySecurity = () => {
  const token = getAuthToken();
  transactionsApi.setSecurityData(token);
  initiativesApi.setSecurityData(token);
  merchantIdApi.setSecurityData(token);
  pointOfSaleIdApi.setSecurityData(token);
  pointOfSalesApi.setSecurityData(token);
};

export const MerchantApi = {

  getInitiativeProducts: async (
    initiativeId: string,
    params: Parameters<typeof initiativesApi.getProducts>[1]
  ): Promise<ProductListDTO> => {
    applySecurity();
    const response = await initiativesApi.getProducts(initiativeId, params);
    return response.data;
  },

  previewPayment: async (initiativeId: string,
    params: {
    productGtin: string;
    productName: string;
    amountCents: number;
    discountCode: string;
  }): Promise<PreviewPaymentDTO> => {
    applySecurity();
    const response = await initiativesApi.previewPayment(initiativeId, params.discountCode, {
      productGtin: params.productGtin,
      productName: params.productName,
      amountCents: params.amountCents,
    });
    return response.data;
  },

  authPaymentBarCode: async (initiativeId: string,
    params: {
    trxCode: string;
    amountCents: number;
    idTrxAcquirer: string;
    additionalProperties: Record<string, string>;
  }): Promise<AuthPaymentResponseDTO> => {
    applySecurity();

    const payload: AuthBarCodePaymentDTO = {
      amountCents: params.amountCents,
      idTrxAcquirer: params.idTrxAcquirer,
      additionalProperties: params.additionalProperties,
    };

    const response = await initiativesApi.authPaymentBarCode(initiativeId, params.trxCode, payload);
    return response.data;
  },

  capturePayment: async (initiativeId: string, params: { trxCode: string }): Promise<TransactionBarCodeResponse> => {
    applySecurity();
    const response = await initiativesApi.capturePayment(initiativeId, params.trxCode);
    return response.data;
  },

  deleteTransactionInProgress: async (initiativeId: string, trxId: string): Promise<void> => {
    applySecurity();
    await initiativesApi.deleteTransaction(initiativeId, trxId);
  },

  reverseTransactionApi: async (trxId: string, file: File, docNumber: string): Promise<void> => {
    applySecurity();
    await transactionsApi.reversalTransaction(trxId, {
      file,
      docNumber,
    });
  },

  reverseInvoicedTransactionApi: async (
    trxId: string,
    file: File,
    docNumber: string
  ): Promise<void> => {
    applySecurity();
    await transactionsApi.reversalTransactionInvoiced(trxId, {
      file,
      docNumber,
    });
  },

  invoiceTransactionApi: async (trxId: string, file: File, docNumber: string): Promise<void> => {
    applySecurity();
    await transactionsApi.invoiceTransaction(trxId, {
      file,
      docNumber,
    });
  },

  updateInvoiceTransactionApi: async (
    trxId: string,
    file: File,
    docNumber: string
  ): Promise<void> => {
    applySecurity();
    await transactionsApi.updateInvoiceTransaction(trxId, {
      file,
      docNumber,
    });
  },

  getPreviewPdf: async (trxId: string): Promise<ReportDTO> => {
    applySecurity();
    const response = await transactionsApi.getTransactionPreviewPdf(trxId);
    return response.data;
  },

  getProcessedTransactions: async (
    initiativeId: string,
    pointOfSaleId: string,
    params?: Parameters<typeof initiativesApi.getPointOfSaleTransactionsProcessed>[2]
  ) => {
    applySecurity();
    const response = await initiativesApi.getPointOfSaleTransactionsProcessed(
      initiativeId,
      pointOfSaleId,
      params
    );
    return response.data;
  },

  getInProgressTransactions: async (
    initiativeId: string,
    pointOfSaleId: string,
    params?: Parameters<typeof initiativesApi.getPointOfSaleTransactions>[2]
  ) => {
    applySecurity();
    const response = await initiativesApi.getPointOfSaleTransactions(
      initiativeId,
      pointOfSaleId,
      params
    );
    return response.data;
  },

  getPointOfSaleDetails: async (merchantId: string, pointOfSaleId: string) => {
    applySecurity();
    const response = await merchantIdApi.getPointOfSale(merchantId, pointOfSaleId);
    return response.data;
  },

  downloadInvoiceFileApi: async (pointOfSaleId: string, trxId: string) => {
    applySecurity();
    const response = await pointOfSaleIdApi.downloadInvoiceFile(pointOfSaleId, trxId);
    return response.data;
  },

  getInitiativesList: async () => {
    applySecurity();
    const response = await pointOfSalesApi.getPointOfSaleInitiativesDetailed();
    return response.data;
  }
};
