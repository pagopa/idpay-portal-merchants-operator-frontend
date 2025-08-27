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
    basePath: '',
    fetchApi: buildFetchApi(import.meta.env.VITE_API_TIMEOUT_MS),
    withDefaults: withBearer,
  });

  const onRedirectToLogin = () => {
    console.log("ERROR");
  }

  export const MerchantApi = {
    getProducts: async (): Promise<ProductListDTO> => {
      const response = await apiClient.getProducts({
        status: 'APPROVED',
        
      });
      return extractResponse(response, 200, onRedirectToLogin);
    },
  }
  