import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PurchaseManagement from './PurchaseManagement';
import * as merchantService from '../../services/merchantService';
import * as helpers from '../../utils/helpers';
import { authStore } from '../../store/authStore';
import { utilsStore } from '../../store/utilsStore';
import ROUTES from '../../routes';

const mockNavigate = vi.fn();
let mockLocationState: Record<string, any> = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
    useParams: () => ({ initiativeId: 'init-123' }),
    generatePath: (path: string, params: Record<string, string>) =>
      path.replace(':initiativeId', params.initiativeId || '').replace(':trxId', params.trxId || ''),
  };
});

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({ point_of_sale_id: 'pos-999' })),
}));

vi.mock('../../services/merchantService', () => ({
  getInProgressTransactions: vi.fn(),
  deleteTransactionInProgress: vi.fn(),
  capturePayment: vi.fn(),
  getPreviewPdf: vi.fn(),
}));

vi.mock('../../utils/helpers', () => ({
  formatEuro: (cents?: number) => (cents !== undefined ? `${cents / 100} €` : ''),
  normalizeObj: (obj: any) => obj,
  downloadFileFromBase64: vi.fn(),
}));

const mockFiltersConfig = [
  { id: 'fiscalCode', type: 'text', label: 'pages.purchaseManagement.filters.fiscalCode' },
  { id: 'productGtin', type: 'text', label: 'pages.purchaseManagement.filters.productGtin' },
  { id: 'trxCode', type: 'text', label: 'pages.purchaseManagement.filters.trxCode' },
  { id: 'status', type: 'select', label: 'pages.purchaseManagement.filters.status' },
];

const mockColumnsConfig = [
  { field: 'additionalProperties.productName', headerName: 'Product' },
  { field: 'fiscalCode', headerName: 'Fiscal Code' },
  { field: 'status', headerName: 'Status' },
];

const mockDrawerConfig = [
  { field: 'trxChargeDate', headerName: 'Date' },
  { field: 'fiscalCode', headerName: 'Fiscal Code' },
  { field: 'id', headerName: 'Transaction ID' },
  { field: 'trxCode', headerName: 'TRX Code' },
  { field: 'status', headerName: 'Status' },
  { field: 'trxCode', headerName: 'Document', cell: { type: 'download' } },
];

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.amount) return `${key}_${options.amount}`;
      return key;
    },
    config: (key: string) => {
      if (key === 'pages.purchaseManagement.transactionsTable.filters') return mockFiltersConfig;
      if (key === 'pages.purchaseManagement.transactionsTable.columns') return mockColumnsConfig;
      if (key === 'pages.purchaseManagement.drawer') return mockDrawerConfig;
      return [];
    },
  }),
}));

vi.mock('../../components/TransactionsLayout/TransactionsLayout', () => ({
  default: ({ children, title, additionalButton, isAlertVisible }: any) => (
    <div data-testid="transactions-layout">
      <h1>{title}</h1>
      {additionalButton && (
        <button data-testid="additional-btn" onClick={additionalButton.onClick}>
          {additionalButton.label}
        </button>
      )}
      <div data-testid="alert-drawer-visible">{String(isAlertVisible)}</div>
      {children}
    </div>
  ),
}));

vi.mock('../../components/DynamicFilters/DynamicFilters', () => ({
  DynamicFilters: ({ setFilters }: any) => (
    <div data-testid="dynamic-filters">
      <button data-testid="apply-filter-btn" onClick={() => setFilters({ fiscalCode: 'ABCDEF12345' })}>
        Filter
      </button>
    </div>
  ),
}));

vi.mock('../../components/DynamicTable/DynamicTable', () => ({
  DynamicTable: ({ rows, isLoading, onPaginationModelChange }: any) => (
    <div data-testid="dynamic-table">
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <table>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.status}</td>
                <td>
                  <button data-testid={`action-btn-${row.id}`} onClick={() => row.action.onClick(row)}>
                    Detail
                  </button>
                  <button data-testid={`download-pdf-${row.id}`} onClick={() => row.onClick()}>
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button data-testid="change-page-btn" onClick={() => onPaginationModelChange({ page: 1, pageSize: 10 })}>
        Next Page
      </button>
    </div>
  ),
}));

vi.mock('../../components/DynamicDrawer/DynamicDrawer', () => ({
  default: ({ isOpen, buttons, fieldsValues }: any) =>
    isOpen ? (
      <div data-testid="dynamic-drawer">
        <span>Drawer for TRX: {fieldsValues?.id}</span>
        {buttons?.map((btn: any, index: number) => (
          <button key={index} data-testid={`drawer-btn-${index}`} onClick={btn.onClick}>
            {btn.title}
          </button>
        ))}
      </div>
    ) : null,
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="modal-component">
        <button data-testid="close-modal-btn" onClick={onClose}>
          X
        </button>
        {children}
      </div>
    ) : null,
}));

vi.stubEnv('VITE_PAGINATION_SIZE', '10');

const mockAuthorizedTransaction = {
  id: 'trx-1',
  trxCode: 'TRX123',
  fiscalCode: 'RSSMRA80A01H501U',
  status: 'AUTHORIZED',
  residualAmountCents: 5000,
  effectiveAmountCents: 10000,
  'additionalProperties.productName': 'Washing Machine',
};

const mockCapturedTransaction = {
  id: 'trx-2',
  trxCode: 'TRX456',
  fiscalCode: 'BNCLRA85M41H501Z',
  status: 'CAPTURED',
  residualAmountCents: 0,
  effectiveAmountCents: 15000,
  'additionalProperties.productName': 'Fridge',
};

describe('PurchaseManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = {};
    authStore.setState({ token: 'mock-jwt-token' });
    utilsStore.setState({ transactionAuthorized: false });

    (merchantService.getInProgressTransactions as any).mockResolvedValue({
      content: [mockAuthorizedTransaction, mockCapturedTransaction],
      totalElements: 2,
    });
  });

  it('should load and display transactions correctly on mount', async () => {
    render(<PurchaseManagement />);

    expect(screen.getByTestId('dynamic-table')).toBeInTheDocument();

    await waitFor(() => {
      expect(merchantService.getInProgressTransactions).toHaveBeenCalledWith('init-123', 'pos-999', {
        page: 0,
        size: 10,
      });
    });

    expect(screen.getByText('trx-1')).toBeInTheDocument();
    expect(screen.getByText('trx-2')).toBeInTheDocument();
  });

  it('should redirect when clicking additional action button', async () => {
    render(<PurchaseManagement />);

    const button = screen.getByTestId('additional-btn');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/init-123/accetta-buono-sconto');
  });

  it('should update API call when new filters are applied', async () => {
    render(<PurchaseManagement />);

    await waitFor(() => expect(merchantService.getInProgressTransactions).toHaveBeenCalledTimes(1));

    const filterBtn = screen.getByTestId('apply-filter-btn');
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(merchantService.getInProgressTransactions).toHaveBeenCalledWith('init-123', 'pos-999', {
        page: 0,
        size: 10,
        fiscalCode: 'ABCDEF12345',
      });
    });
  });

  it('should update API call on pagination change', async () => {
    render(<PurchaseManagement />);

    await waitFor(() => expect(merchantService.getInProgressTransactions).toHaveBeenCalledTimes(1));

    const changePageBtn = screen.getByTestId('change-page-btn');
    fireEvent.click(changePageBtn);

    await waitFor(() => {
      expect(merchantService.getInProgressTransactions).toHaveBeenCalledWith('init-123', 'pos-999', {
        page: 1,
        size: 10,
      });
    });
  });

  describe('Interaction with AUTHORIZED transaction', () => {
    it('should open the drawer with Confirm and Cancel Payment buttons', async () => {
      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-1')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('action-btn-trx-1'));

      expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.confirmPayment')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.cancellPayment')).toBeInTheDocument();
    });

    it('should successfully handle payment capture (Confirm Payment)', async () => {
      (merchantService.capturePayment as any).mockResolvedValue({});

      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-1')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('action-btn-trx-1'));

      const confirmDrawerBtn = screen.getByTestId('drawer-btn-0');
      fireEvent.click(confirmDrawerBtn);

      expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.modal.capture.title')).toBeInTheDocument();

      const confirmModalBtn = screen.getByText('pages.purchaseManagement.modal.capture.confirmBtn');
      fireEvent.click(confirmModalBtn);

      await waitFor(() => {
        expect(merchantService.capturePayment).toHaveBeenCalledWith({ trxCode: 'TRX123' });
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
        expect(screen.queryByTestId('dynamic-drawer')).not.toBeInTheDocument();
      });
    });

    it('should successfully handle transaction cancellation (Cancel Payment)', async () => {
      (merchantService.deleteTransactionInProgress as any).mockResolvedValue({});

      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-1')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('action-btn-trx-1'));

      const cancelDrawerBtn = screen.getByTestId('drawer-btn-1');
      fireEvent.click(cancelDrawerBtn);

      expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.modal.cancel.title')).toBeInTheDocument();

      const confirmModalBtn = screen.getByText('pages.purchaseManagement.modal.cancel.confirmBtn');
      fireEvent.click(confirmModalBtn);

      await waitFor(() => {
        expect(merchantService.deleteTransactionInProgress).toHaveBeenCalledWith('trx-1');
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interaction with CAPTURED transaction', () => {
    it('should open the drawer with Request Refund and Reverse buttons', async () => {
      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-2')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('action-btn-trx-2'));

      expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.requestRefund')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.refund')).toBeInTheDocument();
    });

    it('should redirect to Refund page when clicking "Request Refund"', async () => {
      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-2')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('action-btn-trx-2'));

      const refundBtn = screen.getByTestId('drawer-btn-0');
      fireEvent.click(refundBtn);

      expect(mockNavigate).toHaveBeenCalledWith(
        ROUTES.REFUND.replace(':initiativeId', 'init-123').replace(':trxId', 'trx-2')
      );
    });

    it('should open modal and redirect to Reverse when clicking "Reverse"', async () => {
      render(<PurchaseManagement />);

      await waitFor(() => expect(screen.getByTestId('action-btn-trx-2')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('action-btn-trx-2'));

      const reverseDrawerBtn = screen.getByTestId('drawer-btn-1');
      fireEvent.click(reverseDrawerBtn);

      expect(screen.getByTestId('modal-component')).toBeInTheDocument();

      const confirmModalBtn = screen.getByText('pages.purchaseManagement.modal.reverse.confirmBtn');
      fireEvent.click(confirmModalBtn);

      expect(mockNavigate).toHaveBeenCalledWith(
        ROUTES.REVERSE.replace(':initiativeId', 'init-123').replace(':trxId', 'trx-2')
      );
    });
  });

  it('should call getPreviewPdf and downloadFileFromBase64 when clicking PDF button', async () => {
    const mockPdfResponse = { data: 'base64-pdf-content' };
    (merchantService.getPreviewPdf as any).mockResolvedValue(mockPdfResponse);

    render(<PurchaseManagement />);

    await waitFor(() => expect(screen.getByTestId('download-pdf-trx-1')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('action-btn-trx-1'));

    const downloadBtn = screen.getByTestId('download-pdf-trx-1');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(merchantService.getPreviewPdf).toHaveBeenCalledWith('trx-1');
      expect(helpers.downloadFileFromBase64).toHaveBeenCalledWith(
        'base64-pdf-content',
        'TRX123_preautorizzazione.pdf'
      );
    });
  });

  it('should handle error if getInProgressTransactions fails', async () => {
    (merchantService.getInProgressTransactions as any).mockRejectedValue(new Error('Network error'));

    render(<PurchaseManagement />);

    await waitFor(() => {
      expect(merchantService.getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it('should reopen the drawer if an error occurs during transaction cancellation', async () => {
    (merchantService.deleteTransactionInProgress as any).mockRejectedValue(new Error('Error delete'));

    render(<PurchaseManagement />);

    await waitFor(() => expect(screen.getByTestId('action-btn-trx-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('action-btn-trx-1'));

    fireEvent.click(screen.getByTestId('drawer-btn-1'));
    fireEvent.click(screen.getByText('pages.purchaseManagement.modal.cancel.confirmBtn'));

    await waitFor(() => {
      expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();
    });
  });

  it('should activate success flag if location.state contains refundUploadSuccess', async () => {
    mockLocationState = { refundUploadSuccess: true };

    render(<PurchaseManagement />);

    await waitFor(() => {
      expect(merchantService.getInProgressTransactions).toHaveBeenCalled();
    });
  });
});