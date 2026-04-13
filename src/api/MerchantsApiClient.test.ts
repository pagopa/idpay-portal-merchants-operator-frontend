import { describe, it, expect, vi, afterEach } from 'vitest';
const mockGet = vi.fn();
const mockPut = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('./generated/Products', () => ({
  Products: class {
    setSecurityData = vi.fn();
    getProducts = (params: Record<string, unknown>) =>
      mockGet('/products', {
        params: Object.fromEntries(
          Object.entries(params || {}).filter(([, v]) => v !== undefined)
        ),
      });
  },
}));

vi.mock('./generated/Transactions', () => ({
  Transactions: class {
    setSecurityData = vi.fn();
    previewPayment = (code: string, body: Record<string, unknown>) =>
      mockPut(`/transactions/bar-code/${code}/preview`, body);
    authPaymentBarCode = (trxCode: string, body: Record<string, unknown>) =>
      mockPut(`/transactions/bar-code/${trxCode}/authorize`, body);
    capturePayment = (trxCode: string) =>
      mockPut(`/transactions/bar-code/${trxCode}/capture`, { trxCode });
    deleteTransaction = (trxCode: string) =>
      mockDelete(`/transactions/${trxCode}`);
    reversalTransaction = (trxCode: string) =>
      mockPost(`/transactions/${trxCode}/reversal`, new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    reversalTransactionInvoiced = (trxCode: string) =>
      mockPost(`/transactions/${trxCode}/reversal-invoiced`, new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    invoiceTransaction = (trxCode: string, body: Record<string, unknown>) =>
      mockPost(`/transactions/${trxCode}/invoice`, body);
    updateInvoiceTransaction = (trxCode: string, body: Record<string, unknown>) =>
      mockPut(`/transactions/${trxCode}/invoice/update`, body);
    getTransactionPreviewPdf = (trxCode: string) =>
      mockGet(`/transactions/${trxCode}/preview-pdf`);
  },
}));

vi.mock('./generated/Initiatives', () => ({
  Initiatives: class {
    setSecurityData = vi.fn();
    getPointOfSaleTransactions = (
      initiativeId: string,
      pointOfSaleId: string,
      params: Record<string, unknown>
    ) =>
      mockGet(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions`,
        { params }
      );
    getPointOfSaleTransactionsProcessed = (
      initiativeId: string,
      pointOfSaleId: string,
      params: Record<string, unknown>
    ) =>
      mockGet(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`,
        { params }
      );
  },
}));

vi.mock('./generated/MerchantId', () => ({
  MerchantId: class {
    setSecurityData = vi.fn();
    getPointOfSale = (merchantId: string, pointOfSaleId: string) =>
      mockGet(`/${merchantId}/point-of-sales/${pointOfSaleId}`);
  },
}));

vi.mock('./generated/PointOfSaleId', () => ({
  PointOfSaleId: class {
    setSecurityData = vi.fn();
    downloadInvoiceFile = (pointOfSaleId: string, trxId: string) =>
      mockGet(`${pointOfSaleId}/transactions/${trxId}/download`);
  },
}));

vi.mock('../store/authStore', () => ({
  authStore: {
    getState: vi.fn(() => ({ token: 'mocked_token' })),
  },
}));

import { MerchantApi } from './MerchantsApiClient';

describe('MerchantApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should call GET /products with correct parameters', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getProducts({
        page: 1,
        size: 10,
        status: 'ACTIVE',
        eprelCode: undefined,
      });

      expect(mockGet).toHaveBeenCalledWith('/products', {
        params: {
          page: 1,
          size: 10,
          status: 'ACTIVE',
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if API fails', async () => {
      mockGet.mockRejectedValue(new Error('API Error'));

      await expect(MerchantApi.getProducts({})).rejects.toThrow('API Error');
    });
  });

  describe('previewPayment', () => {
    it('should call PUT /transactions/bar-code/:code/preview with correct payload', async () => {
      const mockData = {
        productGtin: '123456789',
        productName: 'Test Product',
        amountCents: 1000,
        discountCode: 'DISCOUNT123',
      };
      const mockResponse = { data: { previewed: true } };
      mockPut.mockResolvedValue(mockResponse);

      const result = await MerchantApi.previewPayment(mockData);

      expect(mockPut).toHaveBeenCalledWith(
        `/transactions/bar-code/${mockData.discountCode}/preview`,
        {
          productGtin: mockData.productGtin,
          productName: mockData.productName,
          amountCents: mockData.amountCents,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('authPaymentBarCode', () => {
    it('should call PUT /transactions/bar-code/:trxCode/authorize', async () => {
      const params = {
        trxCode: 'TRX123',
        amountCents: 500,
        additionalProperties: {},
      };
      const mockResponse = { data: { authorized: true } };
      mockPut.mockResolvedValue(mockResponse);

      const result = await MerchantApi.authPaymentBarCode(params);

      expect(mockPut).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/authorize`,
        {
          amountCents: params.amountCents,
          idTrxAcquirer: undefined,
          additionalProperties: params.additionalProperties,
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('capturePayment', () => {
    it('should perform a PUT on /transactions/bar-code/:trxCode/capture with payload', async () => {
      const params = {
        trxCode: 'CAPT_TRX_123',
        additionalProperties: {
          testKey: 'testValue',
        },
      };

      const mockResponseData = {
        transaction: { id: params.trxCode, status: 'CAPTURED' },
      };
      const mockResponse = { data: mockResponseData };

      mockPut.mockResolvedValue(mockResponse);

      const result = await MerchantApi.capturePayment(params);

      expect(mockPut).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/capture`,
        { trxCode: params.trxCode }
      );

      expect(result).toEqual(mockResponseData);
    });

    it('should propagate error in case of rejected Promise', async () => {
      const params = {
        trxCode: 'FAIL_TRX_400',
        additionalProperties: {},
      };

      const apiError = new Error('400 Bad Request: Capture Failed');

      mockPut.mockRejectedValue(apiError);

      const promise = MerchantApi.capturePayment(params);

      await expect(promise).rejects.toThrow('400 Bad Request: Capture Failed');

      expect(mockPut).toHaveBeenCalledWith(
        `/transactions/bar-code/${params.trxCode}/capture`,
        { trxCode: params.trxCode }
      );
    });
  });

  describe('getInProgressTransactions', () => {
    const initiativeId = 'INIT_TEST';
    const pointOfSaleId = 'POS_TEST';
    const mockSuccessResponse = {
      data: {
        transactions: [{ id: 'trx1' }],
        total: 1,
      },
    };

    it('should make a GET with all parameters ', async () => {
      const queryParams = {
        page: 1,
        size: 10,
        sort: 'DESC',
        fiscalCode: 'RSSGNN80A01H501E',
        status: 'PENDING',
        productGtin: '1234567890123',
      };

      mockGet.mockResolvedValue(mockSuccessResponse);

      const result = await MerchantApi.getInProgressTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      expect(mockGet).toHaveBeenCalledWith(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions`,
        { params: queryParams }
      );

      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should propagate error in case of rejected Promise', async () => {
      const queryParams = { page: 0 };
      const apiError = new Error('500 Internal Server Error');

      mockGet.mockRejectedValue(apiError);

      const promise = MerchantApi.getInProgressTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      await expect(promise).rejects.toThrow('500 Internal Server Error');

      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPointOfSaleDetails', () => {
    it('should call GET with correct initiative and pointOfSale IDs', async () => {
      const merchantId = 'MI123';
      const pointOfSaleId = 'POS456';
      const mockResponse = { data: { transactions: [], total: 0 } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getPointOfSaleDetails(merchantId, pointOfSaleId);

      expect(mockGet).toHaveBeenCalledWith(
        `/${merchantId}/point-of-sales/${pointOfSaleId}`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an errore when API call fail', async () => {
      const merchantId = 'MI123';
      const pointOfSaleId = 'POS456';
      const apiError = new Error('404 Not Found from API');

      mockGet.mockRejectedValue(apiError);

      const promise = MerchantApi.getPointOfSaleDetails(merchantId, pointOfSaleId);

      await expect(promise).rejects.toThrow('404 Not Found from API');

      expect(mockGet).toHaveBeenCalledWith(
        `/${merchantId}/point-of-sales/${pointOfSaleId}`
      );
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProcessedTransactions', () => {
    it('should call GET with correct initiative and pointOfSale IDs', async () => {
      const initiativeId = 'INIT123';
      const pointOfSaleId = 'POS456';
      const queryParams = {
        page: 1,
        size: 10,
      };
      const mockResponse = { data: { transactions: [], total: 0 } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      expect(mockGet).toHaveBeenCalledWith(
        `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`,
        { params: queryParams }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an errore when API call fail', async () => {
      const initiativeId = 'INIT123';
      const pointOfSaleId = 'POS456';
      const queryParams = {
        page: 1,
        size: 10,
      };
      const apiError = new Error('404 Not Found from API');

      mockGet.mockRejectedValue(apiError);

      const promise = MerchantApi.getProcessedTransactions(
        initiativeId,
        pointOfSaleId,
        queryParams
      );

      await expect(promise).rejects.toThrow('404 Not Found from API');
    });
  });

  describe('invoiceTransactionApi', () => {
    it('should call POST /transactions/:trxID/invoice with correct payload', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxID = '123456789';

      const mockResponse = { data: {}, status: 204 };
      mockPost.mockResolvedValue(mockResponse);

      const result = await MerchantApi.invoiceTransactionApi(trxID, testFile, 'DOC789');

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw an errore when API call fail', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = '123456789';

      const apiError = new Error('404 Not Found from API');
      mockPost.mockRejectedValue(apiError);

      await expect(MerchantApi.invoiceTransactionApi(trxId, testFile)).rejects.toThrow(
        '404 Not Found from API'
      );
    });
  });

  describe('updateInvoiceTransactionApi', () => {
    it('should call PUT /transactions/:trxId/invoice/update with correct payload', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = '123456789';
      const docNumber = 'DOC789';

      const mockResponse = { data: {}, status: 204 };
      mockPut.mockResolvedValue(mockResponse);

      const result = await MerchantApi.updateInvoiceTransactionApi(trxId, testFile, docNumber);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw an error when API call fails', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = '123456789';
      const docNumber = 'DOC789';

      const apiError = new Error('404 Not Found from API');
      mockPut.mockRejectedValue(apiError);

      await expect(
        MerchantApi.updateInvoiceTransactionApi(trxId, testFile, docNumber)
      ).rejects.toThrow('404 Not Found from API');

      expect(mockPut).toHaveBeenCalledTimes(1);
    });

    it('should handle FormData with file and docNumber', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'updated_invoice.pdf');
      const trxId = 'UPDATE_TRX_001';
      const docNumber = 'DOC_UPDATE_123';

      const mockResponse = { data: { updated: true }, status: 200 };
      mockPut.mockResolvedValue(mockResponse);

      const result = await MerchantApi.updateInvoiceTransactionApi(trxId, testFile, docNumber);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('reverseTransactionApi', () => {
    it('should call POST /transactions/:trxId/reversal with correct payload (FormData + multipart header)', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxID = '123456789';
      const docNumber = 'DOC789';

      const mockResponse = { data: {}, status: 204 };
      mockPost.mockResolvedValue(mockResponse);

      const result = await MerchantApi.reverseTransactionApi(trxID, testFile, docNumber);

      expect(mockPost).toHaveBeenCalledTimes(1);

      const [url, body, config] = mockPost.mock.calls[0];

      expect(url).toBe(`/transactions/${trxID}/reversal`);
      expect(body).toBeInstanceOf(FormData);
      expect(config).toEqual({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(result).toBeUndefined();
    });

    it('should throw an error when API call fails', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = '123456789';

      const apiError = new Error('404 Not Found from API');
      mockPost.mockRejectedValue(apiError);

      await expect(MerchantApi.reverseTransactionApi(trxId, testFile, 'DOC789')).rejects.toThrow(
        '404 Not Found from API'
      );
    });
  });

  describe('downloadInvoiceFileApi', () => {
    it('should call GET :pointOfSaleId/transactions/:trxId/download and return invoiceUrl', async () => {
      const pointOfSaleId = 'POS_123';
      const trxId = 'TRX_456';
      const mockResponse = { data: { invoiceUrl: 'https://example.com/invoice.pdf' } };

      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.downloadInvoiceFileApi(pointOfSaleId, trxId);

      expect(mockGet).toHaveBeenCalledWith(
        `${pointOfSaleId}/transactions/${trxId}/download`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should propagate error when GET fails', async () => {
      const pointOfSaleId = 'POS_123';
      const trxId = 'TRX_456';
      const apiError = new Error('Download failed');

      mockGet.mockRejectedValue(apiError);

      await expect(MerchantApi.downloadInvoiceFileApi(pointOfSaleId, trxId)).rejects.toThrow(
        'Download failed'
      );
    });
  });

  describe('reverseInvoicedTransactionApi', () => {
    it('should call POST /transactions/:trxId/reversal-invoiced with FormData and multipart header', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = 'TRX_INV_001';
      const docNumber = 'DOC_INV_001';

      const mockResponse = { data: {}, status: 204 };
      mockPost.mockResolvedValue(mockResponse);

      const result = await MerchantApi.reverseInvoicedTransactionApi(trxId, testFile, docNumber);

      const [url, body, config] = mockPost.mock.calls[0];

      expect(url).toBe(`/transactions/${trxId}/reversal-invoiced`);
      expect(body).toBeInstanceOf(FormData);
      expect(config).toEqual({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      expect(result).toBeUndefined();
    });

    it('should propagate error when API call fails', async () => {
      const blobPart = [new Blob()];
      const testFile = new File(blobPart, 'fileName');
      const trxId = 'TRX_INV_002';
      const apiError = new Error('Reversal-invoiced failed');

      mockPost.mockRejectedValue(apiError);

      await expect(
        MerchantApi.reverseInvoicedTransactionApi(trxId, testFile, 'DOC789')
      ).rejects.toThrow('Reversal-invoiced failed');
    });
  });

  describe('deleteTransactionInProgress', () => {
    it('should call DELETE /transactions/:trxId with correct transaction ID', async () => {
      const trxId = 'TRX_TO_DELETE_789';

      const mockResponse = { data: {}, status: 204 };
      mockDelete.mockResolvedValue(mockResponse);

      await expect(MerchantApi.deleteTransactionInProgress(trxId)).resolves.toBeUndefined();

      expect(mockDelete).toHaveBeenCalledWith(`/transactions/${trxId}`);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw error if API fails during deletion', async () => {
      const trxId = 'FAIL_ID_101';
      const apiError = new Error('DELETE API Error');
      mockDelete.mockRejectedValue(apiError);

      await expect(MerchantApi.deleteTransactionInProgress(trxId)).rejects.toThrow(
        'DELETE API Error'
      );
      expect(mockDelete).toHaveBeenCalledWith(`/transactions/${trxId}`);
    });
  });

  describe('getPreviewPdf', () => {
    const trxId = 'TRX_PREVIEW_001';

    it('should call GET /transactions/:trxId/preview-pdf and return correct data', async () => {
      const mockResponse = { data: 'base64pdfdata' };
      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getPreviewPdf(trxId);

      expect(mockGet).toHaveBeenCalledWith(`/transactions/${trxId}/preview-pdf`);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty trxId gracefully', async () => {
      const mockResponse = { data: '' };
      mockGet.mockResolvedValue(mockResponse);

      const result = await MerchantApi.getPreviewPdf('');

      expect(mockGet).toHaveBeenCalledWith(`/transactions//preview-pdf`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error if API call fails', async () => {
      const apiError = new Error('PDF not found');
      mockGet.mockRejectedValue(apiError);

      await expect(MerchantApi.getPreviewPdf(trxId)).rejects.toThrow('PDF not found');
      expect(mockGet).toHaveBeenCalledWith(`/transactions/${trxId}/preview-pdf`);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
