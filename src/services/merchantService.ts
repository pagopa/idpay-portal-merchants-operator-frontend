import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';
import { GetProductsParams } from '../utils/types';
import { PreviewPaymentDTO } from '../api/generated/merchants/PreviewPaymentDTO';
import { AuthPaymentResponseDTO } from '../api/generated/merchants/AuthPaymentResponseDTO';
import { PointOfSaleTransactionsProcessedListDTO } from '../api/generated/merchants/PointOfSaleTransactionsProcessedListDTO';
import { PointOfSaleTransactionsListDTO } from '../api/generated/merchants/PointOfSaleTransactionsListDTO';


  export const getProductsList = async (params: GetProductsParams): Promise<ProductListDTO> => {
    return MerchantApi.getProducts(params);
  };

  export const previewPayment = async (params: { productGtin: string, productName: string, amountCents: number, discountCode: string }): Promise<PreviewPaymentDTO> => {
    return MerchantApi.previewPayment(params);
  };

  export const authPaymentBarCode = async (params: { trxCode: string, amountCents: number, additionalProperties?: {} }): Promise<AuthPaymentResponseDTO> => {
    return MerchantApi.authPaymentBarCode(params);
  };

  export const getProcessedTransactions = async (initiativeId: string, pointOfSaleId: string, params: { page?: number, size?: number, sort?: string, fiscalCode?: string, status?: ["REWARDED","CANCELLED"], }): Promise<PointOfSaleTransactionsProcessedListDTO> => {
    return MerchantApi.getProcessedTransactions(initiativeId, pointOfSaleId, params);
  };

  export const getInProgressTransactions = async (initiativeId: string, pointOfSaleId: string, params: { page?: number, size?: number, sort?: string, fiscalCode?: string, status?: string, }): Promise<PointOfSaleTransactionsListDTO> => {
    return MerchantApi.getInProgressTransactions(initiativeId, pointOfSaleId, params);
  };