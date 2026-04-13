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
    trxCode: 'trx',
    additionalProperties: { productName: 'prod' },
    trxChargeDate: new Date().toISOString(),
    fiscalCode: 'AAA',
    effectiveAmountCents: 100,
    rewardAmountCents: 10,
    residualAmountCents: 90,
    status: 'CAPTURED',
  },
}));

let mockedLocation: { state: unknown } = { state: null };

vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  Drawer: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CircularProgress: () => <div data-testid="item-loader" />,
}));

vi.mock('@mui/icons-material/Close', () => ({
  default: () => <div data-testid="CloseIcon" />,
}));

vi.mock('@mui/icons-material/Description', () => ({
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
      <button onClick={props.additionalButton.onClick}>add</button>
      <button onClick={() => props.onRowAction(mockAuthorized)}>auth</button>
      <button onClick={() => props.onRowAction(mockCaptured)}>cap</button>
      <div data-testid="external">{JSON.stringify(props.externalState)}</div>
      {props.DrawerComponent}
    </div>
  ),
}));

vi.mock('../../components/Modal/ModalComponent', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="modal">{children}</div> : null,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <PurchaseManagement />
    </MemoryRouter>
  );

describe('PurchaseManagement coverage completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLocation = { state: null };

    act(() => {
      utilsStore.setState({
        ...utilsStore.getState(),
        transactionAuthorized: false,
      });
    });
  });

  it('navigates to accept discount', () => {
    renderPage();
    fireEvent.click(screen.getByText('add'));
    expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.ACCEPT_DISCOUNT);
  });

  it('renders AUTHORIZED drawer branch', async () => {
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    expect(screen.getByTestId('status-chip')).toHaveTextContent('AUTHORIZED');
  });

  it('renders CAPTURED drawer branch', async () => {
    renderPage();
    fireEvent.click(screen.getByText('cap'));
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    expect(screen.getByTestId('status-chip')).toHaveTextContent('CAPTURED');
  });

  it('covers capture success branch', async () => {
    mockCapture.mockResolvedValue({});
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => expect(mockCapture).toHaveBeenCalled());
  });

  it('covers capture error branch', async () => {
    mockCapture.mockRejectedValue(new Error());
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.confirmPayment'));
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorCaptureTransaction).toBe(true);
    });
  });

  it('covers delete success branch', async () => {
    mockDelete.mockResolvedValue({});
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => expect(mockDelete).toHaveBeenCalled());
  });

  it('covers delete error branch', async () => {
    mockDelete.mockRejectedValue(new Error());
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByText('pages.purchaseManagement.drawer.cancellPayment'));
    fireEvent.click(screen.getByText('Conferma'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorDeleteTransaction).toBe(true);
    });
  });

  it('covers PDF success branch', async () => {
    mockPreview.mockResolvedValue({ data: 'b64' });
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByTestId('btn-test'));
    await waitFor(() => {
      expect(mockPreview).toHaveBeenCalled();
      expect(mockDownload).toHaveBeenCalled();
    });
  });

  it('covers PDF error branch', async () => {
    mockPreview.mockRejectedValue(new Error());
    renderPage();
    fireEvent.click(screen.getByText('auth'));
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByTestId('btn-test'));
    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
      expect(state.errorPreviewPdf).toBe(true);
    });
  });

  it('covers location state effect', () => {
    mockedLocation = {
      state: { refundUploadSuccess: true, reverseUploadSuccess: true },
    };
    renderPage();
    const state = JSON.parse(screen.getByTestId('external').textContent || '{}');
    expect(state.transactionRefundSuccess).toBe(true);
    expect(state.transactionReverseSuccess).toBe(true);
  });

  it('covers transactionAuthorized timeout branch', () => {
    vi.useFakeTimers();
    act(() => {
      utilsStore.setState({
        ...utilsStore.getState(),
        transactionAuthorized: true,
      });
    });
    renderPage();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(utilsStore.getState().transactionAuthorized).toBe(false);
    vi.useRealTimers();
  });
});
