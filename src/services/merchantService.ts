import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';
import { GetProductsParams } from '../utils/types';
import { PreviewPaymentDTO } from '../api/generated/merchants/PreviewPaymentDTO';
import { AuthPaymentResponseDTO } from '../api/generated/merchants/AuthPaymentResponseDTO';


  export const getProductsList = async (params: GetProductsParams): Promise<ProductListDTO> => {
    return MerchantApi.getProducts(params);
  };

  export const previewPayment = async (params: { productGtin: string, productName: string, amountCents: number, discountCode: string }): Promise<PreviewPaymentDTO> => {
    return MerchantApi.previewPayment(params);
  };

  export const authPaymentBarCode = async (params: { trxCode: string, amountCents: number, additionalProperties?: {} }): Promise<AuthPaymentResponseDTO> => {
    return MerchantApi.authPaymentBarCode(params);
  };