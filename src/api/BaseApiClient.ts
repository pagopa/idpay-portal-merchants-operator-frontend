import { isAxiosError, type AxiosInstance } from 'axios';
import { ApiConfig } from './generated/http-client';
import { authStore } from '../store/authStore';
import keycloak from '../config/keycloak';

type ApiClientWithInstance = {
  instance: AxiosInstance;
};

let isUnauthorizedLogoutInProgress = false;

const unauthorizedResponseHandler = (error: unknown) => {
  if (
    isAxiosError(error)
    && error.response?.status === 401
    && !isUnauthorizedLogoutInProgress
  ) {
    isUnauthorizedLogoutInProgress = true;
    void keycloak.logout();
  }

  return Promise.reject(error);
};

export const createApiConfig = (): ApiConfig<string> => {
  return {
    baseURL: import.meta.env.VITE_API_URL,
    securityWorker: async (token: string | null) => {
      if (!token) {
        return {};
      }

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
  };
};

export const getAuthToken = (): string | null => {
  const { token } = authStore.getState();
  return token ?? null;
};

export const attachUnauthorizedLogoutInterceptor = (...clients: ApiClientWithInstance[]): void => {
  clients.forEach(({ instance }) => {
    instance.interceptors.response.use(
      (response) => response,
      unauthorizedResponseHandler
    );
  });
};

