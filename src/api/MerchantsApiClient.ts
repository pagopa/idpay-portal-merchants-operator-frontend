import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ProductListDTO } from './generated/merchants/ProductListDTO';
import type { PreviewPaymentDTO } from './generated/merchants/PreviewPaymentDTO';
import { authStore } from '../store/authStore';
import { AuthPaymentResponseDTO } from './generated/merchants/AuthPaymentResponseDTO';
import type { PointOfSaleTransactionsProcessedListDTO } from './generated/merchants/PointOfSaleTransactionsProcessedListDTO';
import type { PointOfSaleTransactionsListDTO } from './generated/merchants/PointOfSaleTransactionsListDTO';
import { PointOfSaleDTO } from './generated/merchants/PointOfSaleDTO';
import { TransactionBarCodeResponse } from './generated/merchants/TransactionBarCodeResponse.ts';
import { logApiError, logger } from '../utils/logger.ts';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const { token } = authStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      logApiError(error, 'MerchantApi (axios interceptor)');
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
  logger.error('ERROR 401');
};

const handleAxiosResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

export const MerchantApi = {
  getProducts: async (params: {
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
    category?: string;
    eprelCode?: string;
    gtinCode?: string;
    productFileId?: string;
    productName?: string;
    fullProductName?: string;
    organizationId?: string;
  }): Promise<ProductListDTO> => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_ /* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) =>
            value !== undefined && value !== '' && value !== null
        )
      );

      const response = await axiosInstance.get('/products', {
        params: cleanParams,
      });

      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'getProducts');
      throw error;
    }
  },

  previewPayment: async (params: {
    productGtin: string;
    productName: string;
    amountCents: number;
    discountCode: string;
  }): Promise<PreviewPaymentDTO> => {
    try {
      const response = await axiosInstance.put(
        `/transactions/bar-code/${params.discountCode}/preview`,
        params
      );
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'previewPayment');
      throw error;
    }
  },

  authPaymentBarCode: async (params: {
    trxCode: string;
    amountCents: number;
    additionalProperties?: object;
  }): Promise<AuthPaymentResponseDTO> => {
    try {
      const response = await axiosInstance.put(
        `/transactions/bar-code/${params.trxCode}/authorize`,
        params
      );
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'authPaymentBarCode');
      throw error;
    }
  },

  capturePayment: async (params: {
    trxCode: string;
    additionalProperties?: object;
  }): Promise<TransactionBarCodeResponse> => {
    try {
      const response = await axiosInstance.put(
        `/transactions/bar-code/${params.trxCode}/capture`,
        params
      );
      return handleAxiosResponse(response);
    } catch (error) {
      logApiError(error, 'capturePayment');
      throw error;
    }
  },

  getProcessedTransactions: async (
    initiativeId: string,
    pointOfSaleId: string,
    params: {
      page?: number;
      size?: number;
      sort?: string;
      fiscalCode?: string;
      status?: string;
      productGtin?: string;
      trxCode?: string;
    }
  ): Promise<PointOfSaleTransactionsProcessedListDTO> => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_ /* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) =>
            value !== undefined && value !== '' && value !== null
        )
      );
      const response = await axiosInstance.get(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`,
        {
          params: cleanParams,
        }
      );
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'getProcessedTransactions');
      throw error;
    }
  },

  getInProgressTransactions: async (
    initiativeId: string,
    pointOfSaleId: string,
    params: {
      page?: number;
      size?: number;
      sort?: string;
      fiscalCode?: string;
      status?: string;
      productGtin?: string;
      trxCode?: string;
    }
  ): Promise<PointOfSaleTransactionsListDTO> => {
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([_ /* eslint-disable-line @typescript-eslint/no-unused-vars */, value]) =>
            value !== undefined && value !== '' && value !== null
        )
      );
      const response = await axiosInstance.get(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions`,
        {
          params: cleanParams,
        }
      );
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'getInProgressTransactions');
      throw error;
    }
  },

  getPointOfSaleDetails: async (
    merchantId: string,
    pointOfSaleId: string
  ): Promise<PointOfSaleDTO> => {
    try {
      const response = await axiosInstance.get(`/${merchantId}/point-of-sales/${pointOfSaleId}`);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'getPointOfSaleDetails');
      throw error;
    }
  },

  deleteTransactionInProgress: async (trxId: string): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/transactions/${trxId}`);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'deleteTransactionInProgress');
      throw error;
    }
  },

  downloadInvoiceFileApi: async (
    pointOfSaleId: string,
    trxId: string
  ): Promise<{ invoiceUrl: string }> => {
    try {
      const response = await axiosInstance.get(`${pointOfSaleId}/transactions/${trxId}/download`);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'downloadInvoiceFileApi');
      throw error;
    }
  },

  reverseTransactionApi: async (trxId: string, file: File, docNumber: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docNumber', docNumber);

      const response = await axiosInstance.post(`/transactions/${trxId}/reversal`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'reverseTransactionApi');
      throw error;
    }
  },
  reverseInvoicedTransactionApi: async (
    trxId: string,
    file: File,
    docNumber: string
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docNumber', docNumber);

      const response = await axiosInstance.post(
        `/transactions/${trxId}/reversal-invoiced`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'reverseInvoicedTransactionApi');
      throw error;
    }
  },
  invoiceTransactionApi: async (trxId: string, file: File, docNumber: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docNumber', docNumber);
      const response = await axiosInstance.post(`/transactions/${trxId}/invoice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'invoiceTransactionApi');
      throw error;
    }
  },
  updateInvoiceTransactionApi: async (
    trxId: string,
    file: File,
    docNumber: string
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docNumber', docNumber);
      const response = await axiosInstance.put(`transactions/${trxId}/invoice/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'updateInvoiceTransactionApi');
      throw error;
    }
  },

  getPreviewPdf: async (trxId: string): Promise<{ data: string }> => {
    try {
      const response = await axiosInstance.get(`/transactions/${trxId}/preview-pdf`);
      const result = handleAxiosResponse(response);
      return result;
    } catch (error) {
      logApiError(error, 'getPreviewPdf');
      throw error;
    }
  },
};
