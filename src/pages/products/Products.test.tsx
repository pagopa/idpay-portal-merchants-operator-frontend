import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { getInitiativeProductsList } from '../../services/merchantService';
import Products from './Products';

vi.mock('@mui/material', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@mui/icons-material/OpenInNew', () => ({
  __esModule: true,
  default: () => <span data-testid="open-new-icon" />,
}));

vi.mock('@pagopa/mui-italia', () => ({
  theme: { palette: { divider: '#dddddd' } },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

const mockConfigJson = {
  pages: {
    products: {
      drawer: [
        { field: "eprelCode", headerName: "pages.products.drawer.eprelCode", cell: { type: "text" } },
        { field: "gtinCode", headerName: "pages.products.drawer.gtinCode", cell: { type: "text" } }
      ],
      productsTable: {
        filters: [
          { id: "category", type: "select", label: "pages.products.filters.category", template: "categories" }
        ],
        columns: [
          { field: "category", headerName: "pages.products.tableHeaders.category", flex: 1, sortable: true, cell: { type: "text", tooltip: true } },
          { field: "gtinCode", headerName: "pages.products.tableHeaders.gtinCode", flex: 1, sortable: true, cell: { type: "text", tooltip: true } },
          { field: "brand", headerName: "pages.products.tableHeaders.brand", flex: 1, sortable: true, cell: { type: "text", tooltip: true } }
        ]
      }
    }
  }
};

vi.mock('react-router-dom', () => ({
  useParams: () => ({ initiativeId: 'mock-initiative-123' }),
}));

vi.mock('../../services/merchantService', () => ({
  getInitiativeProductsList: vi.fn(),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: vi.fn((key) => key),
    config: vi.fn((key) => {
      if (key === 'pages.products.productsTable.filters') return mockConfigJson.pages.products.productsTable.filters;
      if (key === 'pages.products.drawer') return mockConfigJson.pages.products.drawer;
      if (key === 'pages.products.productsTable.columns') return mockConfigJson.pages.products.productsTable.columns;
      return [];
    }),
  }),
}));

vi.mock('../../hooks/useAutoResetBanner', () => ({
  useAutoResetBanner: vi.fn(),
}));

vi.mock('../../redux/slices/initiativesSlice', () => ({
  currentInitiativeSelector: vi.fn(() => ({ initiativeName: 'My Initiative' })),
}));

vi.mock('../../redux/hooks', () => ({
  useAppSelector: vi.fn((selector) => selector({})),
}));

vi.mock('../../components/DynamicFilters/DynamicFilters', () => ({
  DynamicFilters: ({ setFilters }: any) => (
    <button data-testid="mock-filter-button" onClick={() => setFilters({ category: 'OVENS' })}>
      Apply Filter Mock
    </button>
  ),
}));

vi.mock('../../components/DynamicDrawer/DynamicDrawer', () => ({
  __esModule: true,
  default: ({ isOpen, title, subtitle, setIsOpen }: any) => (
    <div>
      <span data-testid="drawer-title">{title}</span>
      <button data-testid="close-drawer" onClick={() => setIsOpen()}>
        Close Drawer
      </button>
      {isOpen && <span>{subtitle}</span>}
    </div>
  ),
}));

vi.mock('../../components/Alert/AlertComponent', () => ({
  __esModule: true,
  default: ({ isOpen, message }: any) => <>{isOpen ? <span>{message}</span> : null}</>,
}));

vi.mock('../../components/DynamicTable/DynamicTable', () => ({
  DynamicTable: ({ rows, isLoading, isEmpty, onPaginationModelChange, onSortModelChange }: any) => (
    <div>
      <span data-testid="table-loading">{String(isLoading)}</span>
      <span data-testid="table-empty">{String(isEmpty)}</span>
      {rows?.map((row: any) => (
        <div key={row.gtinCode}>
          <span>{row.gtinCode}</span>
          <span>{row.brand}</span>
          <span data-testid={`row-link-${row.gtinCode}`}>{row.link}</span>
        </div>
      ))}
      <button data-testid="row-action" onClick={() => rows?.[0]?.action?.onClick(rows[0])}>
        Trigger Row Action
      </button>
      <button
        data-testid="change-pagination"
        onClick={() => onPaginationModelChange({ page: 2, pageSize: 20 })}
      >
        Change Pagination
      </button>
      <button
        data-testid="change-sort"
        onClick={() => onSortModelChange([{ field: 'brand', sort: 'asc' }])}
      >
        Change Sort
      </button>
    </div>
  ),
}));

describe('Products Component', () => {
  const mockApiResponse = {
    content: [
      {
        gtinCode: '111222333',
        productName: 'Mock Smartphone',
        productCode: 'P1',
        brand: 'MockBrand',
        category: 'TUMBLEDRYERS',
        linkEprel: 'http://eprel/1',
      },
    ],
    pageNo: 0,
    pageSize: 10,
    totalElements: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInitiativeProductsList).mockResolvedValue(mockApiResponse);
  });

  it('carica e mappa i prodotti, poi apre il drawer con titolo corretto', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('mock-initiative-123', {
        page: 0,
        size: 10,
        status: 'APPROVED',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('111222333')).toBeInTheDocument();
      expect(screen.getByText('MockBrand')).toBeInTheDocument();
      expect(screen.getByTestId('row-link-111222333')).toHaveTextContent('http://eprel/1');
      expect(screen.getByTestId('table-empty')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('drawer-title')).toHaveTextContent('undefined - undefined');

    fireEvent.click(screen.getByTestId('row-action'));

    await waitFor(() => {
      expect(screen.getByTestId('drawer-title')).toHaveTextContent('Mock Smartphone - P1');
      expect(screen.getByText('pages.products.drawer.subtitle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close-drawer'));

    await waitFor(() => {
      expect(screen.queryByText('pages.products.drawer.subtitle')).not.toBeInTheDocument();
    });
  });

  it('gestisce paginazione e sorting server-side', async () => {
    render(<Products />);

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('mock-initiative-123', {
        page: 0,
        size: 10,
        status: 'APPROVED',
      });
    });

    fireEvent.click(screen.getByTestId('change-pagination'));

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('mock-initiative-123', {
        page: 2,
        size: 20,
        status: 'APPROVED',
      });
    });

    fireEvent.click(screen.getByTestId('change-sort'));

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('mock-initiative-123', {
        page: 2,
        size: 20,
        sort: 'brand,asc',
        status: 'APPROVED',
      });
    });
  });

  it('resetta la pagina a 0 quando applica nuovi filtri', async () => {
    render(<Products />);

    fireEvent.click(screen.getByTestId('change-pagination'));
    fireEvent.click(screen.getByTestId('mock-filter-button'));

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith('mock-initiative-123', {
        page: 0,
        size: 20,
        category: 'OVENS',
        status: 'APPROVED',
      });
    });
  });

  it('mostra alert su errore e porta loading a false nel finally', async () => {
    vi.mocked(getInitiativeProductsList).mockRejectedValueOnce(new Error('API Error'));
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText('pages.products.errorAlert')).toBeInTheDocument();
      expect(screen.getByTestId('table-loading')).toHaveTextContent('false');
    });
  });

  it('apre il link esterno della lista prodotti', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({ focus: vi.fn() } as any);
    render(<Products />);

    fireEvent.click(screen.getByText('pages.products.productList'));

    expect(windowOpenSpy).toHaveBeenCalledWith(
      `${window.location.origin}/myinitiative/elenco-prodotti`,
      '_blank'
    );
  });
});