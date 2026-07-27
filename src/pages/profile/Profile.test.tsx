import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { useAuth } from '../../contexts/AuthContext';
import { authStore } from '../../store/authStore';
import { getPointOfSaleDetails } from '../../services/merchantService';
import { jwtDecode } from 'jwt-decode';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock('../../contexts/AuthContext');
vi.mock('../../store/authStore');
vi.mock('../../services/merchantService');
vi.mock('jwt-decode');

vi.mock('../../components/DetailsCard/DetailsCard', () => ({
  default: ({
    title,
    item,
  }: {
    title: string;
    item: Record<string, string>;
  }) => (
    <div data-testid={`details-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <h3>{title}</h3>
      <pre>{JSON.stringify(item)}</pre>
    </div>
  ),
}));

vi.mock('../../components/Alert/AlertComponent', () => ({
  default: ({
    message,
    isOpen,
  }: {
    message: string;
    isOpen: boolean;
  }) =>
    isOpen ? <div data-testid="alert-component">{message}</div> : null,
}));

const mockToken = 'mock-jwt-token';
const mockUserId = 'merchant-123';
const mockPointOfSaleId = 'pos-456';

const mockDecodedToken = {
  point_of_sale_id: mockPointOfSaleId,
};

const mockUserDetails = {
  isAuthenticated: true,
  user: {
    merchant_id: mockUserId,
  },
  token: mockToken,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
} as ReturnType<typeof useAuth>;

const mockAuthState = {
  token: mockToken,
  isAuthenticated: true,
  user: mockUserDetails.user,
  logoutFn: null,
  setJwtToken: vi.fn(),
  setLogout: vi.fn(),
  executeLogout: vi.fn(),
  setUser: vi.fn(),
  clearToken: vi.fn(),
} as ReturnType<typeof authStore.getState>;

const mockResponse = {
  id: 'POS123',
  address: 'Via Test 1',
  zipCode: '00100',
  city: 'Roma',
  province: 'RM',
  channelPhone: '06123456',
  channelEmail: 'vendita@test.it',
  contactName: 'Mario',
  contactSurname: 'Rossi',
  contactEmail: 'contatto@test.it',
};

const mockUseAuth = vi.mocked(useAuth);
const mockGetState = vi.mocked(authStore.getState);
const mockJwtDecode = vi.mocked(jwtDecode);
const mockGetPointOfSaleDetails = vi.mocked(getPointOfSaleDetails);

beforeEach(() => {
  vi.useRealTimers();

  mockUseAuth.mockReturnValue(mockUserDetails);
  mockGetState.mockReturnValue(mockAuthState);
  mockJwtDecode.mockReturnValue(mockDecodedToken);
  mockGetPointOfSaleDetails.mockResolvedValue(mockResponse);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Profile Component (Vitest)', () => {
  it('should show loading spinner', () => {
    render(<Profile />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should call API, map data and show DetailsCards', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId('details-cards')).toBeInTheDocument();
    });

    expect(jwtDecode).toHaveBeenCalledWith(mockToken);
    expect(getPointOfSaleDetails).toHaveBeenCalledWith(mockUserId, mockPointOfSaleId);

    expect(screen.getByTestId('details-card-dati-punto-vendita')).toBeInTheDocument();
    expect(screen.getByTestId('details-card-dati-referente')).toBeInTheDocument();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should show AlertComponent in case of API error', async () => {
    const mockError = new Error('API Error Test');
    mockGetPointOfSaleDetails.mockRejectedValue(mockError);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByTestId('alert-component')).toBeInTheDocument();
    });
  });

  it('should format an address with SNC without the N. prefix', async () => {
    mockGetPointOfSaleDetails.mockResolvedValue({
      ...mockResponse,
      streetNumber: 'SNC',
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId('details-cards')).toBeInTheDocument();
    });

    expect(screen.getByTestId('details-card-dati-punto-vendita')).toHaveTextContent(
      'Via Test 1 SNC, 00100 Roma (RM)'
    );
    expect(screen.getByTestId('details-card-dati-punto-vendita')).not.toHaveTextContent(
      'N. SNC'
    );
  });

  it('should hide the error alert after five seconds', async () => {
    vi.useFakeTimers();
    mockGetPointOfSaleDetails.mockRejectedValue(new Error('API Error Test'));

    render(<Profile />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('alert-component')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByTestId('alert-component')).not.toBeInTheDocument();
  });

  it('should handle API returning empty fields', async () => {
    const emptyResponse = {
      id: null,
      address: null,
      zipCode: null,
      city: null,
      province: null,
      channelPhone: null,
      channelEmail: null,
      contactName: null,
      contactSurname: null,
      contactEmail: null,
    };
    mockGetPointOfSaleDetails.mockResolvedValue(
      emptyResponse as unknown as Awaited<ReturnType<typeof getPointOfSaleDetails>>
    );

    render(<Profile />);

    await waitFor(() => expect(screen.getByTestId('details-cards')).toBeInTheDocument());

    const firstCard = screen.getByTestId('details-card-dati-punto-vendita');
    expect(firstCard).toHaveTextContent('ID univoco":""');

    const secondCard = screen.getByTestId('details-card-dati-referente');
    expect(secondCard).toHaveTextContent('Nome":""');
    expect(secondCard).toHaveTextContent('Cognome":""');
    expect(secondCard).toHaveTextContent('Email":""');
  });
});
