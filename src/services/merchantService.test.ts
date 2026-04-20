import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  updateInvoiceTransactionApi,
  getPreviewPdf,
  reverseInvoicedTransactionApi,
} from './merchantService';
import { MerchantApi } from '../api/MerchantsApiClient';

vi.mock('../api/MerchantsApiClient', () => ({
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
    reverseInvoicedTransactionApi: vi.fn(),
    invoiceTransactionApi: vi.fn(),
    updateInvoiceTransactionApi: vi.fn(),
    getPreviewPdf: vi.fn(),
  },
}));

describe('merchantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProductsList delegates to MerchantApi.getProducts', async () => {
    const response = { products: [], total: 0 };
    vi.mocked(MerchantApi.getProducts).mockResolvedValue(response as never);

    const result = await getProductsList({} as never);

    expect(MerchantApi.getProducts).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('previewPayment delegates correctly', async () => {
    const params = {
      productGtin: '1',
      productName: 'Test',
      amountCents: 100,
      discountCode: 'DISC',
    };
    const response = { trxId: 'T1', finalAmount: 90 };

    vi.mocked(MerchantApi.previewPayment).mockResolvedValue(response as never);

    const result = await previewPayment(params);

    expect(MerchantApi.previewPayment).toHaveBeenCalledWith(params);
    expect(result).toEqual(response);
  });

  it('authPaymentBarCode enriches payload with uuid and defaults', async () => {
    const response = { trxId: 'TRX', status: 'AUTHORIZED' };
    vi.mocked(MerchantApi.authPaymentBarCode).mockResolvedValue(response as never);

    const result = await authPaymentBarCode({
      trxCode: 'TRX',
      amountCents: 1000,
    });

    const callArg = vi.mocked(MerchantApi.authPaymentBarCode).mock.calls[0][0];

    expect(callArg).toMatchObject({
      trxCode: 'TRX',
      amountCents: 1000,
    });
    expect(typeof callArg.idTrxAcquirer).toBe('string');
    expect(callArg.additionalProperties).toEqual({});

    expect(result).toEqual(response);
  });

  it('capturePayment delegates correctly', async () => {
    const response = { trxCode: 'T1', status: 'CAPTURED' };
    vi.mocked(MerchantApi.capturePayment).mockResolvedValue(response as never);

    const result = await capturePayment({ trxCode: 'T1' });

    expect(MerchantApi.capturePayment).toHaveBeenCalledWith({ trxCode: 'T1' });
    expect(result).toEqual(response);
  });

  it('deleteTransactionInProgress delegates correctly', async () => {
    vi.mocked(MerchantApi.deleteTransactionInProgress).mockResolvedValue(undefined as never);

    await expect(deleteTransactionInProgress('ID')).resolves.toBeUndefined();
    expect(MerchantApi.deleteTransactionInProgress).toHaveBeenCalledWith('ID');
  });

  it('getProcessedTransactions delegates correctly', async () => {
    const response = { transactions: [], totalElements: 0 };
    vi.mocked(MerchantApi.getProcessedTransactions).mockResolvedValue(response as never);

    const result = await getProcessedTransactions('I', 'P', {} as never);

    expect(MerchantApi.getProcessedTransactions).toHaveBeenCalledWith('I', 'P', {});
    expect(result).toEqual(response);
  });

  it('getInProgressTransactions delegates correctly', async () => {
    const response = { content: [], totalElements: 0 };
    vi.mocked(MerchantApi.getInProgressTransactions).mockResolvedValue(response as never);

    const result = await getInProgressTransactions('I', 'P', {} as never);

    expect(MerchantApi.getInProgressTransactions).toHaveBeenCalledWith('I', 'P', {});
    expect(result).toEqual(response);
  });

  it('getPointOfSaleDetails delegates correctly', async () => {
    const response = { id: '1' };
    vi.mocked(MerchantApi.getPointOfSaleDetails).mockResolvedValue(response as never);

    const result = await getPointOfSaleDetails('M', 'P');

    expect(MerchantApi.getPointOfSaleDetails).toHaveBeenCalledWith('M', 'P');
    expect(result).toEqual(response);
  });

  it('downloadInvoiceFileApi delegates correctly', async () => {
    const response = { invoiceUrl: 'url' };
    vi.mocked(MerchantApi.downloadInvoiceFileApi).mockResolvedValue(response as never);

    const result = await downloadInvoiceFileApi('P', 'T');

    expect(MerchantApi.downloadInvoiceFileApi).toHaveBeenCalledWith('P', 'T');
    expect(result).toEqual(response);
  });

  it('reverseTransactionApi delegates correctly', async () => {
    const file = new File([new Blob()], 'f');
    vi.mocked(MerchantApi.reverseTransactionApi).mockResolvedValue(undefined as never);

    await expect(reverseTransactionApi('T', file, 'DOC')).resolves.toBeUndefined();
    expect(MerchantApi.reverseTransactionApi).toHaveBeenCalledWith('T', file, 'DOC');
  });

  it('reverseInvoicedTransactionApi delegates correctly', async () => {
    const file = new File([new Blob()], 'f');
    vi.mocked(MerchantApi.reverseInvoicedTransactionApi).mockResolvedValue(undefined as never);

    await expect(reverseInvoicedTransactionApi('T', file, 'DOC')).resolves.toBeUndefined();
    expect(MerchantApi.reverseInvoicedTransactionApi).toHaveBeenCalledWith('T', file, 'DOC');
  });

  it('invoiceTransactionApi delegates correctly', async () => {
    const file = new File([new Blob()], 'f');
    vi.mocked(MerchantApi.invoiceTransactionApi).mockResolvedValue(undefined as never);

    await expect(invoiceTransactionApi('T', file, 'DOC')).resolves.toBeUndefined();
    expect(MerchantApi.invoiceTransactionApi).toHaveBeenCalledWith('T', file, 'DOC');
  });

  it('updateInvoiceTransactionApi delegates correctly', async () => {
    const file = new File([new Blob()], 'f');
    vi.mocked(MerchantApi.updateInvoiceTransactionApi).mockResolvedValue(undefined as never);

    await expect(updateInvoiceTransactionApi('T', file, 'DOC')).resolves.toBeUndefined();
    expect(MerchantApi.updateInvoiceTransactionApi).toHaveBeenCalledWith('T', file, 'DOC');
  });

  it('getPreviewPdf returns empty string when API returns no data', async () => {
    vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue({} as never);

    const result = await getPreviewPdf('T');

    expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith('T');
    expect(result).toEqual({ data: '' });
  });

  it('getPreviewPdf returns base64 when API already returns a base64 string', async () => {
    vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue({ data: 'BASE64PDF' } as never);

    const result = await getPreviewPdf('T');

    expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith('T');
    expect(result).toEqual({ data: 'BASE64PDF' });
  });

  it('getPreviewPdf converts Blob-like (arrayBuffer()) to base64', async () => {
    const mockBlobLike = {
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    };

    vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue({ data: mockBlobLike } as never);

    const result = await getPreviewPdf('T');

    expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith('T');
    expect(typeof result.data).toBe('string');
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('getPreviewPdf converts file-like (arrayBuffer()) to base64', async () => {
    const mockFileLike = {
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    };

    vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue({ data: mockFileLike } as never);

    const result = await getPreviewPdf('T');

    expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith('T');
    expect(typeof result.data).toBe('string');
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('getPreviewPdf returns empty string for unknown data shape', async () => {
    vi.mocked(MerchantApi.getPreviewPdf).mockResolvedValue({ data: { foo: 'bar' } } as never);

    const result = await getPreviewPdf('T');

    expect(MerchantApi.getPreviewPdf).toHaveBeenCalledWith('T');
    expect(result).toEqual({ data: '' });
  });
});
