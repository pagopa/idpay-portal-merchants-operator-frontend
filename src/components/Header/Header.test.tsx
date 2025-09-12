import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';

// @pagopa/mui-italia mock 
vi.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: (props: any) => (
    <div data-testid="header-account">
      <span>{props.loggedUser.name} {props.loggedUser.surname}</span>
      <a href={props.rootLink.href}>{props.rootLink.label}</a>
      <button onClick={props.onLogout}>Logout</button>
    </div>
  ),
  HeaderProduct: (props: any) => {
    const selectedParty = props.partyList.find((p: any) => p.id === props.partyId);
    return (
      <div data-testid="header-product">
        <span>{props.productsList[0].title}</span>
        {selectedParty && <span>{selectedParty.name}</span>}
      </div>
    );
  },
}));

describe('Header Component', () => {
  it('should render HeaderAccount with logged user information', () => {
    render(<Header />);

    expect(screen.getByText('Mattia Rossi')).toBeInTheDocument();

    const pagopaLink = screen.getByText('PagoPA S.p.A.');
    expect(pagopaLink).toBeInTheDocument();
    expect(pagopaLink).toHaveAttribute('href', 'https://www.pagopa.it/it/');
  });

  it('should render HeaderProduct with product and selected party', () => {
    render(<Header />);

    expect(screen.getByText('Portale esercenti')).toBeInTheDocument();

    expect(screen.getByText('Euronics')).toBeInTheDocument();
  });

  it('should have both HeaderAccount and HeaderProduct components in the document', () => {
    render(<Header />);

    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });
});
