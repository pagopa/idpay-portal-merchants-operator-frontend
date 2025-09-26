import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getProductsList,
  previewPayment,
  authPaymentBarCode,
  getProcessedTransactions,
  getPointOfSaleDetails,
} from "./merchantService";
import { MerchantApi } from "../api/MerchantsApiClient";

// Mock di MerchantApi
vi.mock("../api/MerchantsApiClient", () => ({
  MerchantApi: {
    getProducts: vi.fn(),
    previewPayment: vi.fn(),
    authPaymentBarCode: vi.fn(),
    getProcessedTransactions: vi.fn(),
    getPointOfSaleDetails: vi.fn()
  },
}));

describe("Merchant Service Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductsList", () => {
    it("should call MerchantApi.getProducts with correct parameters", async () => {
      const mockParams = {
        page: 1,
        size: 10,
        status: "ACTIVE" as const,
        eprelCode: "12345",
      };
      const mockResponse = {
        products: [
          { id: "1", name: "Product 1", gtin: "123456789" },
          { id: "2", name: "Product 2", gtin: "987654321" },
        ],
        total: 2,
      };

      vi.mocked(MerchantApi.getProducts).mockResolvedValue(mockResponse);

      const result = await getProductsList(mockParams);

      expect(MerchantApi.getProducts).toHaveBeenCalledWith(mockParams);
      expect(MerchantApi.getProducts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty parameters", async () => {
      const mockParams = {};
      const mockResponse = { products: [], total: 0 };

      vi.mocked(MerchantApi.getProducts).mockResolvedValue(mockResponse);

      const result = await getProductsList(mockParams);

      expect(MerchantApi.getProducts).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.getProducts", async () => {
      const mockParams = { page: 1 };
      const mockError = new Error("API Error");

      vi.mocked(MerchantApi.getProducts).mockRejectedValue(mockError);

      await expect(getProductsList(mockParams)).rejects.toThrow("API Error");
      expect(MerchantApi.getProducts).toHaveBeenCalledWith(mockParams);
    });
  });

  describe("previewPayment", () => {
    it("should call MerchantApi.previewPayment with correct parameters", async () => {
      const mockParams = {
        productGtin: "123456789012",
        productName: "Test Product",
        amountCents: 5000,
        discountCode: "DISCOUNT123",
      };
      const mockResponse = {
        trxId: "TRX123",
        discountAmount: 1000,
        finalAmount: 4000,
      };

      vi.mocked(MerchantApi.previewPayment).mockResolvedValue(mockResponse);

      const result = await previewPayment(mockParams);

      expect(MerchantApi.previewPayment).toHaveBeenCalledWith(mockParams);
      expect(MerchantApi.previewPayment).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle preview payment with zero amount", async () => {
      const mockParams = {
        productGtin: "123456789012",
        productName: "Free Product",
        amountCents: 0,
        discountCode: "FREE123",
      };
      const mockResponse = {
        trxId: "TRX456",
        discountAmount: 0,
        finalAmount: 0,
      };

      vi.mocked(MerchantApi.previewPayment).mockResolvedValue(mockResponse);

      const result = await previewPayment(mockParams);

      expect(MerchantApi.previewPayment).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.previewPayment", async () => {
      const mockParams = {
        productGtin: "123456789012",
        productName: "Test Product",
        amountCents: 5000,
        discountCode: "INVALID",
      };
      const mockError = new Error("Invalid discount code");

      vi.mocked(MerchantApi.previewPayment).mockRejectedValue(mockError);

      await expect(previewPayment(mockParams)).rejects.toThrow(
        "Invalid discount code"
      );
      expect(MerchantApi.previewPayment).toHaveBeenCalledWith(mockParams);
    });
  });

  describe("authPaymentBarCode", () => {
    it("should call MerchantApi.authPaymentBarCode with correct parameters", async () => {
      const mockParams = {
        idTrxAcquirer: "PAGOPA",
        amountCents: 4000,
        additionalProperties: { merchantId: "MERCHANT123" },
      };
      const mockResponse = {
        id: "string",
        trxCode: "string",
        trxDate: "2025-09-12T10:34:59.404Z",
        initiativeId: "string",
        initiativeName: "string",
        businessName: "string",
        status: "CREATED",
        rewardCents: 100,
        amountCents: 100,
        residualBudgetCents: 100,
        splitPayment: true,
        residualAmountCents: 100,
      };

      vi.mocked(MerchantApi.authPaymentBarCode).mockResolvedValue(
        mockResponse as any
      );

      const result = await authPaymentBarCode(mockParams as any);

      expect(MerchantApi.authPaymentBarCode).toHaveBeenCalledWith(mockParams);
      expect(MerchantApi.authPaymentBarCode).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle authorization without additional properties", async () => {
      const mockParams = {
        trxCode: "TRX789",
        amountCents: 2500,
      };
      const mockResponse = {
        trxId: "TRX789",
        status: "AUTHORIZED",
        authCode: "AUTH789",
        rewards: [],
      };

      vi.mocked(MerchantApi.authPaymentBarCode).mockResolvedValue(
        mockResponse as any
      );

      const result = await authPaymentBarCode(mockParams as any);

      expect(MerchantApi.authPaymentBarCode).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.authPaymentBarCode", async () => {
      const mockParams = {
        trxCode: "INVALID_TRX",
        amountCents: 1000,
      };
      const mockError = new Error("Transaction not found");

      vi.mocked(MerchantApi.authPaymentBarCode).mockRejectedValue(mockError);
      await expect(authPaymentBarCode(mockParams)).rejects.toThrow(
        "Transaction not found"
      );
      expect(MerchantApi.authPaymentBarCode).toHaveBeenCalledWith(mockParams);
    });
  });

  describe("getProcessedTransactions", () => {
    it("should call MerchantApi.getProcessedTransactions with correct parameters", async () => {
      const initiativeId = "INITIATIVE123";
      const pointOfSaleId = "POS456";
      const mockParams = {
        page: 1,
        size: 10,
        sort: "createdAt",
        fiscalCode: "RSSMRA80A01H501U",
        status: ["REWARDED", "CANCELLED"] as const,
      };
      const mockResponse = {
        transactions: [
          {
            id: "TRX001",
            amount: 5000,
            status: "REWARDED",
            createdAt: "2023-01-01T10:00:00Z",
          },
          {
            id: "TRX002",
            amount: 3000,
            status: "CANCELLED",
            createdAt: "2023-01-02T11:00:00Z",
          },
        ],
        totalElements: 2,
        totalPages: 1,
      };

      vi.mocked(MerchantApi.getProcessedTransactions).mockResolvedValue(
        mockResponse as any
      );

      // Act
      const result = await getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        mockParams as any
      );

      // Assert
      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith(
        initiativeId,
        pointOfSaleId,
        mockParams
      );
      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle minimal parameters", async () => {
      const initiativeId = "INITIATIVE789";
      const pointOfSaleId = "POS123";
      const mockParams = {};
      const mockResponse = {
        transactions: [],
        totalElements: 0,
        totalPages: 0,
      };

      vi.mocked(MerchantApi.getProcessedTransactions).mockResolvedValue(
        mockResponse as any
      );

      const result = await getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        mockParams as any
      );

      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith(
        initiativeId,
        pointOfSaleId,
        mockParams
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle only REWARDED status", async () => {
      const initiativeId = "INITIATIVE456";
      const pointOfSaleId = "POS789";
      const mockParams = {
        status: ["REWARDED", "CANCELLED"] as const,
        page: 0,
        size: 5,
      };
      const mockResponse = {
        transactions: [
          {
            id: "TRX003",
            amount: 2000,
            status: "REWARDED",
            createdAt: "2023-01-03T12:00:00Z",
          },
        ],
        totalElements: 1,
        totalPages: 1,
      };

      vi.mocked(MerchantApi.getProcessedTransactions).mockResolvedValue(
        mockResponse as any
      );

      const result = await getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        mockParams as any
      );

      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith(
        initiativeId,
        pointOfSaleId,
        mockParams
      );
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.getProcessedTransactions", async () => {
      const initiativeId = "INVALID_INITIATIVE";
      const pointOfSaleId = "INVALID_POS";
      const mockParams = { page: 1 };
      const mockError = new Error("Initiative not found");

      vi.mocked(MerchantApi.getProcessedTransactions).mockRejectedValue(
        mockError
      );

      await expect(
        getProcessedTransactions(initiativeId, pointOfSaleId, mockParams)
      ).rejects.toThrow("Initiative not found");

      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith(
        initiativeId,
        pointOfSaleId,
        mockParams
      );
    });
  });

  describe("Integration scenarios", () => {
    it("should handle concurrent calls to different service functions", async () => {
      const mockProductsResponse = { products: [], total: 0 };
      const mockPreviewResponse = { trxId: "TRX123", status: "PREVIEW_OK" };

      vi.mocked(MerchantApi.getProducts).mockResolvedValue(
        mockProductsResponse
      );
      vi.mocked(MerchantApi.previewPayment).mockResolvedValue(
        mockPreviewResponse as any
      );

      const [productsResult, previewResult] = await Promise.all([
        getProductsList({ page: 1 }),
        previewPayment({
          productGtin: "123456789012",
          productName: "Test Product",
          amountCents: 5000,
          discountCode: "DISCOUNT123",
        }),
      ]);

      expect(productsResult).toEqual(mockProductsResponse);
      expect(previewResult).toEqual(mockPreviewResponse);
      expect(MerchantApi.getProducts).toHaveBeenCalledTimes(1);
      expect(MerchantApi.previewPayment).toHaveBeenCalledTimes(1);
    });

    it("should maintain function isolation on errors", async () => {
      vi.mocked(MerchantApi.getProducts).mockRejectedValue(
        new Error("Products API Error")
      );
      vi.mocked(MerchantApi.previewPayment).mockResolvedValue({
        trxId: "TRX123",
        status: "OK",
      } as any);

      await expect(getProductsList({ page: 1 })).rejects.toThrow(
        "Products API Error"
      );

      const previewResult = await previewPayment({
        productGtin: "123456789012",
        productName: "Test Product",
        amountCents: 5000,
        discountCode: "DISCOUNT123",
      });

      expect(previewResult).toEqual({ trxId: "TRX123", status: "OK" });
    });
  });

  describe("getPointOfSaleDetails", () => {
    it("should call MerchantApi.getPointOfSaleDetails with correct parameters", async () => {
      const merchantId = "MI123";
      const pointOfSaleId = "POS456";
      const mockResponse = {
        id: "68c199bc3b741ec5f8054a1e",
        franchiseName: "trony",
        region: "Puglia",
        province: "LE",
        city: "Matino",
        zipCode: "73046",
        address: "Via Bolzano4",
        contactEmail: "referente2345@gmail.com",
        contactName: "Giuseppe",
        contactSurname: "Verdi",
        channelEmail: "",
        channelPhone: "",
        channelGeolink: "",
        channelWebsite: "",
      };

    vi.mocked(MerchantApi.getPointOfSaleDetails).mockResolvedValue(mockResponse);

      const result = await getPointOfSaleDetails(merchantId, pointOfSaleId);
 
      expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledWith(
        merchantId,
        pointOfSaleId
      );
      expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty parameters", async () => {
      const merchantId = "";
      const pointOfSaleId = "";
      const mockResponse = {
        id: "68c199bc3b741ec5f8054a1e",
        franchiseName: "trony",
        region: "Puglia",
        province: "LE",
        city: "Matino",
        zipCode: "73046",
        address: "Via Bolzano4",
        contactEmail: "referente2345@gmail.com",
        contactName: "Giuseppe",
        contactSurname: "Verdi",
        channelEmail: "",
        channelPhone: "",
        channelGeolink: "",
        channelWebsite: "",
      };

      vi.mocked(MerchantApi.getPointOfSaleDetails).mockResolvedValue(mockResponse);

      const result = await getPointOfSaleDetails(merchantId, pointOfSaleId);

      expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledWith(merchantId, pointOfSaleId);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.getPointOfSaleDetails", async () => {
      const merchantId = "MI123";
      const pointOfSaleId = "POS456";
      const mockError = new Error("API Error");

      vi.mocked(MerchantApi.getPointOfSaleDetails).mockRejectedValue(mockError);

      await expect(getPointOfSaleDetails(merchantId, pointOfSaleId)).rejects.toThrow("API Error");
      expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledWith(merchantId, pointOfSaleId);
    });
  });
});
