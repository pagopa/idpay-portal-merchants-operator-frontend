import { createClient } from './generated/merchants/client';
import type { WithDefaultsT } from './generated/merchants/client';
import { buildFetchApi } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import type { ProductListDTO } from './generated/merchants/ProductListDTO';
//store
import { authStore } from '../store/authStore';

const withBearer: WithDefaultsT<'Bearer'> = (wrappedOperation) => (params: any) => {
    const {token} = authStore.getState();
    return wrappedOperation({
      ...params,
      Bearer: `Bearer ${token}`,    
    });
  };

  const apiClient = createClient({
    baseUrl: import.meta.env.VITE_API_URL,
    basePath: "",
    fetchApi: buildFetchApi(import.meta.env.VITE_API_TIMEOUT_MS),
    withDefaults: withBearer,
  });

  const onRedirectToLogin = () => {
    console.log("ERROR");
  }

  export const MerchantApi = {
    getProducts: async (status, page, size, sort, category, eprelCode, gtinCode, productFileId, productName, organizationId): Promise<ProductListDTO> => {
      const response: any = await apiClient.getProducts({
        status,
        page,
        size,
        sort,
        category,
        eprelCode,
        gtinCode,
        productFileId,
        productName,
        organizationId
      });
      console.log('API response:', response.left[0].value);
      return extractResponse(response, 200, onRedirectToLogin, 404);
    },
  }
  