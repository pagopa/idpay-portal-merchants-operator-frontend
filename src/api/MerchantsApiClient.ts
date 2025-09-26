import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ProductListDTO } from './generated/merchants/ProductListDTO';
import type { PreviewPaymentDTO } from './generated/merchants/PreviewPaymentDTO';
//store
import { authStore } from '../store/authStore';
import { AuthPaymentResponseDTO } from './generated/merchants/AuthPaymentResponseDTO';
import type { PointOfSaleTransactionsProcessedListDTO } from './generated/merchants/PointOfSaleTransactionsProcessedListDTO';
import type { PointOfSaleTransactionsListDTO } from './generated/merchants/PointOfSaleTransactionsListDTO';
import {TransactionBarCodeResponse} from "./generated/merchants/TransactionBarCodeResponse.ts";

//axios instance 
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor 
  instance.interceptors.request.use((config) => {
    const { token } = authStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response Interceptor 
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      console.log(error);
      if (error.response?.status === 401) {
        onRedirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

const onRedirectToLogin = () => {
  console.log("ERROR 401");
};

const handleAxiosResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

export const MerchantApi = {
  getProducts: async (
   params: {
    status?: string 
    page?: number, 
    size?: number, 
    sort?: string, 
    category?: string, 
    eprelCode?: string, 
    gtinCode?: string, 
    productFileId?: string, 
    productName?: string, 
    organizationId?: string
   }
  ): Promise<ProductListDTO> => {
    try {

      // Remove undefined params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_/* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) => value !== undefined && value !== '' && value !== null)
      );

      const response = await axiosInstance.get('/products', {
        params: cleanParams
      });
      
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  },


  previewPayment: async (
    params: {
      productGtin: string,
      productName: string,
      amountCents: number,
      discountCode: string
    }
  ): Promise<PreviewPaymentDTO> => {
    try {
      const response = await axiosInstance.put(`/transactions/bar-code/${params.discountCode}/preview`, params);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in previewPayment:', error);
      throw error;
    }
  },

  authPaymentBarCode: async (
    params: {
      trxCode: string,
      amountCents: number,
      additionalProperties?: object
    }
  ): Promise<AuthPaymentResponseDTO> => {
    try {
      const response = await axiosInstance.put(`/transactions/bar-code/${params.trxCode}/authorize`, params);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in authPaymentBarCode:', error);
      throw error;
    }
  },

  capturePayment: async (
      params: {
        trxCode: string,
        additionalProperties?: object
      }
  ): Promise<TransactionBarCodeResponse> => {
    try {
      const response = await axiosInstance.put(`/transactions/bar-code/${params.trxCode}/capture`, params);
     return handleAxiosResponse(response);
    } catch (error) {
      console.error('Error in capturePayment:', error);
      throw error;
    }
  },

  getProcessedTransactions: async (initiativeId: string, pointOfSaleId: string, params: {
    page?: number,
    size?: number,
    sort?: string,
    fiscalCode?: string,
    status?: string,
    productGtin?: string
  }): Promise<PointOfSaleTransactionsProcessedListDTO> => {
    try {
        // Remove undefined params
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_/* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) => value !== undefined && value !== '' && value !== null)
        );
      const response = await axiosInstance.get(`/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`, {
        params: cleanParams
      });
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in getProcessedTransactions:', error);
      throw error;
    }
  },

  getInProgressTransactions: async (initiativeId: string, pointOfSaleId: string, params: {
    page?: number,
    size?: number,
    sort?: string,
    fiscalCode?: string,
    status?: string,
    productGtin?: string
  }): Promise<PointOfSaleTransactionsListDTO> => {
    try {
        // Remove undefined params
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_/* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) => value !== undefined && value !== '' && value !== null)
        );
      const response = await axiosInstance.get(`/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions`, {
        params: cleanParams
      });
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in getInProgressTransactions:', error);
      throw error;
    }
  },

  deleteTransactionInProgress: async (trxId: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/transactions/${trxId}`);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      console.error('Error in deleteTransactionInProgress:', error);
      throw error;
    }
  },

};





