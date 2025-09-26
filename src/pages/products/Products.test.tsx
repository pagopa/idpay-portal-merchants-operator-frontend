import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Products from './Products'; 

// --- Mocks ---

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.products.title': 'Prodotti',
        'pages.products.subtitle': 'Visualizza i prodotti approvati',
        'pages.products.noProducts': 'Nessun prodotto trovato.',
        'pages.products.errorAlert': 'Errore nel recupero dei prodotti.',
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

vi.mock('../../components/FiltersForm/FiltersForm', () => ({
    default: ({ onFiltersApplied, onFiltersReset, children }: any) => (
        <form data-testid="filters-form">
            {children}
            <button data-testid="apply-filters-button" onClick={() => onFiltersApplied({ brand: 'Test Brand' })}>Applica</button>
            <button data-testid="reset-filters-button" onClick={() => onFiltersReset()}>Resetta</button>
        </form>
    ),
}));

vi.mock('../../components/DataTable/DataTable', () => ({
  default: ({ rows, columns, handleRowAction }: any) => (
    <div data-testid="data-table">
      <span data-testid="rows-count">{rows.length}</span>
      <span data-testid="columns-count">{columns.length}</span>
      {rows.map((row: any) => (
         <div data-testid={`row-${row.gtinCode}`} key={row.gtinCode} onClick={() => handleRowAction(row)}>
            <div data-testid={`cell-brand-${row.gtinCode}`}>{columns[1].renderCell({ value: row.brand })}</div>
            <div data-testid={`cell-model-${row.gtinCode}`}>{columns[2].renderCell({ value: row.model })}</div>
         </div>
      ))}
      <button data-testid="trigger-pagination" onClick={() => mockGetProductsList({ page: 1, pageSize: 10 }) }>Next Page</button>
      <button data-testid="trigger-sort" onClick={() => mockGetProductsList({ sort: 'brand,asc' })}>Sort by Brand</button>
    </div>
  ),
}));

vi.mock('../../components/Alert/AlertComponent', () => ({
    default: ({ message }: { message: string }) => <div data-testid="alert-component">{message}</div>,
}));

vi.stubEnv('VITE_PAGINATION_SIZE', '10');

const mockGetProductsList = vi.fn();
vi.mock('../../services/merchantService', () => ({
  getProductsList: (params: any) => mockGetProductsList(params),
}));



const mockProducts = [
    { category: 'WASHINGMACHINES', brand: 'Brand A', model: 'Model X', gtinCode: '12345', eprelCode: 'EPREL1', productName: 'Lavatrice Brand A' },
    { category: 'OVENS', brand: 'Brand B', model: 'Model Y', gtinCode: '67890', eprelCode: 'EPREL2', productName: 'Forno Brand B' },
];
const mockApiResponse = { content: mockProducts, page: 0, pageSize: 10, totalElements: 2 };


const renderComponent = () => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <Products />
    </ThemeProvider>
  );
};

describe('Products Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner on initial load', () => {
    mockGetProductsList.mockReturnValue(new Promise(() => {})); 
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render title and subtitle', async () => {
    mockGetProductsList.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Prodotti')).toBeInTheDocument();
    expect(screen.getByText('Visualizza i prodotti approvati')).toBeInTheDocument();
  });
  
  it('should fetch and display products correctly in the table', async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();

    await screen.findByTestId('data-table');

    expect(mockGetProductsList).toHaveBeenCalledTimes(1);
    expect(mockGetProductsList).toHaveBeenCalledWith({ size: '10', status: 'APPROVED' });

    expect(screen.getByTestId('rows-count')).toHaveTextContent('2');
    expect(screen.getByTestId('columns-count')).toHaveTextContent('5');
    
    const firstRowBrand = screen.getByTestId('cell-brand-12345');
    expect(firstRowBrand).toHaveTextContent('Brand A');
    
    const secondRowModel = screen.getByTestId('cell-model-67890');
    expect(secondRowModel).toHaveTextContent('Model Y');
  });

  it('should display a "no products" message if fetch returns an empty list', async () => {
    mockGetProductsList.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });
    renderComponent();
    
    await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Nessun prodotto trovato.')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('should handle errors during product fetch', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetProductsList.mockRejectedValue(new Error('API Error'));
    renderComponent();

    await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('alert-component')).toHaveTextContent('Errore nel recupero dei prodotti.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching products:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should call fetchProducts with new pagination values', async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId('data-table');
    
    const paginationButton = screen.getByTestId('trigger-pagination');
    fireEvent.click(paginationButton);

    await waitFor(() => {
        expect(mockGetProductsList).toHaveBeenCalledTimes(2);
        expect(mockGetProductsList).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 });
    });
  });

  it('should call fetchProducts with proper sort when sorting by a column', async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId('data-table');

    const sortButton = screen.getByTestId('trigger-sort');
    fireEvent.click(sortButton);

    await waitFor(() => {
        expect(mockGetProductsList).toHaveBeenCalledTimes(2);
        expect(mockGetProductsList).toHaveBeenLastCalledWith(expect.objectContaining({
            sort: 'brand,asc'
        }));
    });
  });

  it('should call fetchProducts with filters when filters are applied', async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId('data-table');
    
    const applyFiltersButton = screen.getByTestId('apply-filters-button');
    fireEvent.click(applyFiltersButton);
    
    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(2);
      expect(mockGetProductsList).toHaveBeenLastCalledWith(expect.objectContaining({
          brand: 'Test Brand'
      }));
    });
  });

  it('should open and close the drawer on row click', async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();
    await screen.findByTestId('data-table');

    const firstRow = screen.getByTestId('row-12345');
    await user.click(firstRow);
    
    await screen.findByText('Lavatrice Brand A');
    expect(screen.getByText('EPREL1')).toBeInTheDocument();

    const closeButton = screen.getByTestId('CloseIcon');
    await user.click(closeButton);

    await waitFor(() => {
        expect(screen.queryByText('Lavatrice Brand A')).not.toBeInTheDocument();
    });
  });
});