import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ROUTES from './routes';
import { useAppSelector } from './redux/hooks';
import { getInitiativesList } from './services/merchantService';
import { useAuth } from './contexts/AuthContext';

vi.mock('./contexts/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./locale/index.ts', () => ({
  initI18n: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./utils/helpers.tsx', () => ({
  buildNamespaceKey: vi.fn().mockReturnValue('mock-namespace-key'),
}));

const mockInitiatives = [
  { intiativeId: 'Init-1', initiativeName: 'Bonus Elettrodomestici', startDate: '2025' }
];

const mockDispatch = vi.fn();
vi.mock('./redux/hooks.ts', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: () => mockDispatch,
}));

vi.mock('./services/merchantService.ts', () => ({
  getInitiativesList: vi.fn(),
}));

vi.mock('./redux/slices/initiativesSlice.ts', () => ({
  setInitiativesList: vi.fn((data) => ({ type: 'SET_INITIATIVES', payload: data })),
  initiativesListSelector: vi.fn(),
  currentInitiativeSelector: vi.fn(),
}));

vi.mock('./decorators/WithInitiativeGuard.tsx', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./components/Layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected">{children}</div>
  ),
}));

vi.mock('./pages/initiativesList/InitiativesList', () => ({
  InitiativesList: () => <div>InitiativesListPage</div>,
}));
vi.mock('./pages/acceptDiscount/AcceptDiscount.tsx', () => ({ default: () => <div>AcceptDiscountPage</div> }));
vi.mock('./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx', () => ({ default: () => <div>SummaryAcceptDiscountPage</div> }));
vi.mock('./pages/refundManagement/RefundManagement.tsx', () => ({ default: () => <div>RefundManagementPage</div> }));
vi.mock('./pages/purchaseManagement/PurchaseManagement.tsx', () => ({ default: () => <div>PurchaseManagementPage</div> }));
vi.mock('./pages/profile/Profile.tsx', () => ({ default: () => <div>ProfilePage</div> }));
vi.mock('./pages/products/Products.tsx', () => ({ default: () => <div>ProductsPage</div> }));
vi.mock('./pages/reverse/Reverse.tsx', () => ({ default: () => <div>ReversePage</div> }));
vi.mock('./pages/refund/Refund.tsx', () => ({ default: () => <div>RefundPage</div> }));
vi.mock('./pages/privacyPolicy/PrivacyPolicy.tsx', () => ({ default: () => <div>PrivacyPolicyPage</div> }));
vi.mock('./pages/tos/TOS.tsx', () => ({ default: () => <div>TermsOfServicePage</div> }));
vi.mock('./pages/modifyDocument/ModifyDocument.tsx', () => ({ default: () => <div>ModifyDocumentPage</div> }));

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'fake-jwt-token',
    } as any);

    vi.mocked(getInitiativesList).mockResolvedValue({ initiatives: mockInitiatives });
    vi.mocked(useAppSelector).mockReturnValue(mockInitiatives);
  });

  const renderWithRoute = (route: string) =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

  it('should render loading state initially', () => {
    renderWithRoute(ROUTES.INITIATIVES_LIST);
    expect(screen.getByText('Caricamento iniziative...')).toBeInTheDocument();
  });

  it('should render initiativesList', async () => {
    renderWithRoute(ROUTES.INITIATIVES_LIST);
    expect(await screen.findByText('InitiativesListPage')).toBeInTheDocument();
  });

  it('renders privacy policy (public)', async () => {
    renderWithRoute(ROUTES.PRIVACY_POLICY);
    expect(await screen.findByText('PrivacyPolicyPage')).toBeInTheDocument();
  });

  it('renders terms of service (public)', async () => {
    renderWithRoute(ROUTES.TOS);
    expect(await screen.findByText('TermsOfServicePage')).toBeInTheDocument();
  });

  it('redirects HOME to INITIATIVES_LIST', async () => {
    renderWithRoute(ROUTES.HOME);
    expect(await screen.findByText('InitiativesListPage')).toBeInTheDocument();
  });

  it('renders accept discount', async () => {
    renderWithRoute(ROUTES.ACCEPT_DISCOUNT);
    expect(await screen.findByText('AcceptDiscountPage')).toBeInTheDocument();
  });

  it('renders accept discount summary', async () => {
    renderWithRoute(ROUTES.ACCEPT_DISCOUNT_SUMMARY);
    expect(await screen.findByText('SummaryAcceptDiscountPage')).toBeInTheDocument();
  });

  it('renders refunds management', async () => {
    renderWithRoute(ROUTES.REFUNDS_MANAGEMENT);
    expect(await screen.findByText('RefundManagementPage')).toBeInTheDocument();
  });

  it('renders buy management', async () => {
    renderWithRoute(ROUTES.BUY_MANAGEMENT);
    expect(await screen.findByText('PurchaseManagementPage')).toBeInTheDocument();
  });

  it('renders profile', async () => {
    renderWithRoute(ROUTES.PROFILE);
    expect(await screen.findByText('ProfilePage')).toBeInTheDocument();
  });

  it('renders products', async () => {
    renderWithRoute(ROUTES.PRODUCTS);
    expect(await screen.findByText('ProductsPage')).toBeInTheDocument();
  });

  it('renders reverse', async () => {
    renderWithRoute(ROUTES.REVERSE);
    expect(await screen.findByText('ReversePage')).toBeInTheDocument();
  });

  it('renders refund', async () => {
    renderWithRoute(ROUTES.REFUND);
    expect(await screen.findByText('RefundPage')).toBeInTheDocument();
  });

  it('renders modify document', async () => {
    renderWithRoute(ROUTES.MODIFY_DOCUMENT);
    expect(await screen.findByText('ModifyDocumentPage')).toBeInTheDocument();
  });

  it('redirects unknown route to INITIATIVES_LIST', async () => {
    renderWithRoute('/unknown');
    expect(await screen.findByText('InitiativesListPage')).toBeInTheDocument();
  });
});