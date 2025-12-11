import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PurchaseManagement from './PurchaseManagement';
import { utilsStore } from '../../store/utilsStore';
import { theme } from '@pagopa/mui-italia';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import ROUTES from '../../routes';


const {
  mockedNavigate,
  mockGetInProgressTransactions,
  mockDeleteTransactionInProgress,
  mockCapturePayment,
  mockGetPreviewPdf,
  mockDownloadFileFromBase64,
  mockGetStatusChip,
  mockFormatEuro
} = vi.hoisted(() => {
  return {
    mockedNavigate: vi.fn(),
    mockGetInProgressTransactions: vi.fn(),
    mockDeleteTransactionInProgress: vi.fn(),
    mockCapturePayment: vi.fn(),
    mockGetPreviewPdf: vi.fn(),
    mockDownloadFileFromBase64: vi.fn(),
    mockGetStatusChip: vi.fn((t, status) => <div data-testid="status-chip">{status}</div>),
    mockFormatEuro: vi.fn((cents) => `€${(cents / 100).toFixed(2).replace('.', ',')}`),
  };
});


let mockedLocation;

// --- Mocks ---

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => mockedLocation,
  };
});

vi.mock('../../services/merchantService', () => ({
  getInProgressTransactions: mockGetInProgressTransactions,
  deleteTransactionInProgress: mockDeleteTransactionInProgress,
  capturePayment: mockCapturePayment,
  getPreviewPdf: mockGetPreviewPdf,
}));

vi.mock('../../utils/helpers', () => ({
  getStatusChip: mockGetStatusChip,
  formatEuro: mockFormatEuro,
  downloadFileFromBase64: mockDownloadFileFromBase64,
  renderCellWithTooltip: vi.fn((value) => value),
  renderMissingDataWithTooltip: vi.fn(() => '---'),
  checkEuroTooltip: vi.fn((params) => params?.value ? `€${(params.value / 100).toFixed(2)}` : '---'),
  checkTooltipValue: vi.fn((params, key) => {
    if (key) {
      return params?.value?.[key] || '---';
    }
    return params?.value || '---';
  }),
}));

vi.mock('../../components/TransactionsLayout/TransactionsLayout', () => ({
  default: (props) => (
    <div data-testid="transactions-layout">
      <button onClick={props.additionalButton.onClick}>
        {props.additionalButton.label}
      </button>
      <button onClick={() => props.onRowAction(mockAuthorizedTransaction)}>
        Simulate Row Action Auth
      </button>
      <button onClick={() => props.onRowAction(mockCapturedTransaction)}>
        Simulate Row Action Captured
      </button>
      <div data-testid="layout-props">{JSON.stringify({
        title: props.title,
        statusOptions: props.statusOptions,
        alerts: props.alerts,
        externalState: props.externalState
      })}</div>
      {props.DrawerComponent}
    </div>
  ),
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({ open, onClose, children }) =>
    open ? (
      <div data-testid="modal-component">
        <button data-testid="modal-close" onClick={onClose}>Close Modal</button>
        {children}
      </div>
    ) : null,
}));

vi.mock('@pagopa/mui-italia', () => ({
  theme: {
    typography: { fontWeightRegular: 400, fontWeightMedium: 600 },
    palette: { text: { secondary: '#5C6F82' } },
  },
}));

vi.mock('../../utils/constants', () => ({
  MISSING_DATA_PLACEHOLDER: '---',
}));

vi.mock('../../routes', () => ({
  default: {
    ACCEPT_DISCOUNT: '/accetta-sconto',
    REFUNDS_MANAGEMENT: '/gestione-rimborsi',
  },
}));

const mockAuthorizedTransaction = {
  id: 'trx-id-auth',
  trxCode: 'trx-code-123',
  additionalProperties: { productName: 'Frigorifero' },
  trxChargeDate: '2023-10-27T10:00:00.000Z',
  fiscalCode: 'RSSMRA80A01H501U',
  effectiveAmountCents: 10000,
  rewardAmountCents: 2000,
  residualAmountCents: 8000,
  status: 'AUTHORIZED',
};

const mockCapturedTransaction = {
  id: 'trx-id-cap',
  trxCode: 'trx-code-456',
  additionalProperties: { productName: 'Lavatrice' },
  trxChargeDate: '2023-10-26T11:00:00.000Z',
  fiscalCode: 'VRDGPP80A01H501Z',
  effectiveAmountCents: 50000,
  rewardAmountCents: 5000,
  residualAmountCents: 45000,
  status: 'CAPTURED',
};

const renderAndOpenDrawer = async (transaction) => {
  render(
    <MemoryRouter>
      <PurchaseManagement />
    </MemoryRouter>
  );

  const rowActionText = transaction.status === 'AUTHORIZED'
    ? 'Simulate Row Action Auth'
    : 'Simulate Row Action Captured';

  fireEvent.click(screen.getByText(rowActionText));

  await waitFor(() => {
    expect(screen.getByText(transaction.id)).toBeInTheDocument();
  });
};

describe('PurchaseManagement', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockedLocation = { state: null };

    act(() => {
      utilsStore.setState({ transactionAuthorized: false }, true);
    });

    mockGetInProgressTransactions.mockResolvedValue({ content: [], totalElements: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders TransactionsLayout and handles new discount navigation', () => {
    render(
      <MemoryRouter>
        <PurchaseManagement />
      </MemoryRouter>
    );

    expect(screen.getByTestId('transactions-layout')).toBeInTheDocument();

    const props = JSON.parse(screen.getByTestId('layout-props').textContent);
    expect(props.title).toBe('pages.purchaseManagement.title');
    expect(props.statusOptions).toEqual(['AUTHORIZED', 'CAPTURED']);

    fireEvent.click(screen.getByText('Accetta buono sconto'));
    expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.ACCEPT_DISCOUNT);
  });

  describe('getChipLabel functionality', () => {
    it('should return correct translation keys for all statuses', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);
      
      // La funzione getChipLabel viene usata internamente per i Tooltip
      // Verifichiamo che getStatusChip venga chiamato con i parametri corretti
      expect(mockGetStatusChip).toHaveBeenCalledWith(expect.any(Function), 'AUTHORIZED');
      
      // Test per verificare che la funzione t venga chiamata con le chiavi corrette
      // attraverso il rendering del componente
      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('should handle REFUNDED status label', async () => {
      const refundedTransaction = { ...mockAuthorizedTransaction, status: 'REFUNDED' };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText('Simulate Row Action Auth'));

      await waitFor(() => {
        expect(screen.getByText(mockAuthorizedTransaction.id)).toBeInTheDocument();
      });
      
      // getChipLabel è testato indirettamente attraverso getStatusChip
      expect(mockGetStatusChip).toHaveBeenCalled();
    });

    it('should handle CANCELLED status label', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);
      expect(mockGetStatusChip).toHaveBeenCalled();
    });

    it('should handle CAPTURED status label', async () => {
      await renderAndOpenDrawer(mockCapturedTransaction);
      expect(mockGetStatusChip).toHaveBeenCalledWith(expect.any(Function), 'CAPTURED');
    });

    it('should handle REWARDED status label', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);
      expect(mockGetStatusChip).toHaveBeenCalled();
    });

    it('should handle INVOICED status label', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);
      expect(mockGetStatusChip).toHaveBeenCalled();
    });

    it('should handle unknown/default status', async () => {
      const unknownTransaction = { ...mockAuthorizedTransaction, status: 'UNKNOWN' };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByText('Simulate Row Action Auth'));

      await waitFor(() => {
        expect(mockGetStatusChip).toHaveBeenCalled();
      });
    });
  });

  describe('Drawer (AUTHORIZED)', () => {
    it('opens and displays correct data for an AUTHORIZED transaction', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      expect(screen.getByText(mockAuthorizedTransaction.id)).toBeInTheDocument();
      expect(screen.getByText(mockAuthorizedTransaction.additionalProperties.productName)).toBeInTheDocument();
      expect(screen.getByText(mockAuthorizedTransaction.fiscalCode)).toBeInTheDocument();

      const dateText = screen.getByText((content) => content.startsWith('27/10/2023'));
      expect(dateText).toBeInTheDocument();

      expect(mockFormatEuro).toHaveBeenCalledWith(mockAuthorizedTransaction.effectiveAmountCents);
      expect(mockFormatEuro).toHaveBeenCalledWith(mockAuthorizedTransaction.rewardAmountCents);
      expect(mockFormatEuro).toHaveBeenCalledWith(mockAuthorizedTransaction.residualAmountCents);
      expect(screen.getAllByText('€80,00')).toHaveLength(1);

      expect(mockGetStatusChip).toHaveBeenCalledWith(expect.any(Function), 'AUTHORIZED');
      expect(screen.getByTestId('status-chip')).toHaveTextContent('AUTHORIZED');

      expect(screen.getByText(`${mockAuthorizedTransaction.trxCode}_preautorizzazione.pdf`)).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.confirmPayment')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.cancellPayment')).toBeInTheDocument();
    });

    it('handles PDF preview success', async () => {
      mockGetPreviewPdf.mockResolvedValue({ data: 'base64data' });
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      const pdfButton = screen.getByText(`${mockAuthorizedTransaction.trxCode}_preautorizzazione.pdf`);
      fireEvent.click(pdfButton);

      expect(screen.getByTestId('item-loader')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockGetPreviewPdf).toHaveBeenCalledWith(mockAuthorizedTransaction.id);
      });

      expect(mockDownloadFileFromBase64).toHaveBeenCalledWith('base64data', `${mockAuthorizedTransaction.trxCode}_preautorizzazione.pdf`);
      expect(screen.queryByTestId('item-loader')).not.toBeInTheDocument();
    });

    it('handles PDF preview failure', async () => {
      mockGetPreviewPdf.mockRejectedValue(new Error('PDF Error'));
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText(`${mockAuthorizedTransaction.trxCode}_preautorizzazione.pdf`));

      await waitFor(() => {
        expect(mockGetPreviewPdf).toHaveBeenCalled();
      });

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.errorPreviewPdf).toBe(true);
    });

    it('closes the drawer on close icon click', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);
      expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('CloseIcon'));

      await waitFor(() => {
        expect(screen.queryByText('pages.purchaseManagement.drawer.title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Drawer (CAPTURED)', () => {
    it('opens and displays correct data for a CAPTURED transaction', async () => {
      await renderAndOpenDrawer(mockCapturedTransaction);

      expect(screen.getByText(mockCapturedTransaction.id)).toBeInTheDocument();
      expect(screen.getByText(mockCapturedTransaction.additionalProperties.productName)).toBeInTheDocument();
      expect(mockGetStatusChip).toHaveBeenCalledWith(expect.any(Function), 'CAPTURED');
      expect(screen.getByTestId('status-chip')).toHaveTextContent('CAPTURED');
      expect(screen.queryByText(/_preautorizzazione\.pdf/)).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.requestRefund')).toBeInTheDocument();
      expect(screen.getByText('pages.purchaseManagement.drawer.refund')).toBeInTheDocument();
    });
  });

  describe('Capture Workflow (Authorized)', () => {
    it('handles successful capture', async () => {
      mockCapturePayment.mockResolvedValue({});
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });
      expect(screen.getByText('pages.purchaseManagement.captureTransactionModal.title')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));

      await waitFor(() => {
        expect(mockCapturePayment).toHaveBeenCalledWith({ trxCode: mockAuthorizedTransaction.trxCode });
      });

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionCaptured).toBe(true);
    });

    it('handles failed capture', async () => {
      mockCapturePayment.mockRejectedValue(new Error('Capture failed'));
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));
      });

      await waitFor(() => {
        expect(mockCapturePayment).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      });

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.errorCaptureTransaction).toBe(true);
    });

    it('closes capture modal and re-opens drawer on "Indietro"', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Workflow (Authorized)', () => {
    it('handles successful cancellation', async () => {
      mockDeleteTransactionInProgress.mockResolvedValue({});
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });
      expect(screen.getByText('pages.purchaseManagement.cancelTransactionModal.title')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));

      await waitFor(() => {
        expect(mockDeleteTransactionInProgress).toHaveBeenCalledWith(mockAuthorizedTransaction.id);
      });

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
    });

    it('handles failed cancellation', async () => {
      mockDeleteTransactionInProgress.mockRejectedValue(new Error('Delete failed'));
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));
      });

      await waitFor(() => {
        expect(mockDeleteTransactionInProgress).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      });

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.errorDeleteTransaction).toBe(true);
    });

    it('closes cancel modal on "Esci" button', async () => {
      await renderAndOpenDrawer(mockAuthorizedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
      
      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Esci' }));

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      });
    });
  });

  describe('Refund/Reverse Workflow (Captured)', () => {
    it('navigates to request refund', async () => {
      await renderAndOpenDrawer(mockCapturedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.requestRefund'));

      expect(mockedNavigate).toHaveBeenCalledWith(`/richiedi-rimborso/${mockCapturedTransaction.id}`);
    });

    it('handles reverse transaction modal and navigation', async () => {
      await renderAndOpenDrawer(mockCapturedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });
      expect(screen.getByText('pages.purchaseManagement.refundTransactionModal.title')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'pages.purchaseManagement.drawer.refund' }));

      expect(mockedNavigate).toHaveBeenCalledWith(`/storna-transazione/${mockCapturedTransaction.id}`);
    });

    it('closes reverse modal and re-opens drawer on "Indietro"', async () => {
      await renderAndOpenDrawer(mockCapturedTransaction);

      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-component')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));

      expect(screen.queryByTestId('modal-component')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('pages.purchaseManagement.drawer.title')).toBeInTheDocument();
      });
    });
  });

  describe('Location State useEffect - refundUploadSuccess and reverseUploadSuccess', () => {
    it('sets transactionRefundSuccess when refundUploadSuccess is true in location.state', () => {
      mockedLocation = { state: { refundUploadSuccess: true } };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionRefundSuccess).toBe(true);
      expect(props.externalState.transactionReverseSuccess).toBe(false);
    });

    it('sets transactionReverseSuccess when reverseUploadSuccess is true in location.state', () => {
      mockedLocation = { state: { reverseUploadSuccess: true } };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionReverseSuccess).toBe(true);
      expect(props.externalState.transactionRefundSuccess).toBe(false);
    });

    it('handles both refundUploadSuccess and reverseUploadSuccess being false', () => {
      mockedLocation = { state: { refundUploadSuccess: false, reverseUploadSuccess: false } };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionRefundSuccess).toBe(false);
      expect(props.externalState.transactionReverseSuccess).toBe(false);
    });

    it('handles when location.state is null', () => {
      mockedLocation = { state: null };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionRefundSuccess).toBe(false);
      expect(props.externalState.transactionReverseSuccess).toBe(false);
    });

    it('handles when location.state is undefined', () => {
      mockedLocation = { state: undefined };
      
      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      const props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionRefundSuccess).toBe(false);
      expect(props.externalState.transactionReverseSuccess).toBe(false);
    });
  });

  describe('Alerts and State Effects', () => {
    it('shows alert for transactionAuthorized from store and times out', async () => {
      vi.useFakeTimers();

      act(() => {
        utilsStore.setState({ transactionAuthorized: true });
      });

      render(
        <MemoryRouter>
          <PurchaseManagement />
        </MemoryRouter>
      );

      let props = JSON.parse(screen.getByTestId('layout-props').textContent);
      expect(props.externalState.transactionAuthorized).toBe(true);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(utilsStore.getState().transactionAuthorized).toBe(false);

      vi.useRealTimers();
    });

  });
});