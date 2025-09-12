import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ROUTES from './routes';

vi.mock('./components/Layout/Layout', () => ({
  default: ({ children }) => <div data-testid="mock-layout">{children}</div>,
}));
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }) => <div data-testid="mock-protected-route">{children}</div>,
}));
vi.mock('./pages/refundManagement/RefundManagement.tsx', () => ({
  default: () => <div data-testid="refund-management-page">Refund Management</div>,
}));
vi.mock('./pages/acceptDiscount/AcceptDiscount.tsx', () => ({
  default: () => <div data-testid="accept-discount-page">Accept Discount</div>,
}));
vi.mock('./pages/summaryAcceptDiscount/SummaryAcceptDiscount.tsx', () => ({
  default: () => <div data-testid="summary-accept-discount-page">Summary Accept Discount</div>,
}));
vi.mock('./pages/purchaseManagement/PurchaseManagement.tsx', () => ({
  default: () => <div data-testid="purchase-management-page">Purchase Management</div>,
}));

describe('App Component', () => {

  it('renders the ProtectedRoute and Layout wrappers', () => {
    // Render the App component wrapped in MemoryRouter to simulate routing.
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Check if the mock wrapper components are present in the document.
    expect(screen.getByTestId('mock-protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
  });

  it('renders the RefundManagement component on the home route', () => {
    // Render the component on the home path.
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Check if the mocked RefundManagement component is rendered.
    expect(screen.getByTestId('refund-management-page')).toBeInTheDocument();
  });

  it('renders the AcceptDiscount component on the correct route', () => {
    // Render the component on the accept discount path.
    render(
      <MemoryRouter initialEntries={[ROUTES.ACCEPT_DISCOUNT]}>
        <App />
      </MemoryRouter>
    );

    // Check if the mocked AcceptDiscount component is rendered.
    expect(screen.getByTestId('accept-discount-page')).toBeInTheDocument();
  });

  it('renders the SummaryAcceptDiscount component on the correct route', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.ACCEPT_DISCOUNT_SUMMARY]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('summary-accept-discount-page')).toBeInTheDocument();
  });

  it('renders the PurchaseManagement component on the correct route', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.BUY_MANAGEMENT]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('purchase-management-page')).toBeInTheDocument();
  });
});
