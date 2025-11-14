import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getProductsList,
  previewPayment,
  authPaymentBarCode,
  getProcessedTransactions,
  getPointOfSaleDetails,
  capturePayment,
  getInProgressTransactions,
  deleteTransactionInProgress,
  downloadInvoiceFileApi,
  reverseTransactionApi,
  invoiceTransactionApi,
  getPreviewPdf,
} from "./merchantService";
import { MerchantApi } from "../api/MerchantsApiClient";

vi.mock("../api/MerchantsApiClient", () => ({
  MerchantApi: {
    getProducts: vi.fn(),
    previewPayment: vi.fn(),
    authPaymentBarCode: vi.fn(),
    getProcessedTransactions: vi.fn(),
    getPointOfSaleDetails: vi.fn(),
    capturePayment: vi.fn(),
    getInProgressTransactions: vi.fn(),
    deleteTransactionInProgress: vi.fn(),
    downloadInvoiceFileApi: vi.fn(),
    reverseTransactionApi: vi.fn(),
    invoiceTransactionApi: vi.fn(),
    getPreviewPdf: vi.fn(),
  },
}));

const mockCapturePayment = MerchantApi.capturePayment as vi.Mock;
const mockGetInProgressTransactions = MerchantApi.getInProgressTransactions as vi.Mock;
const mockDeleteTransactionInProgress = MerchantApi.deleteTransactionInProgress as vi.Mock;

describe("Merchant Service Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("downloadInvoiceFileApi", () => {
    it("should call MerchantApi.downloadInvoiceFileApi with correct parameters", async () => {
      vi.mocked(MerchantApi.downloadInvoiceFileApi).mockResolvedValue({} as any);
      const result = await downloadInvoiceFileApi("salesPoint", "trxId");
      expect(MerchantApi.downloadInvoiceFileApi).toHaveBeenCalledWith("salesPoint", "trxId");
      expect(MerchantApi.downloadInvoiceFileApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });

  describe("reverseTransactionApi", () => {
    it("should call MerchantApi.reverseTransactionApi with correct parameters", async () => {
      vi.mocked(MerchantApi.reverseTransactionApi).mockResolvedValue({} as any);
      const testFile = new File([new Blob()], "fileName");
      const result = await reverseTransactionApi("trxId", testFile, "DOC123");
      expect(MerchantApi.reverseTransactionApi).toHaveBeenCalledWith("trxId", testFile, "DOC123");
      expect(MerchantApi.reverseTransactionApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });

  describe("invoiceTransactionApi", () => {
    it("should call MerchantApi.invoiceTransactionApi with correct parameters", async () => {
      vi.mocked(MerchantApi.invoiceTransactionApi).mockResolvedValue({} as any);
      const testFile = new File([new Blob()], "fileName");
      const result = await invoiceTransactionApi("trxId", testFile, "DOC456");
      expect(MerchantApi.invoiceTransactionApi).toHaveBeenCalledWith("trxId", testFile, "DOC456");
      expect(MerchantApi.invoiceTransactionApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual({});
    });
  });

  describe("getProductsList", () => {
    it("should call MerchantApi.getProducts with correct parameters", async () => {
      const mockParams = { page: 1, size: 10, status: "ACTIVE" as const, eprelCode: "12345" };
      const mockResponse = { products: [{ id: "1" }], total: 1 };
      vi.mocked(MerchantApi.getProducts).mockResolvedValue(mockResponse);
      const result = await getProductsList(mockParams);
      expect(MerchantApi.getProducts).toHaveBeenCalledWith(mockParams);
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
    });
  });

  describe("previewPayment", () => {
    it("should call MerchantApi.previewPayment with correct parameters", async () => {
      const mockParams = { productGtin: "123", productName: "Test", amountCents: 5000, discountCode: "DISC" };
      const mockResponse = { trxId: "TRX123", finalAmount: 4000 };
      vi.mocked(MerchantApi.previewPayment).mockResolvedValue(mockResponse);
      const result = await previewPayment(mockParams);
      expect(MerchantApi.previewPayment).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors", async () => {
      const mockParams = { productGtin: "123", productName: "Test", amountCents: 5000, discountCode: "INVALID" };
      const mockError = new Error("Invalid discount code");
      vi.mocked(MerchantApi.previewPayment).mockRejectedValue(mockError);
      await expect(previewPayment(mockParams)).rejects.toThrow("Invalid discount code");
    });
  });

  describe("authPaymentBarCode", () => {
    it("should call MerchantApi.authPaymentBarCode with correct parameters", async () => {
      const mockParams = { trxCode: "TRX789", amountCents: 2500 };
      const mockResponse = { trxId: "TRX789", status: "AUTHORIZED" };
      vi.mocked(MerchantApi.authPaymentBarCode).mockResolvedValue(mockResponse as any);
      const result = await authPaymentBarCode(mockParams as any);
      expect(MerchantApi.authPaymentBarCode).toHaveBeenCalledWith(mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getProcessedTransactions", () => {
    it("should call MerchantApi.getProcessedTransactions with correct parameters", async () => {
      const initiativeId = "INIT1";
      const pointOfSaleId = "POS1";
      const mockParams = { page: 1, size: 10 };
      const mockResponse = { transactions: [], totalElements: 0 };
      vi.mocked(MerchantApi.getProcessedTransactions).mockResolvedValue(mockResponse as any);
      const result = await getProcessedTransactions(initiativeId, pointOfSaleId, mockParams as any);
      expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith(initiativeId, pointOfSaleId, mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPointOfSaleDetails", () => {
    it("should call MerchantApi.getPointOfSaleDetails with correct parameters", async () => {
      const merchantId = "M1";
      const pointOfSaleId = "P1";
      const mockResponse = { id: "123", city: "Rome" };
      vi.mocked(MerchantApi.getPointOfSaleDetails).mockResolvedValue(mockResponse);
      const result = await getPointOfSaleDetails(merchantId, pointOfSaleId);
      expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledWith(merchantId, pointOfSaleId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("capturePayment", () => {
    const params = { trxCode: "TRX123", additionalProperties: { test: "ok" } };
    const mockResponse = { trxCode: "TRX123", status: "CAPTURED" };

    it("should call MerchantApi.capturePayment with correct params", async () => {
      vi.mocked(MerchantApi.capturePayment).mockResolvedValue(mockResponse as any);
      const result = await capturePayment(params);
      expect(MerchantApi.capturePayment).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from MerchantApi.capturePayment", async () => {
      const mockError = new Error("Capture failed");
      vi.mocked(MerchantApi.capturePayment).mockRejectedValue(mockError);
      await expect(capturePayment(params)).rejects.toThrow("Capture failed");
    });
  });

  describe("getInProgressTransactions", () => {
    const initiativeId = "initId123";
    const pointOfSaleId = "posId456";
    const params = { page: 0, size: 10, sort: "date,desc", fiscalCode: "RSSGNR", status: "IN_PROGRESS" };
    const mockTransactions = { content: [{ id: "trx1" }], totalElements: 1 };

    it("should call MerchantApi.getInProgressTransactions with correct parameters", async () => {
      mockGetInProgressTransactions.mockResolvedValue(mockTransactions);
      const result = await getInProgressTransactions(initiativeId, pointOfSaleId, params);
      expect(mockGetInProgressTransactions).toHaveBeenCalledWith(initiativeId, pointOfSaleId, params);
      expect(result).toEqual(mockTransactions);
    });

    it("should propagate errors", async () => {
      const mockError = new Error("Fetch failed");
      mockGetInProgressTransactions.mockRejectedValue(mockError);
      await expect(getInProgressTransactions(initiativeId, pointOfSaleId, params)).rejects.toThrow("Fetch failed");
    });
  });

  describe("deleteTransactionInProgress", () => {
    const trxId = "TRX_TO_DELETE";

    it("should call MerchantApi.deleteTransactionInProgress with correct ID", async () => {
      mockDeleteTransactionInProgress.mockResolvedValue(undefined);
      await expect(deleteTransactionInProgress(trxId)).resolves.toBeUndefined();
      expect(mockDeleteTransactionInProgress).toHaveBeenCalledWith(trxId);
    });

    it("should propagate errors", async () => {
      const mockError = new Error("Deletion failed");
      mockDeleteTransactionInProgress.mockRejectedValue(mockError);
      await expect(deleteTransactionInProgress(trxId)).rejects.toThrow("Deletion failed");
    });
  });

  describe("getPreviewPdf", () => {
    const trxId = "TRX_PREVIEW_001";

    it("should call MerchantApi.getPreviewPdf with correct trxId", async () => {
      const mockResponse = { data: "base64pdfdata" };
      vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue(mockResponse);
      const result = await getPreviewPdf(trxId);
      expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith(trxId);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors", async () => {
      const mockError = new Error("PDF not found");
      vi.mocked(MerchantApi.getPreviewPdf).mockRejectedValue(mockError);
      await expect(getPreviewPdf(trxId)).rejects.toThrow("PDF not found");
    });
  });
});
