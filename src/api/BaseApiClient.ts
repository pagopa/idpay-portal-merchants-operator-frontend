import { ApiConfig } from "./generated/http-client";
import { authStore } from "../store/authStore";

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
