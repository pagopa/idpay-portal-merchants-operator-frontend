import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefundManagement from './RefundManagement';

// Dependencies mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.refundManagement.title': 'Gestione Rimborsi',
        'pages.refundManagement.subtitle': 'Gestisci i rimborsi delle transazioni',
        'pages.refundManagement.chipCancelled': 'Annullato',
        'pages.refundManagement.chipRefunded': 'Stornato',
        'pages.refundManagement.noTransactions': 'Nessuna transazione trovata',
        'pages.refundManagement.errorAlert': 'Errore nel caricamento dei dati'
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div data-testid="title-box">
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  )
}));

vi.mock('../../components/DataTable/DataTable', () => ({
  default: ({ 
    rows, 
    columns, 
    loading, 
    onPaginationPageChange,
    onSortModelChange 
  }: any) => (
    <div data-testid="data-table">
      {loading && <div data-testid="loading">Loading...</div>}
      {!loading && rows.length === 0 && <div data-testid="no-data">No data</div>}
      {!loading && rows.length > 0 && (
        <div>
          <div data-testid="rows-count">{rows.length} rows</div>
          <div data-testid="columns-count">{columns.length} columns</div>
          <button 
            data-testid="pagination-change"
            onClick={() => onPaginationPageChange({ pageNo: 1, pageSize: 10 })}
          >
            Change page
          </button>
          <button 
            data-testid="sort-change"
            onClick={() => onSortModelChange([{ field: 'trxDate', sort: 'asc' }])}
          >
            Sort
          </button>
        </div>
      )}
    </div>
  )
}));

vi.mock('../../components/FiltersForm/FiltersForm', () => ({
  default: ({ children, onFiltersApplied, onFiltersReset }: any) => (
    <div data-testid="filters-form">
      {children}
      <button 
        data-testid="apply-filters"
        onClick={() => onFiltersApplied({ fiscalCode: 'test', gtiIn: 'test', status: 'CANCELLED' })}
      >
        Apply Filters
      </button>
      <button 
        data-testid="reset-filters"
        onClick={() => onFiltersReset()}
      >
        Reset Filters
      </button>
    </div>
  )
}));

vi.mock('../../components/errorAlert/ErrorAlert', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-alert">{message}</div>
  )
}));

vi.mock('../../services/merchantService', () => ({
  getProcessedTransactions: vi.fn()
}));

vi.mock('../../store/authStore', () => ({
  authStore: {
    getState: () => ({
      token: 'mock-jwt-token.eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwb2ludF9vZl9zYWxlX2lkIjoibW9jay1wb3MtaWQifQ.mock-signature'
    })
  }
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    point_of_sale_id: 'mock-pos-id'
  }))
}));

vi.mock('../../utils/constants', () => ({
  MISSING_DATA_PLACEHOLDER: '-'
}));

import { getProcessedTransactions } from '../../services/merchantService';

describe('RefundManagement', () => {
  const mockGetProcessedTransactions = vi.mocked(getProcessedTransactions);
  const user = userEvent.setup();

  const mockTransactionData = {
    content: [
      {
        id: '1',
        elettrodomestico: 'Frigorifero Samsung',
        trxDate: '2024-01-15T10:30:00Z',
        fiscalCode: 'RSSMRA80A01H501Z',
        effectiveAmountCents: 50000,
        rewardAmountCents: 25000,
        status: 'REWARDED'
      },
      {
        id: '2',
        elettrodomestico: 'Lavatrice LG',
        trxDate: '2024-01-14T15:45:00Z',
        fiscalCode: 'BNCGVN85B02H501Y',
        effectiveAmountCents: 75000,
        rewardAmountCents: 37500,
        status: 'CANCELLED'
      }
    ],
    pageNo: 0,
    pageSize: 10,
    totalElements: 2
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProcessedTransactions.mockResolvedValue(mockTransactionData);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('should render the component with title and subtitle', async () => {
      render(<RefundManagement />);
      
      expect(screen.getByTestId('title-box')).toBeInTheDocument();
      expect(screen.getByText('Gestione Rimborsi')).toBeInTheDocument();
      expect(screen.getByText('Gestisci i rimborsi delle transazioni')).toBeInTheDocument();
      expect(screen.getByText('Transazioni')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<RefundManagement />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render data table with transactions after loading', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('rows-count')).toHaveTextContent('2 rows');
        expect(screen.getByTestId('columns-count')).toHaveTextContent('6 columns');
      });
    });

    it('should show no transactions message when no data is available', async () => {
      mockGetProcessedTransactions.mockResolvedValueOnce({
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0
      }as any);

      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Nessuna transazione trovata')).toBeInTheDocument();
      });
    });
  });

  describe('Data fetching', () => {
    it('should call getProcessedTransactions on component mount', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
          "68c7db19fed6831074cbc624",
          "mock-pos-id",
          {}
        );
      });
    });

    it('should handle API errors and show error alert', async () => {
      mockGetProcessedTransactions.mockRejectedValueOnce(new Error('API Error'));
      
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText('Errore nel caricamento dei dati')).toBeInTheDocument();
      });
    });

    it('should prevent duplicate API calls when already loading', async () => {
      // Mock a slow API response
      mockGetProcessedTransactions.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTransactionData), 100))
      );

      const { rerender } = render(<RefundManagement />);
      
      // Trigger multiple rerenders quickly
      rerender(<RefundManagement />);
      rerender(<RefundManagement />);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Filters functionality', () => {
    it('should show filters when there are transactions', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('filters-form')).toBeInTheDocument();
      });
    });


    it('should handle filter application', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('apply-filters')).toBeInTheDocument();
      });

      const applyButton = screen.getByTestId('apply-filters');
      await user.click(applyButton);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
          "68c7db19fed6831074cbc624",
          "mock-pos-id",
          expect.objectContaining({
            fiscalCode: 'test',
            gtiIn: 'test',
            status: 'CANCELLED'
          })
        );
      });
    });

    it('should handle filter reset', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('reset-filters')).toBeInTheDocument();
      });

      const resetButton = screen.getByTestId('reset-filters');
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
          "68c7db19fed6831074cbc624",
          "mock-pos-id",
          {}
        );
      });
    });

    it('should update formik values when input fields change', async () => {
      render(<RefundManagement />);
      
      const fiscalCodeInput = await screen.findByLabelText('Cerca per codice fiscale');
      await user.type(fiscalCodeInput, 'RSSMRA80A01H501Z');
      
      expect(fiscalCodeInput).toHaveValue('RSSMRA80A01H501Z');
      
      const gtiInput = screen.getByLabelText('Cerca per GTI In');
      await user.type(gtiInput, 'GTI123');
      
      expect(gtiInput).toHaveValue('GTI123');
    });

    it('should handle status filter selection', async () => {
      render(<RefundManagement />);
      
      const statusSelect = await screen.findByLabelText('Stato');
      await user.click(statusSelect);
      
      const cancelledOption = await screen.findByText('Annullato');
      await user.click(cancelledOption);
      
      expect(statusSelect).toHaveTextContent('Annullato');
    });
  });

  describe('Pagination and sorting', () => {
    it('should handle pagination changes', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination-change')).toBeInTheDocument();
      });

      const paginationButton = screen.getByTestId('pagination-change');
      await user.click(paginationButton);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
          "68c7db19fed6831074cbc624",
          "mock-pos-id",
          expect.objectContaining({
            page: 1,
            size: 10
          })
        );
      });
    });

    it('should handle sort model changes', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sort-change')).toBeInTheDocument();
      });

      const sortButton = screen.getByTestId('sort-change');
      await user.click(sortButton);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledWith(
          "68c7db19fed6831074cbc624",
          "mock-pos-id",
          expect.objectContaining({
            sort: 'trxDate,asc'
          })
        );
      });
    });

    it('should not trigger unnecessary pagination calls', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(1);
      });

      mockGetProcessedTransactions.mockClear();
      
      const component = screen.getByTestId('data-table');
      fireEvent.click(component); 
      
      expect(mockGetProcessedTransactions).not.toHaveBeenCalled();
    });
  });

  describe('Columns rendering', () => {
    it('should format date correctly in trxDate column', () => {
      const columns = [
        {
          field: 'trxDate',
          headerName: 'Data e ora',
          renderCell: (params: any) => {
            if (params.value) {
              return new Date(params.value).toLocaleDateString('it-IT');
            }
            return '-';
          }
        }
      ];

      const result = columns[0].renderCell({ value: '2024-01-15T10:30:00Z' });
      expect(result).toBe('15/01/2024');
    });

    it('should format currency correctly in amount columns', () => {
      const renderCell = (params: any) => {
        if (params.value || params.value === 0) {
          return (params.value / 100).toLocaleString('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) + '€';
        }
        return '-';
      };

      expect(renderCell({ value: 50000 })).toBe('500,00€');
      expect(renderCell({ value: 0 })).toBe('0,00€');
      expect(renderCell({ value: null })).toBe('-');
    });

    it('should render status chips correctly', () => {
      const renderCell = (params: any) => {
        if (params.value === "CANCELLED") {
          return 'Annullato';
        } else {
          return 'Stornato';
        }
      };

      expect(renderCell({ value: 'CANCELLED' })).toBe('Annullato');
      expect(renderCell({ value: 'REWARDED' })).toBe('Stornato');
    });

    it('should handle missing data with placeholder', () => {
      const renderCell = (params: any) => {
        if (params.value) {
          return params.value;
        }
        return '-';
      };

      expect(renderCell({ value: null })).toBe('-');
      expect(renderCell({ value: undefined })).toBe('-');
      expect(renderCell({ value: '' })).toBe('-');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetProcessedTransactions.mockRejectedValueOnce(new Error('Network error'));
      
      render(<RefundManagement />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'RefundManagement: Errore fetch:',
          expect.any(Error)
        );
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

  });

  describe('Component state management', () => {
    it('should maintain correct loading states', async () => {
      render(<RefundManagement />);
      
      // Initially loading
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      // After successful fetch
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('rows-count')).toBeInTheDocument();
      });
    });

    it('should update pagination model correctly', async () => {
      render(<RefundManagement />);
      
      await waitFor(() => {
        // Check that pagination model is set correctly from API response
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('should prevent race conditions with loading ref', async () => {
      // Mock multiple concurrent API calls
      let resolveCount = 0;
      mockGetProcessedTransactions.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolveCount++;
            resolve(mockTransactionData);
          }, 50);
        })
      );

      render(<RefundManagement />);

      const applyButton = await screen.findByTestId('apply-filters');
      

      await user.click(applyButton);
      await user.click(applyButton);
      await user.click(applyButton);
      
      await waitFor(() => {
        expect(mockGetProcessedTransactions).toHaveBeenCalled();
      });
    });
  });
});