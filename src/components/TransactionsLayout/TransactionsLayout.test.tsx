import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionsLayout from './TransactionsLayout';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({ point_of_sale_id: 'mocked-pos-id' })),
}));

vi.mock('../../store/authStore', () => ({
  authStore: {
    getState: vi.fn(() => ({ token: 'mocked-jwt-token' })),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: vi.fn(({ title, subTitle }) => (
    <div data-testid="title-box">
      {title} - {subTitle}
    </div>
  )),
}));

vi.mock('../Alert/AlertComponent', () => ({
  default: vi.fn(({ message, isOpen }) =>
    isOpen ? <div data-testid="alert-component">{message}</div> : null
  ),
}));

vi.mock('../Alert/AlertListComponent', () => ({
  default: vi.fn(({ alertList }) => (
    <div data-testid="alert-list-component">
      {alertList
        .filter((alert: { isOpen: boolean }) => alert.isOpen)
        .map((alert: { message: string }, index: number) => (
          <span key={index} data-testid={`alert-list-item-${index}`}>
            {alert.message}
          </span>
        ))}
    </div>
  )),
}));

vi.mock('../DynamicTable/DynamicTable', () => ({
  DynamicTable: vi.fn(({ onPaginationModelChange, onSortModelChange }) => (
    <div data-testid="dynamic-table">
      <button
        data-testid="pagination-btn"
        onClick={() => onPaginationModelChange({ page: 1, pageSize: 20 })}
      >
        Change Page
      </button>
      <button
        data-testid="sort-btn"
        onClick={() => onSortModelChange([{ field: 'amount', sort: 'asc' }])}
      >
        Change Sort
      </button>
    </div>
  )),
}));

vi.mock('../DynamicFilters/DynamicFilters', () => ({
  DynamicFilters: vi.fn(({ setFilters }) => (
    <div data-testid="dynamic-filters">
      <button
        data-testid="filters-btn"
        onClick={() => setFilters({ customFilter: 'test' })}
      >
        Set Filters
      </button>
    </div>
  )),
}));

vi.mock('../DynamicDrawer/DynamicDrawer', () => ({
  default: vi.fn(() => <div data-testid="dynamic-drawer">DynamicDrawer</div>),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

const mockUseAutoResetBanner = vi.fn();
vi.mock('../../hooks/useAutoResetBanner', () => ({
  useAutoResetBanner: (...args: unknown[]) => mockUseAutoResetBanner(...args),
}));

describe('TransactionsLayout component', () => {
  const mockAlerts = [[false, vi.fn()]] as Array<[boolean, (value: boolean) => void]>;
  const mockTransactionsApi = vi.fn();
  const mockSetTransactionsList = vi.fn();
  const mockSetFilters = vi.fn();

  const defaultProps = {
    initiativeId: 'test-init-id',
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    tableTitle: 'Test Table Title',
    alerts: mockAlerts,
    alertMessages: {
      error: 'Generic Error',
    },
    isAlertVisible: true,
    tableProps: { rows: [{ id: '1' }] } as any,
    drawerProps: { isOpen: true, buttons: [] } as any,
    filtersProps: { filters: { defaultFilter: '1' }, setFilters: mockSetFilters } as any,
    transactionsApi: mockTransactionsApi,
    setTransactionsList: mockSetTransactionsList,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionsApi.mockResolvedValue({ content: [{ id: '1' }], totalElements: 1 });
  });

  it('renders correctly and fetches transactions on mount', async () => {
    render(<TransactionsLayout {...defaultProps} />);

    expect(screen.getByTestId('title-box')).toHaveTextContent('Test Title - Test Subtitle');
    expect(screen.getByText('Test Table Title')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-filters')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-table')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-drawer')).toBeInTheDocument();

    expect(mockUseAutoResetBanner).toHaveBeenCalledWith(expect.any(Array));

    await waitFor(() => {
      expect(mockTransactionsApi).toHaveBeenCalledWith(
        'test-init-id',
        'mocked-pos-id',
        { size: 10, page: 0, defaultFilter: '1', sort: 'trxChargeDate,desc' }
      );
      expect(mockSetTransactionsList).toHaveBeenCalledWith([{ id: '1' }]);
    });
  });

  it('sets generic error state when transactionsApi fails', async () => {
    mockTransactionsApi.mockRejectedValueOnce(new Error('API Error'));

    render(<TransactionsLayout {...defaultProps} />);

    await waitFor(() => {
      const errorAlert = screen.getByTestId('alert-list-component');
      expect(errorAlert).toHaveTextContent('Generic Error');
    });
  });

  it('handles pagination changes and triggers fetch', async () => {
    render(<TransactionsLayout {...defaultProps} />);

    await waitFor(() => {
      expect(mockTransactionsApi).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTestId('pagination-btn'));

    await waitFor(() => {
      expect(mockTransactionsApi).toHaveBeenCalledWith(
        'test-init-id',
        'mocked-pos-id',
        expect.objectContaining({ size: 20, page: 1 })
      );
    });
  });

  it('handles sort changes and triggers fetch', async () => {
    render(<TransactionsLayout {...defaultProps} />);

    await waitFor(() => {
      expect(mockTransactionsApi).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTestId('sort-btn'));

    await waitFor(() => {
      expect(mockTransactionsApi).toHaveBeenCalledWith(
        'test-init-id',
        'mocked-pos-id',
        expect.objectContaining({ sort: 'amount,asc' })
      );
    });
  });

  it('handles filter changes and resets page', async () => {
    render(<TransactionsLayout {...defaultProps} />);

    fireEvent.click(screen.getByTestId('filters-btn'));

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({ customFilter: 'test' });
    });
  });

  it('renders the additional button and handles click', () => {
    const mockOnClick = vi.fn();
    const additionalButton = {
      label: 'Custom Action',
      icon: <span data-testid="btn-icon" />,
      onClick: mockOnClick,
    };

    render(<TransactionsLayout {...defaultProps} additionalButton={additionalButton} />);

    const button = screen.getByRole('button', { name: /Custom Action/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('btn-icon')).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders AlertComponent for keys containing "error" in externalState', () => {
    const externalState = {
      downloadError: true,
    };
    const alertMessages = {
      downloadError: 'Download failed',
      error: 'Generic Error',
    };

    render(
      <TransactionsLayout
        {...defaultProps}
        externalState={externalState}
        alertMessages={alertMessages}
      />
    );

    const errorAlert = screen.getByTestId('alert-list-component');
    expect(errorAlert).toHaveTextContent('Download failed');
  });

  it('does not render AlertComponent if isAlertVisible is false', () => {
    const externalState = {
      downloadError: true,
    };
    const alertMessages = {
      downloadError: 'Download failed',
    };

    render(
      <TransactionsLayout
        {...defaultProps}
        externalState={externalState}
        alertMessages={alertMessages}
        isAlertVisible={false}
      />
    );

    expect(screen.queryByTestId('alert-component')).not.toBeInTheDocument();
  });

  it('passes non-error states to AlertListComponent', () => {
    const externalState = {
      successEvent: true,
      downloadError: true,
    };
    const alertMessages = {
      successEvent: 'Operation successful',
      downloadError: 'Download failed',
      error: 'Default error fallback',
    };

    render(
      <TransactionsLayout
        {...defaultProps}
        externalState={externalState}
        alertMessages={alertMessages}
      />
    );

    const alertListContainer = screen.getByTestId('alert-list-component');

    expect(alertListContainer).toHaveTextContent('Operation successful');
  });

  it('uses translation for fallback generic error if alertMessages.error is undefined', async () => {
    mockTransactionsApi.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TransactionsLayout
        {...defaultProps}
        alertMessages={{}}
      />
    );

    await waitFor(() => {
      const alertListContainer = screen.getByTestId('alert-list-component');
      expect(alertListContainer).toHaveTextContent('pages.refundManagement.errorAlert');
    });
  });
});