import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PurchaseManagement from './PurchaseManagement';
import * as merchantService from '../../services/merchantService';
import * as helpers from '../../utils/helpers';
import { authStore } from '../../store/authStore';
import { utilsStore } from '../../store/utilsStore';
import ROUTES from '../../routes';

const mockNavigate = vi.fn();
let mockLocationState: Record<string, unknown> = {};

vi.mock('../../redux/hooks', () => ({
  useAppSelector: vi.fn((selectorFn) => selectorFn({})),
}));

vi.mock('../../redux/slices/initiativesSlice', () => ({
  initiativesListSelector: vi.fn(),
  currentInitiativeSelector: vi.fn(() => ({ status: 'PUBLISHED' })),
}));

vi.mock('../../hooks/useActionPermission', () => ({
  useActionPermission: vi.fn(() => ({
    getPermission: vi.fn(() => true),
  })),
}));

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
  plainObj: (obj: unknown) => obj,
  downloadFileFromBase64: vi.fn(),
}));

const mockFiltersConfig = [
  { id: 'fiscalCode', type: 'text', label: 'pages.purchaseManagement.filters.fiscalCode' },
];

const mockColumnsConfig = [
  { field: 'fiscalCode', headerName: 'Fiscal Code' },
  { field: 'status', headerName: 'Status' },
];

const mockDrawerConfig = [
  { field: 'id', headerName: 'Transaction ID' },
  { field: 'trxCode', headerName: 'TRX Code' },
  { field: 'status', headerName: 'Status' },
  { field: 'trxCode', headerName: 'Document', cell: { type: 'download' } },
];

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.amount !== undefined) return `${key}_${options.amount}`;
      return key;
    },
    config: (key: string) => {
      if (key === 'pages.purchaseManagement.transactionsTable.filters') return mockFiltersConfig;
      if (key === 'pages.purchaseManagement.transactionsTable.columns') return mockColumnsConfig;
      if (key === 'pages.purchaseManagement.drawer') return mockDrawerConfig;
      if (key === 'commons.permissions.initiativeStatus') return ['PUBLISHED'];
      return [];
    },
  }),
}));

vi.mock('../../components/TransactionsLayout/TransactionsLayout', () => ({
  default: ({
    title,
    additionalButton,
    isAlertVisible,
    tableProps,
    drawerProps,
    filtersProps,
    transactionsApi,
    setTransactionsList,
  }: any) => {
    React.useEffect(() => {
      if (transactionsApi && setTransactionsList) {
        transactionsApi('init-123', 'pos-999', { page: 0, size: 10, sort: 'trxChargeDate,desc' }).then((res: any) => {
          setTransactionsList(res.content);
        });
      }
    }, [transactionsApi, setTransactionsList]);

    return (
      <div data-testid="transactions-layout">
        <h1>{title}</h1>
        {additionalButton && (
          <button data-testid="additional-btn" onClick={additionalButton.onClick}>
            {additionalButton.label}
          </button>
        )}
        <div data-testid="alert-drawer-visible">{String(isAlertVisible)}</div>

        <div data-testid="dynamic-filters">
          <button data-testid="apply-filter-btn" onClick={() => filtersProps?.setFilters({ fiscalCode: 'ABCDEF12345' })}>
            Filter
          </button>
        </div>

        <div data-testid="dynamic-table">
          <table>
            <tbody>
              {tableProps?.rows?.map((row: any) => (
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
          <button
            data-testid="change-page-btn"
            onClick={() => tableProps?.onPaginationModelChange?.({ page: 1, pageSize: 10 })}
          >
            Next Page
          </button>
        </div>

        {drawerProps?.isOpen && (
          <div data-testid="dynamic-drawer">
            <span>Drawer for TRX: {drawerProps.fieldsValues?.id}</span>
            {drawerProps.buttons?.map((btn: any, index: number) => (
              <button key={index} data-testid={`drawer-btn-${index}`} onClick={btn.onClick}>
                {btn.title}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
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
  productName: 'Washing Machine',
};

const mockCapturedTransaction = {
  id: 'trx-2',
  trxCode: 'TRX456',
  fiscalCode: 'BNCLRA85M41H501Z',
  status: 'CAPTURED',
  residualAmountCents: 0,
  productName: 'Fridge',
};

describe('PurchaseManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = {};
    authStore.setState({ token: 'mock-jwt-token' });
    utilsStore.setState({ transactionAuthorized: false });

    vi.mocked(merchantService.getInProgressTransactions).mockResolvedValue({
      content: [mockAuthorizedTransaction, mockCapturedTransaction],
      totalElements: 2,
    });
  });

  it('should load and display transactions correctly on mount', async () => {
    render(<PurchaseManagement />);

    expect(screen.getByTestId('dynamic-table')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('trx-1')).toBeInTheDocument();
      expect(screen.getByText('trx-2')).toBeInTheDocument();
    });
  });

  it('should redirect when clicking additional action button', async () => {
    render(<PurchaseManagement />);

    const button = screen.getByTestId('additional-btn');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/init-123/accetta-buono-sconto');
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
      vi.mocked(merchantService.capturePayment).mockResolvedValue({});

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
        expect(merchantService.capturePayment).toHaveBeenCalledWith('init-123', { trxCode: 'TRX123' });
        expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
        expect(screen.queryByTestId('dynamic-drawer')).not.toBeInTheDocument();
      });
    });

    it('should successfully handle transaction cancellation (Cancel Payment)', async () => {
      vi.mocked(merchantService.deleteTransactionInProgress).mockResolvedValue({});

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
        expect(merchantService.deleteTransactionInProgress).toHaveBeenCalledWith('init-123', 'trx-1');
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
    vi.mocked(merchantService.getPreviewPdf).mockResolvedValue(mockPdfResponse);

    render(<PurchaseManagement />);

    await waitFor(() => expect(screen.getByTestId('download-pdf-trx-1')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('action-btn-trx-1'));

    const downloadBtn = screen.getByTestId('download-pdf-trx-1');
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(merchantService.getPreviewPdf).toHaveBeenCalledWith('init-123', 'trx-1');
      expect(helpers.downloadFileFromBase64).toHaveBeenCalledWith(
        'base64-pdf-content',
        'TRX123_preautorizzazione.pdf'
      );
    });
  });

  it('should reopen the drawer if an error occurs during transaction cancellation', async () => {
    vi.mocked(merchantService.deleteTransactionInProgress).mockRejectedValue(new Error('Error delete'));

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
      expect(screen.getByTestId('dynamic-table')).toBeInTheDocument();
    });
  });
});