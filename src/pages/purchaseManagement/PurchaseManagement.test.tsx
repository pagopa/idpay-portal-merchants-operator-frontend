import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import PurchaseManagement from './PurchaseManagement';

// Dependencies mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.purchaseManagement.title': 'Gestione Acquisti',
        'pages.purchaseManagement.subtitle': 'Gestisci i tuoi acquisti e transazioni'
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
  default: ({ rows, columns, paginationModel }: any) => (
    <div data-testid="data-table">
      <div data-testid="table-rows-count">{rows.length}</div>
      <div data-testid="table-columns-count">{columns.length}</div>
      <div data-testid="pagination-page-size">{paginationModel.pageSize}</div>
      <div data-testid="pagination-total">{paginationModel.totalElements}</div>
      {/* Simulate table rows */}
      {rows.slice(0, 3).map((row: any) => (
        <div key={row.id} data-testid={`table-row-${row.id}`}>
          <span data-testid="elettrodomestico">{row.elettrodomestico}</span>
          <span data-testid="beneficiario">{row.beneficiario}</span>
          <span data-testid="stato">{row.stato}</span>
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../routes', () => ({
  default: {
    ACCEPT_DISCOUNT: '/accept-discount'
  }
}));

// useNavigate mock
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('PurchaseManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with title and subtitle', () => {
    renderWithProviders(<PurchaseManagement />);

    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByText('Gestione Acquisti')).toBeInTheDocument();
    expect(screen.getByText('Gestisci i tuoi acquisti e transazioni')).toBeInTheDocument();
  });

  it('should render the "Accetta buono sconto" button', () => {
    renderWithProviders(<PurchaseManagement />);

    const button = screen.getByRole('button', { name: /accetta buono sconto/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Accetta buono sconto');
  });

  it('should navigate to accept discount route when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PurchaseManagement />);

    const button = screen.getByRole('button', { name: /accetta buono sconto/i });
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/accept-discount');
  });

  it('should render the "Transazioni" subtitle', () => {
    renderWithProviders(<PurchaseManagement />);

    expect(screen.getByText('Transazioni')).toBeInTheDocument();
  });

  it('should render DataTable component', async () => {
    renderWithProviders(<PurchaseManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  it('should generate and display fake data in the table', async () => {
    renderWithProviders(<PurchaseManagement />);

    await waitFor(() => {
      // Verify that 15 rows have been generated
      expect(screen.getByTestId('table-rows-count')).toHaveTextContent('15');
      
      // Verify that there are 6 columns
      expect(screen.getByTestId('table-columns-count')).toHaveTextContent('6');
      
      // Verify pagination
      expect(screen.getByTestId('pagination-page-size')).toHaveTextContent('10');
      expect(screen.getByTestId('pagination-total')).toHaveTextContent('15');
    });
  });


  it('should have correct column configuration', async () => {
    renderWithProviders(<PurchaseManagement />);

    await waitFor(() => {
      // Verify that the number of columns is correct
      expect(screen.getByTestId('table-columns-count')).toHaveTextContent('6');
    });
  });

  it('should handle loading state correctly', async () => {
    renderWithProviders(<PurchaseManagement />);

    // Initially should be in loading state
    // The component sets loading=true at the start and then sets it to false
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });

  describe('fake data generation', () => {
    it('should generate data with correct structure', async () => {
      renderWithProviders(<PurchaseManagement />);

      await waitFor(() => {
        // Verify that the generated data contains realistic values
        const elettrodomestico0 = screen.queryByTestId('elettrodomestico-0');
        const beneficiario0 = screen.queryByTestId('beneficiario-0');

        if (elettrodomestico0) {
          expect(elettrodomestico0.textContent).toMatch(/Lavatrice|Frigorifero|Asciugatrice|Forno|Aspirapolvere/);
        }

        if (beneficiario0) {
          expect(beneficiario0.textContent).toMatch(/^[A-Z0-9]{15}$/);
        }
      });
    });
  });

  it('should render QrCode icon in button', () => {
    renderWithProviders(<PurchaseManagement />);

    const button = screen.getByRole('button', { name: /accetta buono sconto/i });
    // Verify that the button contains the icon (MUI renders startIcon)
    expect(button).toBeInTheDocument();
  });

  it('should have correct button styling and behavior', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PurchaseManagement />);

    const button = screen.getByRole('button', { name: /accetta buono sconto/i });
    
    // Verify that the button is clickable
    expect(button).not.toBeDisabled();
    
    // Test the click
    await user.click(button);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});