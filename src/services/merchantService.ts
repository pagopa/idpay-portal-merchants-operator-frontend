import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';
import { GetProductsParams } from '../utils/types';


  export const getProductsList = async (params: GetProductsParams): Promise<ProductListDTO> => {
    return MerchantApi.getProducts(params);
  };