import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PurchaseManagement from './PurchaseManagement';
import { utilsStore } from '../../store/utilsStore';
import ROUTES from '../../routes';

const {
  mockedNavigate,
  mockDelete,
  mockCapture,
  mockPreview,
  mockDownload,
  mockAuthorized,
  mockCaptured,
} = vi.hoisted(() => ({
  mockedNavigate: vi.fn(),
  mockDelete: vi.fn(),
  mockCapture: vi.fn(),
  mockPreview: vi.fn(),
  mockDownload: vi.fn(),
  mockAuthorized: {
    id: '1',
    trxCode: 'trx',
    additionalProperties: { productName: 'prod' },
    trxChargeDate: new Date().toISOString(),
    fiscalCode: 'AAA',
    effectiveAmountCents: 100,
    rewardAmountCents: 10,
    residualAmountCents: 90,
    status: 'AUTHORIZED',
  },
  mockCaptured: {
    id: '2',
    trxCode: 'trx2',
    additionalProperties: { productName: 'prod2' },
    trxChargeDate: new Date().toISOString(),
    fiscalCode: 'BBB',
    effectiveAmountCents: 200,
    rewardAmountCents: 20,
    residualAmountCents: 180,
    status: 'CAPTURED',
  },
}));

let mockedLocation: { state: unknown } = { state: null };

vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    disabled,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
  Drawer: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
    onClose?: () => void;
  }) => (open ? <div data-testid="drawer">{children}</div> : null),
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CircularProgress: () => <div data-testid="item-loader" />,
}));

vi.mock('@mui/icons-material/Close', () => ({
  default: ({ onClick }: { onClick?: () => void }) => (
    <div data-testid="CloseIcon" onClick={onClick} />
  ),
}));

vi.mock('@mui/icons-material/Description', () => ({
  default: () => <div />,
}));

vi.mock('@mui/icons-material/QrCode', () => ({
  default: () => <div />,
}));

vi.mock('@pagopa/mui-italia', () => ({
  theme: {
    typography: { fontWeightRegular: 400, fontWeightMedium: 600 },
    palette: { text: { secondary: '#000' } },
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => mockedLocation,
  };
});

vi.mock('../../services/merchantService', () => ({
  getInProgressTransactions: vi.fn().mockResolvedValue({ content: [], totalElements: 0 }),
  deleteTransactionInProgress: mockDelete,
  capturePayment: mockCapture,
  getPreviewPdf: mockPreview,
}));

vi.mock('../../utils/helpers', () => ({
  getStatusChip: vi.fn((_, status: string) => <div data-testid="status-chip">{status}</div>),
  formatEuro: vi.fn((v: number) => `€${v}`),
  downloadFileFromBase64: mockDownload,
  checkEuroTooltip: vi.fn((p: { value?: number }) =>
    p?.value !== undefined ? `€${p.value}` : '---'
  ),
  checkTooltipValue: vi.fn((p: { value?: unknown }) => p?.value ?? '---'),
  checkDateTooltip: vi.fn(() => 'date'),
}));

vi.mock('../../components/TransactionsLayout/TransactionsLayout', () => ({
  default: (props: {
    additionalButton: { onClick: () => void };
    onRowAction: (row: unknown) => void;
    externalState: unknown;
    DrawerComponent: React.ReactNode;
  }) => (
    <div data-testid="layout">
      <button data-testid="btn-add" onClick={props.additionalButton.onClick}>
        add
      </button>
      <button data-testid="btn-auth" onClick={() => props.onRowAction(mockAuthorized)}>
        auth
      </button>
      <button data-testid="btn-cap" onClick={() => props.onRowAction(mockCaptured)}>
        cap
      </button>
      <div data-testid="external">{JSON.stringify(props.externalState)}</div>
      {props.DrawerComponent}
    </div>
  ),
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({
    open,
    children,
    onClose,
  }: {
    open: boolean;
    children: React.ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="modal">
        <button data-testid="modal-close" onClick={onClose}>
          close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('./purchaseManagement.module.css', () => ({ default: { cursorPointer: '' } }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PurchaseManagement />
    </MemoryRouter>
  );

const openAuthorizedDrawer = async () => {
  fireEvent.click(screen.getByTestId('btn-auth'));
  await waitFor(() => expect(screen.getByTestId('drawer')).toBeInTheDocument());
};

const openCapturedDrawer = async () => {
  fireEvent.click(screen.getByTestId('btn-cap'));
  await waitFor(() => expect(screen.getByTestId('drawer')).toBeInTheDocument());
};

describe('PurchaseManagement coverage completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLocation = { state: null };
    vi.useRealTimers();
    act(() => {
      utilsStore.setState({ ...utilsStore.getState(), transactionAuthorized: false });
    });
  });

  it('navigates to accept discount', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('btn-add'));
    expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.ACCEPT_DISCOUNT);
  });

  it('renders AUTHORIZED drawer branch', async () => {
    renderPage();
    await openAuthorizedDrawer();
    expect(screen.getByTestId('status-chip')).toHaveTextContent('AUTHORIZED');
  });

  it('renders CAPTURED drawer branch', async () => {
    renderPage();
    await openCapturedDrawer();
    expect(screen.getByTestId('status-chip')).toHaveTextContent('CAPTURED');
  });

  it('closes drawer via CloseIcon', async () => {
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByTestId('CloseIcon'));
    await waitFor(() => expect(screen.queryByTestId('drawer')).not.toBeInTheDocument());
  });

  it('covers capture success branch', async () => {
    mockCapture.mockResolvedValue({});
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => expect(mockCapture).toHaveBeenCalled());
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionCaptured).toBe(true);
  });

  it('covers capture error branch — reopens drawer', async () => {
    mockCapture.mockRejectedValue(new Error());
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorCaptureTransaction).toBe(true);
    });
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('covers delete success branch', async () => {
    mockDelete.mockResolvedValue({});
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => expect(mockDelete).toHaveBeenCalled());
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionDeleteSuccess).toBe(true);
  });

  it('covers delete error branch — reopens drawer', async () => {
    mockDelete.mockRejectedValue(new Error());
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorDeleteTransaction).toBe(true);
    });
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('covers cancel modal Indietro — reopens drawer', async () => {
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Esci'));
    await waitFor(() => expect(screen.getByTestId('drawer')).toBeInTheDocument());
  });

  it('covers capture modal Indietro — reopens drawer', async () => {
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Indietro'));
    await waitFor(() => expect(screen.getByTestId('drawer')).toBeInTheDocument());
  });

  it('covers capture/cancel modal onClose — closes modal', async () => {
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });

  it('covers PDF success branch', async () => {
    mockPreview.mockResolvedValue({ data: 'b64' });
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByTestId('btn-test'));
    await waitFor(() => {
      expect(mockPreview).toHaveBeenCalled();
      expect(mockDownload).toHaveBeenCalled();
    });
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.errorPreviewPdf).toBe(false);
  });

  it('covers PDF error branch', async () => {
    mockPreview.mockRejectedValue(new Error());
    renderPage();
    await openAuthorizedDrawer();
    fireEvent.click(screen.getByTestId('btn-test'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorPreviewPdf).toBe(true);
    });
  });

  it('shows CircularProgress while PDF is loading', async () => {
    let resolve!: (v: unknown) => void;
    const pending = new Promise((r) => {
      resolve = r;
    });
    mockPreview.mockReturnValue(pending);

    renderPage();
    await openAuthorizedDrawer();

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-test'));
    });

    expect(await screen.findByTestId('item-loader')).toBeInTheDocument();

    act(() => resolve({ data: 'b64' }));

    await waitFor(() => expect(screen.queryByTestId('item-loader')).not.toBeInTheDocument());
  });

  it('covers refund modal opened from CAPTURED drawer', async () => {
    renderPage();
    await openCapturedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('covers refund modal Indietro — reopens drawer', async () => {
    renderPage();
    await openCapturedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Indietro'));
    await waitFor(() => expect(screen.getByTestId('drawer')).toBeInTheDocument());
  });

  it('covers refund modal onClose', async () => {
    renderPage();
    await openCapturedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('modal-close'));
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });

  it('covers handleReverseTransaction navigate', async () => {
    renderPage();
    await openCapturedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.refund'));
    expect(mockedNavigate).toHaveBeenCalledWith('/storna-transazione/2');
  });

  it('covers handleRequestRefund navigate from CAPTURED', async () => {
    renderPage();
    await openCapturedDrawer();
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.requestRefund'));
    expect(mockedNavigate).toHaveBeenCalledWith('/richiedi-rimborso/2');
  });

  it('covers location state refundUploadSuccess', () => {
    mockedLocation = { state: { refundUploadSuccess: true } };
    renderPage();
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionRefundSuccess).toBe(true);
  });

  it('covers location state reverseUploadSuccess', () => {
    mockedLocation = { state: { reverseUploadSuccess: true } };
    renderPage();
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionReverseSuccess).toBe(true);
  });

  it('covers transactionAuthorized timeout clears flag', () => {
    vi.useFakeTimers();
    act(() => {
      utilsStore.setState({ ...utilsStore.getState(), transactionAuthorized: true });
    });
    renderPage();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(utilsStore.getState().transactionAuthorized).toBe(false);
    vi.useRealTimers();
  });

  it('covers triggerFetchTransactions timeout branch via delete success', async () => {
    vi.useFakeTimers();
    mockDelete.mockResolvedValue({});
    renderPage();

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-auth'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Conferma'));
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionDeleteSuccess).toBe(true);
    vi.useRealTimers();
  });

  it('covers openDrawer useEffect triggering checkHeight', async () => {
    renderPage();
    await openAuthorizedDrawer();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('covers checkHeight with scrollable gridRef', async () => {
    renderPage();

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 9999;
      },
    });

    await openAuthorizedDrawer();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    expect(screen.getByTestId('drawer')).toBeInTheDocument();

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 0;
      },
    });
  });
});
