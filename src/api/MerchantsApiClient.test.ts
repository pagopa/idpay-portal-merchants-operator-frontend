import { describe, it, expect, vi, afterEach } from 'vitest';
import { MerchantApi } from './MerchantsApiClient';

// Create mock functions directly in the vi.mock factory
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockRequestUse = vi.fn();
  const mockResponseUse = vi.fn();

  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        put: mockPut,
        interceptors: {
          request: { use: mockRequestUse },
          response: { use: mockResponseUse }
        }
      }))
    }
  };
});

// Mock authStore
vi.mock('../store/authStore', () => ({
  authStore: {
    getState: vi.fn(() => ({ token: 'mocked_token' }))
  }
}));

// Get access to the mocked axios instance after the mock is set up
const mockedAxios = vi.mocked(await import('axios')).default;

describe('MerchantApi', () => {
  // Get the mocked axios instance
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Get the mocked instance that axios.create returns
    mockAxiosInstance = (mockedAxios.create as any)();
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should call GET /products with correct parameters', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getProducts({
        page: 1,
        size: 10,
        status: 'ACTIVE',
        eprelCode: undefined,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 10,
          status: 'ACTIVE'
        }
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      await expect(MerchantApi.getProducts({})).rejects.toThrow('API Error');
    });
  });

  describe('previewPayment', () => {
    it('should call PUT /transactions/bar-code/:code/preview with correct payload', async () => {
      const mockData = {
        productGtin: '123456789',
        productName: 'Test Product',
        amountCents: 1000,
        discountCode: 'DISCOUNT123'
      };
      const mockResponse = { data: { previewed: true } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await MerchantApi.previewPayment(mockData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/transactions/bar-code/${mockData.discountCode}/preview`,
        mockData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('authPaymentBarCode', () => {
    it('should call PUT /transactions/bar-code/:trxCode/authorize', async () => {
      const params = {
        trxCode: 'TRX123',
        amountCents: 500,
        additionalProperties: {}
      };
      const mockResponse = { data: { authorized: true } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await MerchantApi.authPaymentBarCode(params);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/authorize`,
        params
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getProcessedTransactions', () => {
    it('should call GET with correct initiative and pointOfSale IDs', async () => {
      const initiativeId = 'INIT123';
      const pointOfSaleId = 'POS456';
      const queryParams = {
        page: 1,
        size: 10
      };
      const mockResponse = { data: { transactions: [], total: 0 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`,
        { params: queryParams }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});