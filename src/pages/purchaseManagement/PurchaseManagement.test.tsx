import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PurchaseManagement from './PurchaseManagement';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.purchaseManagement.title': 'Gestione Acquisti',
        'pages.purchaseManagement.subtitle': 'Gestisci i tuoi acquisti e transazioni',
        'pages.refundManagement.authorized': 'AUTORIZZATO',
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

type DataTableMockProps = {
  rows: any[];
  columns: any[];
};

vi.mock('../../components/DataTable/DataTable', () => ({
  default: ({ rows, columns }: DataTableMockProps) => (
    <div data-testid="data-table">
      <span data-testid="rows-count">{rows.length}</span>
      <span data-testid="columns-count">{columns.length}</span>
      {rows.length > 0 && (
        <div data-testid="first-row">
          <div data-testid="cell-product">{columns[0].renderCell({ value: rows[0].additionalProperties })}</div>
          <div data-testid="cell-date">{columns[1].renderCell({ value: rows[0].trxDate })}</div>
          <div data-testid="cell-fiscal-code">{rows[0].fiscalCode}</div>
          <div data-testid="cell-amount">{columns[3].renderCell({ value: rows[0].effectiveAmountCents })}</div>
          <div data-testid="cell-status">{columns[6].renderCell({ value: rows[0].status })}</div>
        </div>
        
      )}
      <button
        data-testid="trigger-pagination"
        onClick={() => mockGetInProgressTransactions({ page: 1, pageSize: 20 })}
      >
        trigger pagination
      </button>
      <button
        data-testid="trigger-sort"
        onClick={() => mockGetInProgressTransactions({ sort: 'additionalProperties', sortDirection: 'asc' })}
      >
        trigger sort
      </button>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock('../../routes', () => ({
  default: {
    ACCEPT_DISCOUNT: '/accetta-sconto',
  },
}));

const mockGetInProgressTransactions = vi.fn();
vi.mock('../../services/merchantService', () => ({
  getInProgressTransactions: () => mockGetInProgressTransactions(),
}));
vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ point_of_sale_id: 'pos-123' }),
}));
vi.mock('../../store/authStore', () => ({
  authStore: {
    getState: () => ({ token: 'fake-jwt-token' }),
  },
}));

//mock data
const mockTransactions = [
  {
    trxId: '1',
    trxDate: '2025-09-22 12:30:00 ',
    fiscalCode: 'AAAAAA11B22C333D',
    effectiveAmountCents: 5000,
    rewardAmountCents: 500,
    status: 'AUTHORIZED',
    additionalProperties: { productName: 'Lavatrice SuperClean' },
  },
];

const mockApiResponse = {
  content: mockTransactions,
  pageNo: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  last: true,
};

//render helper function
const renderComponent = () => {
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <PurchaseManagement />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('PurchaseManagement', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner', () => {
    mockGetInProgressTransactions.mockReturnValue(new Promise(() => {}));
    
    renderComponent();
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should render title, subtitle and action button', async () => {
    mockGetInProgressTransactions.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });
    
    renderComponent();
    
    await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Gestione Acquisti')).toBeInTheDocument();
    expect(screen.getByText('Gestisci i tuoi acquisti e transazioni')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accetta buono sconto/i })).toBeInTheDocument();
  });

  it('should navigate to the correct page when clicking the "Accept Discount" button', async () => {
    mockGetInProgressTransactions.mockResolvedValue({ ...mockApiResponse, content: [] });
    const user = userEvent.setup();

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    const acceptButton = screen.getByRole('button', { name: /accetta buono sconto/i });
    await user.click(acceptButton);

    expect(mockNavigate).toHaveBeenCalledWith('/accetta-sconto');
  });

  it('should fetch and display transactions correctly', async () => {
    mockGetInProgressTransactions.mockResolvedValue(mockApiResponse);

    renderComponent();

    await screen.findByTestId('data-table');

    expect(mockGetInProgressTransactions).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('7');
    const firstRow = screen.getByTestId('first-row');
    expect(firstRow.querySelector('[data-testid="cell-product"]')).toHaveTextContent('Lavatrice SuperClean');
    expect(firstRow.querySelector('[data-testid="cell-date"]')).toHaveTextContent('22/09/2025 12:30'); 
    expect(firstRow.querySelector('[data-testid="cell-fiscal-code"]')).toHaveTextContent('AAAAAA11B22C333D');
    expect(firstRow.querySelector('[data-testid="cell-amount"]')).toHaveTextContent('50,00€');
    expect(firstRow.querySelector('[data-testid="cell-status"]')).toHaveTextContent('AUTORIZZATO');
  });
  
  it('should not render the table if there are no transactions', async () => {
    mockGetInProgressTransactions.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('should handle errors during transaction fetch', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetInProgressTransactions.mockRejectedValue(new Error('API Error'));

    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });


  it('should reset filters and fetch all transactions again', async () => {
    mockGetInProgressTransactions.mockResolvedValue({ ...mockApiResponse, content: [] });
    renderComponent();
  
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  
    await waitFor(() => {
      expect(mockGetInProgressTransactions).toHaveBeenCalledTimes(1);
    });
  });

  it('should call fetchTransactions with proper sort when sorting by a column', async () => {
    mockGetInProgressTransactions.mockResolvedValue(mockApiResponse);
    renderComponent();
  
    const dataTable = await screen.findByTestId('data-table');
  
    expect(dataTable).toBeInTheDocument(); 
    const paginationButton = screen.getByTestId('trigger-sort');
    fireEvent.click(paginationButton);
    await waitFor(() => {
      expect(mockGetInProgressTransactions).toHaveBeenLastCalledWith(expect.objectContaining({
        sort: 'additionalProperties',
        sortDirection: 'asc',
      }));
    });
  });


  it('should call fetchTransactions with new pagination values', async () => {
    mockGetInProgressTransactions.mockResolvedValue(mockApiResponse);
    renderComponent();
  
    const dataTable = await screen.findByTestId('data-table');
  
    expect(dataTable).toBeInTheDocument(); 
    const paginationButton = screen.getByTestId('trigger-pagination');
    fireEvent.click(paginationButton);
    await waitFor(() => {
      expect(mockGetInProgressTransactions).toHaveBeenLastCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
      }));
    });
  });

  it('should render placeholders when values are missing and handle non-additionalProperties sort', async () => {
    const emptyTransaction = {
      trxId: '2',
      trxDate: null,
      fiscalCode: '',
      effectiveAmountCents: null,
      rewardAmountCents: null,
      status: 'CAPTURED',
      additionalProperties: null,
    };
    mockGetInProgressTransactions.mockResolvedValue({
      ...mockApiResponse,
      content: [emptyTransaction],
      totalElements: 1,
    });

    renderComponent();

    await screen.findByTestId('data-table');

    const firstRow = screen.getByTestId('first-row');

    expect(firstRow.querySelector('[data-testid="cell-product"]')).toHaveTextContent('-');
    expect(firstRow.querySelector('[data-testid="cell-date"]')).toHaveTextContent('-');
    expect(firstRow.querySelector('[data-testid="cell-amount"]')).toHaveTextContent('-');

    const sortButton = screen.getByTestId('trigger-sort');
    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(mockGetInProgressTransactions).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sort: 'additionalProperties',
          sortDirection: 'asc',
        })
      );
    });

    await waitFor(() => {
      mockGetInProgressTransactions({ sort: 'fiscalCode,asc', page: 0, size: 10 });
    });

    expect(mockGetInProgressTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: 'fiscalCode,asc',
      })
    );
  });


    

});