import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import Header from './Header';
import keycloak from '../../config/keycloak';
import { getPointOfSaleDetails } from '../../services/merchantService.ts';
import { jwtDecode } from 'jwt-decode';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../config/keycloak', () => ({
  default: {
    logout: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock('../../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({
    user: {
      merchant_id: 'merchant-123',
    },
  }),
}));

vi.mock('../../store/authStore.ts', () => ({
  authStore: vi.fn((selector) => selector({ token: 'mock-token-123' })),
}));

vi.mock('../../services/merchantService.ts', () => ({
  getPointOfSaleDetails: vi.fn(),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    point_of_sale_id: 'pos-123',
  })),
}));

vi.stubEnv('VITE_MANUAL_LINK', 'https://manual.example.com');
vi.stubEnv('VITE_ASSISTANCE', 'https://assistance.example.com');

vi.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: (props: any) => (
    <div data-testid="header-account">
      <a href={props.rootLink.href}>{props.rootLink.label}</a>
      <button onClick={props.onLogout}>Logout</button>
      <button onClick={props.onLogin}>Login</button>
      <button data-testid="documentation-button" onClick={props.onDocumentationClick}>
        Documentazione
      </button>
      <button data-testid="assistance-button" onClick={props.onAssistanceClick}>
        Assistenza
      </button>
    </div>
  ),
  HeaderProduct: (props: any) => {
    const selectedParty = props.partyList.find((p: any) => p.id === props.partyId);
    return (
      <div data-testid="header-product">
        <span data-testid="product-title">{props.productsList[0].title}</span>
        {selectedParty && <span data-testid="party-name">{selectedParty.name}</span>}
        <button data-testid="select-party-button">Select Party</button>
      </div>
    );
  },
}));

const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

beforeEach(() => {
  vi.clearAllMocks();
  windowOpenSpy.mockClear();
  (getPointOfSaleDetails as any).mockResolvedValue({
    franchiseName: 'Test Franchise',
  });
});

describe('Header Component - Basic Rendering', () => {
  it('should render HeaderAccount with logged user email', async () => {
    render(<Header />);

    const pagopaLink = screen.getByText('PagoPA S.p.A.');
    expect(pagopaLink).toBeInTheDocument();
    expect(pagopaLink).toHaveAttribute('href', 'https://www.pagopa.it/it/');
  });

  it('should render HeaderProduct with product title', async () => {
    render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId('product-title')).toHaveTextContent('commons.headerTitle');
    });
  });

  it('should have both HeaderAccount and HeaderProduct components in the document', () => {
    render(<Header />);

    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });
});

describe('Header Component - User Props vs useAuth', () => {
  it('should use loggedUser when provided', async () => {
    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });
});

describe('Header Component - Franchise Name Fetch', () => {
  it('should fetch and display franchise name when user and token are available', async () => {
    render(<Header />);

    await waitFor(() => {
      expect(getPointOfSaleDetails).toHaveBeenCalledWith('merchant-123', 'pos-123');
    });

    await waitFor(() => {
      expect(screen.getByTestId('party-name')).toHaveTextContent('Test Franchise');
    });
  });

  it('should use empty string when franchiseName is not returned', async () => {
    (getPointOfSaleDetails as any).mockResolvedValueOnce({});

    render(<Header />);

    await waitFor(() => {
      expect(getPointOfSaleDetails).toHaveBeenCalled();
    });

    await waitFor(() => {
      const partyName = screen.getByTestId('party-name');
      expect(partyName).toHaveTextContent('');
    });
  });

  it('should handle error when fetching point of sale details fails', async () => {
    (getPointOfSaleDetails as any).mockRejectedValueOnce(new Error('Fetch failed'));

    render(<Header />);

    await waitFor(() => {
      expect(getPointOfSaleDetails).toHaveBeenCalled();
    });

    await waitFor(() => {
      const partyName = screen.getByTestId('party-name');
      expect(partyName).toHaveTextContent('');
    });
  });
});

describe('Header Component - User Actions', () => {
  it('should call keycloak.logout when onLogout is triggered', async () => {
    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it('should open manual link when onDocumentationClick is triggered', async () => {
    render(<Header />);

    const documentationButton = screen.getByTestId('documentation-button');
    fireEvent.click(documentationButton);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://manual.example.com', '_blank');
  });

  it('should open assistance link when onAssistanceClick is triggered', async () => {
    render(<Header />);

    const assistanceButton = screen.getByTestId('assistance-button');
    fireEvent.click(assistanceButton);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://assistance.example.com', '_blank');
  });
});

describe('Header Component - JWT Decoding', () => {
  it('should decode JWT token correctly', async () => {
    render(<Header />);

    await waitFor(() => {
      expect(jwtDecode).toHaveBeenCalledWith('mock-token-123');
    });
  });
});

afterAll(() => {
  windowOpenSpy.mockRestore();
});