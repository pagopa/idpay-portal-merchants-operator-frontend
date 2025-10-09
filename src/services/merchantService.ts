import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';
import { GetProductsParams } from '../utils/types';
import { PreviewPaymentDTO } from '../api/generated/merchants/PreviewPaymentDTO';
import { AuthPaymentResponseDTO } from '../api/generated/merchants/AuthPaymentResponseDTO';
import { PointOfSaleTransactionsProcessedListDTO } from '../api/generated/merchants/PointOfSaleTransactionsProcessedListDTO';
import { PointOfSaleTransactionsListDTO } from '../api/generated/merchants/PointOfSaleTransactionsListDTO';
import {TransactionBarCodeResponse} from "../api/generated/merchants/TransactionBarCodeResponse.ts";


  export const getProductsList = async (params: GetProductsParams): Promise<ProductListDTO> => {
    return MerchantApi.getProducts(params);
  };

  export const previewPayment = async (params: { productGtin: string, productName: string, amountCents: number, discountCode: string }): Promise<PreviewPaymentDTO> => {
    return MerchantApi.previewPayment(params);
  };

  export const authPaymentBarCode = async (params: { trxCode: string, amountCents: number, additionalProperties?: {} }): Promise<AuthPaymentResponseDTO> => {
    return MerchantApi.authPaymentBarCode(params);
  };

export const capturePayment = async (params: { trxCode: string, additionalProperties?: {} }): Promise<TransactionBarCodeResponse> => {
  return MerchantApi.capturePayment(params);
};

  export const getProcessedTransactions = async (initiativeId: string, pointOfSaleId: string, params: { page?: number, size?: number, sort?: string, fiscalCode?: string, status?: string, productGtin?: string }): Promise<PointOfSaleTransactionsProcessedListDTO> => {
    return MerchantApi.getProcessedTransactions(initiativeId, pointOfSaleId, params);
  };

  export const getInProgressTransactions = async (initiativeId: string, pointOfSaleId: string, params: { page?: number, size?: number, sort?: string, fiscalCode?: string, status?: string, productGtin?: string }): Promise<PointOfSaleTransactionsListDTO> => {
    return MerchantApi.getInProgressTransactions(initiativeId, pointOfSaleId, params);
  };

  export const getPointOfSaleDetails = async (merchantId: string, pointOfSaleId: string) => {
    return MerchantApi.getPointOfSaleDetails(merchantId, pointOfSaleId);
  };

  export const deleteTransactionInProgress = async (trxId: string): Promise<void> => {
    return MerchantApi.deleteTransactionInProgress(trxId);
  }

  export const downloadInvoiceFileApi = async (pointOfSaleId: string, trxId: string): Promise<{ invoiceUrl: string }> => {
    return MerchantApi.downloadInvoiceFileApi(pointOfSaleId, trxId);
  }

  export const reverseTransactionApi = async (trxId: string, file: File): Promise<void> => {
    return MerchantApi.reverseTransactionApi(trxId, file);
  }

  export const rewardTransactionApi = async (trxId: string, file: File): Promise<void> => {
    return MerchantApi.rewardTransactionApi(trxId, file);
  }

  export const getFileUrl = async (url: string): Promise<any> => {
    return MerchantApi.getFileUrl(url);
  }