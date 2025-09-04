import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';
import { GetProductsParams } from '../utils/types';
import { PreviewPaymentDTO } from '../api/generated/merchants/PreviewPaymentDTO';


  export const getProductsList = async (params: GetProductsParams): Promise<ProductListDTO> => {
    return MerchantApi.getProducts(params);
  };

  export const previewPayment = async (params: { product: string, amount: number, discountCode: string }): Promise<PreviewPaymentDTO> => {
    return MerchantApi.previewPayment(params);
  };