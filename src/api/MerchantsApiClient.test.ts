import { describe, it, expect, vi, afterEach } from "vitest";
import { MerchantApi } from "./MerchantsApiClient";

// Create mock functions directly in the vi.mock factory
vi.mock("axios", () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  const mockRequestUse = vi.fn();
  const mockResponseUse = vi.fn();

  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        put: mockPut,
        delete: mockDelete,
        interceptors: {
          request: { use: mockRequestUse },
          response: { use: mockResponseUse },
        },
      })),
    },
  };
});

// Mock authStore
vi.mock("../store/authStore", () => ({
  authStore: {
    getState: vi.fn(() => ({ token: "mocked_token" })),
  },
}));

// Get access to the mocked axios instance after the mock is set up
const mockedAxios = vi.mocked(await import("axios")).default;

describe("MerchantApi", () => {
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

  describe("getProducts", () => {
    it("should call GET /products with correct parameters", async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getProducts({
        page: 1,
        size: 10,
        status: "ACTIVE",
        eprelCode: undefined,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/products", {
        params: {
          page: 1,
          size: 10,
          status: "ACTIVE",
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if API fails", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("API Error"));

      await expect(MerchantApi.getProducts({})).rejects.toThrow("API Error");
    });
  });

  describe("previewPayment", () => {
    it("should call PUT /transactions/bar-code/:code/preview with correct payload", async () => {
      const mockData = {
        productGtin: "123456789",
        productName: "Test Product",
        amountCents: 1000,
        discountCode: "DISCOUNT123",
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

  describe("authPaymentBarCode", () => {
    it("should call PUT /transactions/bar-code/:trxCode/authorize", async () => {
      const params = {
        trxCode: "TRX123",
        amountCents: 500,
        additionalProperties: {},
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

  describe("capturePayment", () => {
    it("should perform a PUT on /transactions/bar-code/:trxCode/capture with payload", async () => {
      const params = {
        trxCode: "CAPT_TRX_123",
        additionalProperties: {
          testKey: "testValue",
        },
      };

      const mockResponseData = {
        transaction: { id: params.trxCode, status: "CAPTURED" },
      };
      const mockResponse = { data: mockResponseData };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await MerchantApi.capturePayment(params);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/capture`,
        params
      );

      expect(result).toEqual(mockResponseData);
    });

    it("should propagate error in case of rejected Promise", async () => {
      const params = {
        trxCode: "FAIL_TRX_400",
        additionalProperties: {},
      };

      const apiError = new Error("400 Bad Request: Capture Failed");

      mockAxiosInstance.put.mockRejectedValue(apiError);

      const promise = MerchantApi.capturePayment(params);

      await expect(promise).rejects.toThrow("400 Bad Request: Capture Failed");

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/capture`,
        params
      );
    });
  });

  describe("getInProgressTransactions", () => {
    const initiativeId = "INIT_TEST";
    const pointOfSaleId = "POS_TEST";
    const mockSuccessResponse = {
      data: {
        transactions: [{ id: "trx1" }],
        total: 1,
      },
    };

    it("should make a GET with all parameters ", async () => {
      const queryParams = {
        page: 1,
        size: 10,
        sort: "DESC",
        fiscalCode: "RSSGNN80A01H501E",
        status: "PENDING",
        productGtin: "1234567890123",
      };

      mockAxiosInstance.get.mockResolvedValue(mockSuccessResponse);

      const result = await MerchantApi.getInProgressTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions`,
        { params: queryParams }
      );

      expect(result).toEqual(mockSuccessResponse.data);
    });

    it("should propagate error in case of rejected Promise", async () => {
      const queryParams = { page: 0 };
      const apiError = new Error("500 Internal Server Error");

      mockAxiosInstance.get.mockRejectedValue(apiError);

      const promise = MerchantApi.getInProgressTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      await expect(promise).rejects.toThrow("500 Internal Server Error");

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPointOfSaleDetails", () => {
    it("should call GET with correct initiative and pointOfSale IDs", async () => {
      const merchantId = "MI123";
      const pointOfSaleId = "POS456";
      const mockResponse = { data: { transactions: [], total: 0 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getPointOfSaleDetails(
        merchantId,
        pointOfSaleId
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/${merchantId}/point-of-sales/${pointOfSaleId}`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an errore when API call fail", async () => {
      const merchantId = "MI123";
      const pointOfSaleId = "POS456";
      const apiError = new Error("404 Not Found from API");

      mockAxiosInstance.get.mockRejectedValue(apiError);

      const promise = MerchantApi.getPointOfSaleDetails(
        merchantId,
        pointOfSaleId
      );

      await expect(promise).rejects.toThrow("404 Not Found from API");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/${merchantId}/point-of-sales/${pointOfSaleId}`
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProcessedTransactions", () => {
    it("should call GET with correct initiative and pointOfSale IDs", async () => {
      const initiativeId = "INIT123";
      const pointOfSaleId = "POS456";
      const queryParams = {
        page: 1,
        size: 10,
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

    it("should throw an errore when API call fail", async () => {
      const initiativeId = "INIT123";
      const pointOfSaleId = "POS456";
      const queryParams = {
        page: 1,
        size: 10,
      };
      const apiError = new Error("404 Not Found from API");

      mockAxiosInstance.get.mockRejectedValue(apiError);

      const promise = MerchantApi.getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      await expect(promise).rejects.toThrow("404 Not Found from API");
    });
  });

  describe("deleteTransactionInProgress", () => {
    it("should call DELETE /transactions/:trxId with correct transaction ID", async () => {
      const trxId = "TRX_TO_DELETE_789";

      const mockResponse = { data: {}, status: 204 };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      await expect(
        MerchantApi.deleteTransactionInProgress(trxId)
      ).resolves.toEqual({});

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        `/transactions/${trxId}`
      );
      expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw error if API fails during deletion", async () => {
      const trxId = "FAIL_ID_101";
      const apiError = new Error("DELETE API Error");
      mockAxiosInstance.delete.mockRejectedValue(apiError);

      await expect(
        MerchantApi.deleteTransactionInProgress(trxId)
      ).rejects.toThrow("DELETE API Error");
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        `/transactions/${trxId}`
      );
    });
  });
});
