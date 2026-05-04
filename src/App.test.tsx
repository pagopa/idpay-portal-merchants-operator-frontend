import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ROUTES from './routes';

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

vi.mock('./pages/acceptDiscount/AcceptDiscount.tsx', () => ({
  default: () => <div>AcceptDiscountPage</div>,
}));
vi.mock('./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx', () => ({
  default: () => <div>SummaryAcceptDiscountPage</div>,
}));
vi.mock('./pages/refundManagement/RefundManagement.tsx', () => ({
  default: () => <div>RefundManagementPage</div>,
}));
vi.mock('./pages/purchaseManagement/PurchaseManagement.tsx', () => ({
  default: () => <div>PurchaseManagementPage</div>,
}));
vi.mock('./pages/profile/Profile.tsx', () => ({
  default: () => <div>ProfilePage</div>,
}));
vi.mock('./pages/products/Products.tsx', () => ({
  default: () => <div>ProductsPage</div>,
}));
vi.mock('./pages/reverse/Reverse.tsx', () => ({
  default: () => <div>ReversePage</div>,
}));
vi.mock('./pages/refund/Refund.tsx', () => ({
  default: () => <div>RefundPage</div>,
}));
vi.mock('./pages/privacyPolicy/PrivacyPolicy.tsx', () => ({
  default: () => <div>PrivacyPolicyPage</div>,
}));
vi.mock('./pages/tos/TOS.tsx', () => ({
  default: () => <div>TermsOfServicePage</div>,
}));
vi.mock('./pages/modifyDocument/ModifyDocument.tsx', () => ({
  default: () => <div>ModifyDocumentPage</div>,
}));

describe('App routing', () => {
  const renderWithRoute = (route: string) =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

  it('renders privacy policy (public)', () => {
    renderWithRoute(ROUTES.PRIVACY_POLICY);
    expect(screen.getByText('PrivacyPolicyPage')).toBeInTheDocument();
  });

  it('renders terms of service (public)', () => {
    renderWithRoute(ROUTES.TOS);
    expect(screen.getByText('TermsOfServicePage')).toBeInTheDocument();
  });

  it('redirects HOME to BUY_MANAGEMENT', () => {
    renderWithRoute(ROUTES.HOME);
    expect(screen.getByText('PurchaseManagementPage')).toBeInTheDocument();
  });

  it('renders accept discount', () => {
    renderWithRoute(ROUTES.ACCEPT_DISCOUNT);
    expect(screen.getByText('AcceptDiscountPage')).toBeInTheDocument();
  });

  it('renders accept discount summary', () => {
    renderWithRoute(ROUTES.ACCEPT_DISCOUNT_SUMMARY);
    expect(screen.getByText('SummaryAcceptDiscountPage')).toBeInTheDocument();
  });

  it('renders refunds management', () => {
    renderWithRoute(ROUTES.REFUNDS_MANAGEMENT);
    expect(screen.getByText('RefundManagementPage')).toBeInTheDocument();
  });

  it('renders buy management', () => {
    renderWithRoute(ROUTES.BUY_MANAGEMENT);
    expect(screen.getByText('PurchaseManagementPage')).toBeInTheDocument();
  });

  it('renders profile', () => {
    renderWithRoute(ROUTES.PROFILE);
    expect(screen.getByText('ProfilePage')).toBeInTheDocument();
  });

  it('renders products', () => {
    renderWithRoute(ROUTES.PRODUCTS);
    expect(screen.getByText('ProductsPage')).toBeInTheDocument();
  });

  it('renders reverse', () => {
    renderWithRoute(ROUTES.REVERSE);
    expect(screen.getByText('ReversePage')).toBeInTheDocument();
  });

  it('renders refund', () => {
    renderWithRoute(ROUTES.REFUND);
    expect(screen.getByText('RefundPage')).toBeInTheDocument();
  });

  it('renders modify document', () => {
    renderWithRoute(ROUTES.MODIFY_DOCUMENT);
    expect(screen.getByText('ModifyDocumentPage')).toBeInTheDocument();
  });

  it('redirects unknown route to BUY_MANAGEMENT', () => {
    renderWithRoute('/unknown');
    expect(screen.getByText('PurchaseManagementPage')).toBeInTheDocument();
  });
});
