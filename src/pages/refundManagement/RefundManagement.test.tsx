import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RefundManagement from './RefundManagement';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.refundManagement.title': 'Gestione Rimborsi',
        'pages.refundManagement.subtitle': 'Gestisci le transazioni elaborate e i rimborsi',
        'pages.refundManagement.noTransactions': 'Nessuna transazione trovata.',
        'pages.refundManagement.errorAlert': 'Si è verificato un errore.',
        'pages.refundManagement.refunded': 'STORNATO',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div data-testid="title-box">
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

vi.mock('../../components/DataTable/DataTable', () => ({
  default: ({ rows, columns }: { rows: any[]; columns: any[] }) => (
    <div data-testid="data-table">
      <span data-testid="rows-count">{rows.length}</span>
      <span data-testid="columns-count">{columns.length}</span>
      {rows.length > 0 && (
        <div data-testid="first-row">
          <div data-testid="cell-date">{columns[1].renderCell({ value: rows[0].trxDate })}</div>
          <div data-testid="cell-status">{columns[5].renderCell({ value: rows[0].status })}</div>
        </div>
      )}
    </div>
  ),
}));

vi.mock('../../components/FiltersForm/FiltersForm', () => ({
  default: ({ children, onFiltersApplied, formik }: any) => (
    <div>
      {children}
      <button onClick={() => onFiltersApplied(formik.values)}>Applica Filtri</button>
      <button onClick={() => formik.resetForm()}>Resetta</button>
    </div>
  ),
}));

vi.mock('../../components/errorAlert/ErrorAlert', () => ({
  default: ({ message }: { message: string }) => <div data-testid="error-alert">{message}</div>,
}));

//api service mock
const mockGetProcessedTransactions = vi.fn();
vi.mock('../../services/merchantService', () => ({
  getProcessedTransactions: (...args: any) => mockGetProcessedTransactions(...args),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ point_of_sale_id: 'pos-456' }),
}));
vi.mock('../../store/authStore', () => ({
  authStore: {
    getState: () => ({ token: 'fake-jwt-token' }),
  },
}));

// Mock data
const mockTransactions = [
  {
    trxId: '1',
    trxDate: '2025-09-22T14:00:00Z',
    fiscalCode: 'BBBBBB22C33D444E',
    effectiveAmountCents: 8000,
    rewardAmountCents: 800,
    status: 'REFUNDED',
    eletronicDevice: 'Frigorifero EcoFrost',
  },
];

const mockApiResponse = {
  content: mockTransactions,
  pageNo: 0,
  pageSize: 10,
  totalElements: 1,
};

//render helper
const renderComponent = () => {
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <RefundManagement />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('RefundManagement', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProcessedTransactions.mockResolvedValue(mockApiResponse);
  });

  it('should show initial loading and then data', async () => {
    renderComponent();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await screen.findByTestId('data-table');
    
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
    expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(1);
    expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
      undefined, 
      'pos-456',
      expect.objectContaining({ sort: 'trxDate,asc' })
    );

    expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-row')).toHaveTextContent('STORNATO');
    expect(screen.getByTestId('first-row')).toHaveTextContent('22/09/2025 16:00'); 
  });

  it('should show no transactions message when there are no transactions', async () => {
    mockGetProcessedTransactions.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });
    
    renderComponent();
    await screen.findByText('Nessuna transazione trovata.');

    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should show error alert in case of error in data fetch', async () => {
    mockGetProcessedTransactions.mockRejectedValue(new Error('API Failure'));
    
    renderComponent();
    
    await screen.findByTestId('error-alert');
    
    expect(screen.getByText('Si è verificato un errore.')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
  
  it('should retrieve transactions with applied filters', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    await screen.findByTestId('data-table');
    
    const fiscalCodeInput = screen.getByLabelText('Cerca per codice fiscale');
    await user.type(fiscalCodeInput, 'TESTCF123');
    const applyButton = screen.getByRole('button', { name: /applica filtri/i });
    await user.click(applyButton);

    expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(2);

    expect(mockGetProcessedTransactions).toHaveBeenLastCalledWith(
      undefined,
      'pos-456',
      expect.objectContaining({
        fiscalCode: 'TESTCF123',
        gtiIn: '',
        status: '',
        page: 0,
      })
    );
  });
});