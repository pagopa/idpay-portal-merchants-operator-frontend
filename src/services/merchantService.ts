import { MerchantApi } from '../api/MerchantsApiClient';
import { ProductListDTO } from '../api/generated/merchants/ProductListDTO';

export const getProductsList = async (): Promise<ProductListDTO> => {
    return MerchantApi.getProducts();
}
