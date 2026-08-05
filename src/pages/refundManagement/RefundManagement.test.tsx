import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RefundManagement from './RefundManagement';
import { getProcessedTransactions, downloadInvoiceFileApi } from '../../services/merchantService';
import { useActionPermission } from '../../hooks/useActionPermission';

let mockLocationState: Record<string, unknown> | undefined = undefined;
const mockNavigate = vi.fn();
const mockGetPermission = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
    useParams: () => ({ initiativeId: 'init-123' }),
    generatePath: vi.fn((path: string, params: Record<string, string>) => {
      let url = path;
      for (const key in params) {
        url = url.replace(`:${key}`, params[key]);
      }
      return url;
    }),
  };
});

vi.mock('../../redux/hooks', () => ({
    useAppSelector: vi.fn((selectorFn) => selectorFn({})),
}));

vi.mock('../../redux/slices/initiativesSlice', () => ({
    initiativesListSelector: vi.fn(),
    currentInitiativeSelector: vi.fn(() => ({ status: 'PUBLISHED' })),
}));

vi.mock('../../hooks/useActionPermission', () => ({
  useActionPermission: vi.fn(() => ({ getPermission: mockGetPermission })),
}));

vi.mock('../../routes', () => ({
  default: {
    REVERSE: '/:initiativeId/storna-transazione/:trxId',
    REFUNDS_MANAGEMENT: '/:initiativeId/gestione-rimborsi',
    MODIFY_DOCUMENT: '/:initiativeId/modifica-documento/:trxId/:fileDocNumber',
  },
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key,
    config: (key: string) => {
      if (key.includes('filters')) return [{ field: 'testFilter' }];
      if (key.includes('drawer')) return [{ field: 'invoiceFile.docNumber', headerName: 'Document' }];
      if (key.includes('columns')) return [{ field: 'status' }];
      return [];
    },
  }),
}));

vi.mock('../../store/authStore', () => ({
  authStore: {
    getState: () => ({ token: 'mock-token' }),
  },
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ point_of_sale_id: 'pos-123' }),
}));

vi.mock('../../services/merchantService', () => ({
  getProcessedTransactions: vi.fn(),
  downloadInvoiceFileApi: vi.fn(),
}));

vi.mock('../../components/TransactionsLayout/TransactionsLayout', () => ({
  default: ({ alerts, tableProps, drawerProps, filtersProps, transactionsApi, setTransactionsList }: any) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      if (transactionsApi && setTransactionsList) {
        transactionsApi('init-123', 'pos-123', {
          page: tableProps?.paginationModel?.page ?? 0,
          size: tableProps?.paginationModel?.pageSize ?? 10,
          ...filtersProps?.filters,
        })
          .then((res: any) => {
            setTransactionsList(res.content);
          })
          .catch(() => {
            setHasError(true);
          });
      }
    }, [transactionsApi, setTransactionsList, tableProps?.paginationModel, filtersProps?.filters]);

    return (
      <div data-testid="transactions-layout">
        <span data-testid="generic-error">{String(hasError)}</span>
        <span data-testid="alert-reverse">{String(alerts?.[0]?.[0])}</span>
        <span data-testid="alert-refund">{String(alerts?.[1]?.[0])}</span>
        <span data-testid="alert-download">{String(alerts?.[2]?.[0])}</span>

        <button data-testid="set-filters" onClick={() => filtersProps?.setFilters({ search: 'test' })} />

        <div data-testid="dynamic-table">
          <button
            data-testid="table-page-change"
            onClick={() => tableProps?.onPaginationModelChange?.({ page: 1, pageSize: 20 })}
          />
          {tableProps?.rows?.map((row: any, i: number) => (
            <div key={i} data-testid={`row-${i}`}>
              <button data-testid={`row-action-${i}`} onClick={() => row.action.onClick(row)} />
              <button data-testid={`row-download-${i}`} onClick={() => row.onClick()} />
            </div>
          ))}
        </div>

        {drawerProps?.isOpen && (
          <div data-testid="dynamic-drawer">
            {drawerProps.buttons &&
              drawerProps.buttons.map((btn: any, i: number) => (
                <button
                  key={i}
                  data-testid={`drawer-btn-${i}`}
                  disabled={btn.disabled}
                  onClick={btn.onClick}
                >
                  {btn.title}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  },
}));

vi.mock('../../utils/helpers', async () => {
  const actual = await vi.importActual<typeof import('../../utils/helpers')>('../../utils/helpers');
  return {
    ...actual,
    plainObj: vi.fn((obj) => obj),
  };
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <RefundManagement />
    </MemoryRouter>
  );

describe('RefundManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = undefined;
    mockGetPermission.mockReturnValue(true);
    vi.mocked(getProcessedTransactions).mockResolvedValue({
      content: [],
      totalElements: 0,
    });
  });

  it('sets refund success alert from location state', () => {
    mockLocationState = { refundUploadSuccess: true };
    renderComponent();
    expect(screen.getByTestId('alert-refund')).toHaveTextContent('true');
  });

  it('sets reverse success alert from location state', () => {
    mockLocationState = { reverseUploadSuccess: true };
    renderComponent();
    expect(screen.getByTestId('alert-reverse')).toHaveTextContent('true');
  });

  it('fetches transactions on mount', async () => {
    renderComponent();
    await waitFor(() => {
      expect(getProcessedTransactions).toHaveBeenCalledWith('init-123', 'pos-123', expect.any(Object));
    });
  });

  it('handles API error during fetch transactions', async () => {
    vi.mocked(getProcessedTransactions).mockRejectedValueOnce(new Error('Network error'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('generic-error')).toHaveTextContent('true');
    });
  });

  it('opens drawer and maps correct actions for INVOICED transaction', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-1', status: 'INVOICED', rewardBatchTrxStatus: 'PENDING', 'Numero fattura': '123' }],
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('row-action-0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('row-action-0'));

    expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-btn-0')).not.toBeDisabled();
  });

  it('disables modify button when rewardBatchTrxStatus is APPROVED', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-2', status: 'INVOICED', rewardBatchTrxStatus: 'APPROVED' }],
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('row-action-0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('row-action-0'));

    expect(screen.getByTestId('drawer-btn-0')).toBeDisabled();
  });

  it('disables buttons in drawer if user does not have permission', async () => {
    mockGetPermission.mockReturnValue(false);
    
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-perm', status: 'INVOICED', rewardBatchTrxStatus: 'PENDING' }],
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('row-action-0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('row-action-0'));

    expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-btn-0')).toBeDisabled();
    expect(screen.getByTestId('drawer-btn-1')).toBeDisabled();
  });

  it('navigates to modify document on drawer button click', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-3', status: 'INVOICED', docNumber: 'FATTURA-123' }],
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('row-action-0'));
    });

    fireEvent.click(screen.getByTestId('drawer-btn-0'));

    expect(mockNavigate).toHaveBeenCalledWith(
      `/init-123/modifica-documento/trx-3/${btoa('FATTURA-123')}`
    );
  });

  it('navigates to reverse transaction on drawer button click', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-4', status: 'INVOICED' }],
      totalElements: 1,
    });

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('row-action-0'));
    });

    fireEvent.click(screen.getByTestId('drawer-btn-1'));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/init-123/storna-transazione/trx-4',
      { state: { backTo: '/init-123/gestione-rimborsi' } }
    );
  });

  it('downloads invoice successfully', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-5', status: 'INVOICED', 'invoiceFile.filename': 'test.pdf' }],
      totalElements: 1,
    });
    vi.mocked(downloadInvoiceFileApi).mockResolvedValueOnce({ invoiceUrl: 'http://test.url' });

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'a') {
        return {
          click: clickSpy,
          set href(_v: string) {},
          set download(_v: string) {},
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tag);
    }) as typeof document.createElement);

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('row-download-0'));
    });

    await waitFor(() => {
      expect(downloadInvoiceFileApi).toHaveBeenCalledWith('pos-123', 'trx-5');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it('handles download invoice error', async () => {
    vi.mocked(getProcessedTransactions).mockResolvedValueOnce({
      content: [{ id: 'trx-6', status: 'INVOICED' }],
      totalElements: 1,
    });
    vi.mocked(downloadInvoiceFileApi).mockRejectedValueOnce(new Error('Download Failed'));

    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('row-download-0'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-download')).toHaveTextContent('true');
    });
  });

  it('updates page size and fetches again on pagination change', async () => {
    renderComponent();

    await waitFor(() => {
      expect(getProcessedTransactions).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTestId('table-page-change'));

    await waitFor(() => {
      expect(getProcessedTransactions).toHaveBeenCalledTimes(1);
      expect(getProcessedTransactions).toHaveBeenLastCalledWith(
        'init-123',
        'pos-123',
        expect.objectContaining({ page: 0, size: 10 })
      );
    });
  });

  it('resets page and fetches again on filters change', async () => {
    renderComponent();

    await waitFor(() => {
      expect(getProcessedTransactions).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTestId('set-filters'));

    await waitFor(() => {
      expect(getProcessedTransactions).toHaveBeenCalledTimes(2);
      expect(getProcessedTransactions).toHaveBeenLastCalledWith(
        'init-123',
        'pos-123',
        expect.objectContaining({ page: 0, search: 'test' })
      );
    });
  });
});