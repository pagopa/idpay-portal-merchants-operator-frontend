import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';

// Mock the pagopa components to isolate Header component logic.
vi.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: (props) => (
    <div data-testid="header-account">
      <span>{props.loggedUser.name} {props.loggedUser.surname}</span>
      <a href={props.rootLink.href}>{props.rootLink.label}</a>
      <button onClick={props.onLogout}>Logout</button>
    </div>
  ),
  HeaderProduct: (props) => {
    const selectedParty = props.partyList.find((p) => p.id === props.partyId);
    return (
      <div data-testid="header-product">
        <span>{props.productsList[0].title}</span>
        {selectedParty && <span>{selectedParty.name}</span>}
      </div>
    );
  },
}));

// Define the mock context value to be used in all tests.
const mockAuthContextValue = {
  isAuthenticated: true,
  user: {
    firstName: 'Mattia',
    lastName: 'Rossi',
    email: 'm.rossi@example.com',
    uid: 'test-user-id'
  },
  token: 'mock-token',
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  productsList: [{ title: 'Bonus Elettrodomestici' }],
  partyList: [{ id: '1', name: 'Euronics' }],
  partyId: '1',
};

// Helper function to render the Header component wrapped with AuthProvider.
const renderWithAuth = () => {
  return render(
      <Header userProps={mockAuthContextValue.user} />
  );
};

describe('Header Component', () => {
  it('should render HeaderAccount with logged user information', () => {
    renderWithAuth();

    expect(screen.getByText('Mattia Rossi')).toBeInTheDocument();

    const pagopaLink = screen.getByText('PagoPA S.p.A.');
    expect(pagopaLink).toBeInTheDocument();
    expect(pagopaLink).toHaveAttribute('href', 'https://www.pagopa.it/it/');
  });

  it('should render HeaderProduct with product and selected party', () => {
    renderWithAuth();

    expect(screen.getByText('Bonus Elettrodomestici')).toBeInTheDocument();
    expect(screen.getByText('Comet S.P.A.')).toBeInTheDocument();
  });

  it('should have both HeaderAccount and HeaderProduct components in the document', () => {
    renderWithAuth();

    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });
});
